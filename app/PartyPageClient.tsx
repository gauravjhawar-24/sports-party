"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { InviteCardPreview } from "./HomeClient";

type Decision = "in" | "maybe" | "out";

const decisionLabels: Record<Decision, string> = {
  in: "I'm in",
  maybe: "Maybe",
  out: "Out"
};
const clientIdKey = "findmyscreen-client-id";

export function PartyPageClient({ partyId }: { partyId: string }) {
  const [name, setName] = useState("");
  const [decision, setDecision] = useState<Decision>("in");
  const [clientId, setClientId] = useState("");
  const [isHostDevice, setIsHostDevice] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const partyData = useQuery(api.actions.watchPartyWithRsvps, { partyId: partyId as Id<"watchParties"> });
  const submitRsvp = useMutation(api.actions.submitWatchPartyRsvp);

  const grouped = useMemo(() => {
    const empty: Record<Decision, string[]> = { in: [], maybe: [], out: [] };
    for (const rsvp of partyData?.rsvps ?? []) {
      empty[rsvp.decision].push(rsvp.isHost ? `${rsvp.name} (host)` : rsvp.name);
    }
    return empty;
  }, [partyData?.rsvps]);
  const currentDeviceRsvp = useMemo(() => {
    if (!clientId) return null;
    return partyData?.rsvps.find((rsvp) => rsvp.clientId === clientId) ?? null;
  }, [clientId, partyData?.rsvps]);

  useEffect(() => {
    const nextClientId = getOrCreateClientId();
    setClientId(nextClientId);
    setIsHostDevice(window.localStorage.getItem(`findmyscreen-host-party:${partyId}`) === "true");
  }, [partyId]);

  useEffect(() => {
    if (!currentDeviceRsvp || name) return;
    setName(currentDeviceRsvp.name);
    setDecision(currentDeviceRsvp.decision);
  }, [currentDeviceRsvp, name]);

  if (partyData === undefined) {
    return (
      <main className="race-shell">
        <section className="party-page">
          <p className="action-status">Loading watch party...</p>
        </section>
      </main>
    );
  }

  if (partyData === null) {
    return (
      <main className="race-shell">
        <section className="party-page">
          <header className="result-topbar">
            <Link href="/f1">Find another screening</Link>
          </header>
          <div className="pit-message">
            <strong>This watch party link is not working.</strong>
            <p>Ask the host to create a fresh link.</p>
          </div>
        </section>
      </main>
    );
  }

  const { party } = partyData;
  const partyUrl = typeof window === "undefined" ? "" : window.location.href;
  const venueForCard = {
    name: party.venueName,
    area: party.venueArea,
    evidenceTag: party.venueEvidenceTag
  };

  async function copyPartyLink() {
    if (!partyUrl) return;
    await navigator.clipboard.writeText(partyUrl);
    setStatus("Watch-party link copied.");
  }

  async function sharePartyLink() {
    if (!partyUrl) return;
    if (navigator.share) {
      await navigator.share({
        title: `${party.raceName} watch party`,
        text: `${party.raceName} at ${party.venueName}. RSVP here:`,
        url: partyUrl
      });
      return;
    }
    await copyPartyLink();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Enter your name to RSVP.");
      return;
    }

    if (trimmedName.length > 60) {
      setError("Keep the name under 60 characters.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await submitRsvp({
        partyId: party._id,
        name: trimmedName,
        clientId,
        decision
      });

      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_watch_party_rsvp", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
          decision
        });
      }

      setStatus("RSVP saved.");
      setName("");
    } catch {
      setError("Could not save your RSVP. Try once more.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="race-shell">
      <section className="party-page">
        <header className="result-topbar">
          <Link href="/f1">Find another screening</Link>
          <div>
            <span>Watch party</span>
            <strong>{party.venueName}</strong>
          </div>
        </header>

        <div className="party-grid">
          <section className="party-main">
            <InviteCardPreview venue={venueForCard} />
          </section>

          <aside className="party-side">
            <div className="party-share-box">
              <label htmlFor="party-link">Share this link with friends</label>
              <div>
                <input id="party-link" value={partyUrl} readOnly />
                <button type="button" onClick={() => void copyPartyLink()}>Copy</button>
                <button type="button" onClick={() => void sharePartyLink()}>Share</button>
              </div>
            </div>

            <div className="party-summary">
              <span>{party.venueEvidenceTag}</span>
              <h1>{party.venueName}</h1>
              <p>{party.venueArea}</p>
              <div className="party-venue-actions">
                {party.venuePhone && party.venuePhone !== "Needs call" ? (
                  <a href={`tel:${party.venuePhone}`}>Call pub</a>
                ) : (
                  <span>Phone number needs a fresh check</span>
                )}
                <a href={party.mapUrl} target="_blank" rel="noreferrer">Open map</a>
              </div>
            </div>

            {isHostDevice ? (
              <div className="host-rsvp-lock">
                <span>Host view</span>
                <strong>You are already counted as I'm in.</strong>
                <p>Share this link with friends and watch the group status below.</p>
              </div>
            ) : (
              <RsvpForm
                currentDecision={currentDeviceRsvp?.decision}
                decision={decision}
                error={error}
                isSaving={isSaving}
                name={name}
                onDecisionChange={setDecision}
                onNameChange={setName}
                onSubmit={submit}
              />
            )}
            <a className="party-scroll-cue" href="#party-rsvps">
              Scroll down to see who is in, maybe, and out
            </a>
            {status ? <p className="action-status">{status}</p> : null}
          </aside>
        </div>

        <RsvpStats grouped={grouped} />
      </section>
    </main>
  );
}

function RsvpForm({
  currentDecision,
  decision,
  error,
  isSaving,
  name,
  onDecisionChange,
  onNameChange,
  onSubmit
}: {
  currentDecision?: Decision;
  decision: Decision;
  error: string;
  isSaving: boolean;
  name: string;
  onDecisionChange: (decision: Decision) => void;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="rsvp-form" onSubmit={onSubmit}>
      <span>RSVP</span>
      <h2>Are you coming?</h2>
      <p className="rsvp-hint">
        {currentDecision
          ? `You already said ${decisionLabels[currentDecision]}. Submit again to update it.`
          : "Vote here. Scroll down after voting to see who is in, maybe, and out."}
      </p>
      <input
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Your name"
        maxLength={60}
      />
      <div className="rsvp-buttons">
        {(Object.keys(decisionLabels) as Decision[]).map((item) => (
          <button
            className={decision === item ? "selected" : ""}
            key={item}
            type="button"
            onClick={() => onDecisionChange(item)}
          >
            {decisionLabels[item]}
          </button>
        ))}
      </div>
      {error ? <p className="email-error">{error}</p> : null}
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Submit RSVP"}
      </button>
    </form>
  );
}

function RsvpStats({ grouped }: { grouped: Record<Decision, string[]> }) {
  const rows = (Object.keys(decisionLabels) as Decision[]).map((item) => ({
    decision: decisionLabels[item],
    count: grouped[item].length,
    names: grouped[item].length ? grouped[item].join(", ") : "No one yet"
  }));

  return (
    <section className="rsvp-stats" id="party-rsvps" aria-label="Watch party RSVP stats">
      <h2>Group status</h2>
      <div className="rsvp-table-wrap">
        <table className="rsvp-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>People</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.decision}>
                <td data-label="Status">{row.decision}</td>
                <td data-label="Count">{row.count}</td>
                <td data-label="People">{row.names}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getOrCreateClientId() {
  const existing = window.localStorage.getItem(clientIdKey);
  if (existing) return existing;

  const nextId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(clientIdKey, nextId);
  return nextId;
}
