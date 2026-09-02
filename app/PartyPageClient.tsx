"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";

type Decision = "in" | "maybe" | "out";

const decisionLabels: Record<Decision, string> = {
  in: "I'm in",
  maybe: "Maybe",
  out: "Out",
};
const clientIdKey = "findmyscreen-client-id";

export function PartyPageClient({
  partyId,
  inviteCode,
}: {
  partyId?: string;
  inviteCode?: string;
}) {
  const [name, setName] = useState("");
  const [decision, setDecision] = useState<Decision>("in");
  const [clientId, setClientId] = useState("");
  const [isHostDevice, setIsHostDevice] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localSavedRsvp, setLocalSavedRsvp] = useState<{
    name: string;
    decision: Decision;
  } | null>(null);
  const [showBookingInterest, setShowBookingInterest] = useState(false);
  const [bookingInterestStatus, setBookingInterestStatus] = useState("");
  const [isSavingBookingInterest, setIsSavingBookingInterest] = useState(false);
  const partyById = useQuery(
    api.actions.watchPartyWithRsvps,
    partyId ? { partyId: partyId as Id<"watchParties"> } : "skip",
  );
  const partyByCode = useQuery(
    api.actions.watchPartyWithRsvpsByInviteCode,
    inviteCode ? { inviteCode } : "skip",
  );
  const partyData = partyId ? partyById : partyByCode;
  const submitRsvp = useMutation(api.actions.submitWatchPartyRsvp);
  const recordBookingInterest = useMutation(api.actions.recordBookingInterest);

  const grouped = useMemo(() => {
    const empty: Record<Decision, Doc<"rsvps">[]> = {
      in: [],
      maybe: [],
      out: [],
    };
    for (const rsvp of partyData?.rsvps ?? []) {
      empty[rsvp.decision].push(rsvp);
    }
    return empty;
  }, [partyData?.rsvps]);
  const currentDeviceRsvp = useMemo(() => {
    if (!clientId) return null;
    return partyData?.rsvps.find((rsvp) => rsvp.clientId === clientId) ?? null;
  }, [clientId, partyData?.rsvps]);
  const visibleDeviceRsvp = currentDeviceRsvp ?? localSavedRsvp;

  useEffect(() => {
    const nextClientId = getOrCreateClientId();
    setClientId(nextClientId);
  }, []);

  useEffect(() => {
    const party = partyData?.party;
    if (!party) return;

    const isHostById =
      window.localStorage.getItem(`findmyscreen-host-party:${party._id}`) ===
      "true";
    const isHostByCode = party.inviteCode
      ? window.localStorage.getItem(
          `findmyscreen-host-party-code:${party.inviteCode}`,
        ) === "true"
      : false;
    setIsHostDevice(isHostById || isHostByCode);
  }, [partyData?.party]);

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
  const partyUrl =
    typeof window === "undefined"
      ? ""
      : party.inviteCode
        ? `${window.location.origin}/f1/join/${party.inviteCode}`
        : window.location.href;
  const hostRsvp = partyData.rsvps.find((rsvp) => rsvp.isHost);

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
        url: partyUrl,
      });
      return;
    }
    await copyPartyLink();
  }

  async function answerBookingInterest(isInterested: boolean) {
    if (isSavingBookingInterest) return;

    setIsSavingBookingInterest(true);
    setBookingInterestStatus("");

    try {
      await recordBookingInterest({
        partyId: party._id,
        inviteCode: party.inviteCode,
        clientId,
        interested: isInterested,
        venueId: party.venueId,
        venueName: party.venueName,
        venueArea: party.venueArea,
        raceName: party.raceName,
      });

      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_booking_interest_recorded", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
          interested: isInterested,
        });
      }

      setShowBookingInterest(false);
      setBookingInterestStatus(
        isInterested
          ? "Interest registered. Booking will be live soon."
          : "No problem. You can still use the map and share the race plan.",
      );
    } catch {
      setBookingInterestStatus("Could not save this. Try once more.");
    } finally {
      setIsSavingBookingInterest(false);
    }
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
        decision,
      });

      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_watch_party_rsvp", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
          decision,
        });
      }

      setStatus("RSVP saved.");
      setLocalSavedRsvp({ name: trimmedName, decision });
      setName("");
    } catch {
      setError("Could not save your RSVP. Try once more.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="race-shell">
      <section className="party-page race-plan-page">
        <header className="race-plan-nav">
          <Link href="/f1">← Find another screening</Link>
        </header>

        <section className="race-plan-hero" aria-label="Selected watch party">
          <div className="race-plan-slash" aria-hidden="true" />
          <div className="race-plan-meta">
            <span>Race plan / 001</span>
            <strong>
              <i /> {party.venueEvidenceTag} screening
            </strong>
          </div>
          <div className="race-plan-copy">
            <p>{party.raceName}</p>
            <span>We're watching at</span>
            <h1>{party.venueName}</h1>
            <em>{party.venueArea}</em>
          </div>
          <div className="race-plan-time">
            <strong>{formatRaceDate(party.raceDate)}</strong>
            <strong>{formatRaceTime(party.raceTime)}</strong>
          </div>
          <div className="race-plan-actions">
            <button type="button" onClick={() => void sharePartyLink()}>
              Share race plan →
            </button>
            <a href={party.mapUrl} target="_blank" rel="noreferrer">
              Open map
            </a>
            <Link href="/f1">Change venue</Link>
          </div>
        </section>

        <div className="race-plan-lower">
          <RsvpStats grouped={grouped} />

          <aside className="race-plan-invite">
            <div className="race-plan-invite-copy">
              <span>Invite your crew</span>
              <h2>Your race plan is locked.</h2>
              <p>Send it to the group and let people RSVP on this page.</p>
            </div>
            <button type="button" onClick={() => void sharePartyLink()}>
              Share race plan →
            </button>
            <div className="race-plan-copy-link">
              <input
                id="party-link"
                value={partyUrl}
                readOnly
                aria-label="Watch party invite link"
              />
              <button type="button" onClick={() => void copyPartyLink()}>
                Copy
              </button>
            </div>
            {party.inviteCode ? (
              <p className="invite-code-note">
                Invite code: <strong>{party.inviteCode}</strong>
              </p>
            ) : null}
            {status ? <p className="action-status">{status}</p> : null}

            {isHostDevice ? (
              <div className="host-rsvp-status">
                <strong>{hostRsvp?.name ?? party.hostName}</strong>
                <span>
                  <i /> I'm in · Host
                </span>
              </div>
            ) : visibleDeviceRsvp ? (
              <div className="host-rsvp-status">
                <strong>{visibleDeviceRsvp.name}</strong>
                <span>
                  <i /> You said {decisionLabels[visibleDeviceRsvp.decision]}
                </span>
              </div>
            ) : (
              <RsvpForm
                decision={decision}
                error={error}
                isSaving={isSaving}
                name={name}
                onDecisionChange={setDecision}
                onNameChange={setName}
                onSubmit={submit}
              />
            )}
          </aside>
        </div>

        <section className="race-plan-venue" aria-label="Venue details">
          <div>
            <span>Venue</span>
            <h2>{party.venueName}</h2>
            <p>{party.venueArea}</p>
          </div>
          <div className="race-plan-venue-details">
            <p>
              <strong>{party.venueEvidenceTag} screening</strong>
            </p>
            <p>{party.venueEvidence}</p>
            <p>{party.venueVibe}</p>
          </div>
          <div className="race-plan-venue-actions">
            <button
              type="button"
              onClick={() => {
                setBookingInterestStatus("");
                setShowBookingInterest(true);
              }}
            >
              Book Now
            </button>
            <a href={party.mapUrl} target="_blank" rel="noreferrer">
              Open in maps →
            </a>
          </div>
          {showBookingInterest ? (
            <div className="booking-interest" role="dialog" aria-modal="false">
              <strong>This feature will be live soon.</strong>
              <p>Register your interest?</p>
              <div>
                <button
                  type="button"
                  disabled={isSavingBookingInterest}
                  onClick={() => void answerBookingInterest(true)}
                >
                  {isSavingBookingInterest ? "Saving..." : "Yes"}
                </button>
                <button
                  type="button"
                  disabled={isSavingBookingInterest}
                  onClick={() => void answerBookingInterest(false)}
                >
                  No
                </button>
              </div>
            </div>
          ) : null}
          {bookingInterestStatus ? (
            <p className="action-status">{bookingInterestStatus}</p>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function RsvpForm({
  decision,
  error,
  isSaving,
  name,
  onDecisionChange,
  onNameChange,
  onSubmit,
}: {
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
        Vote here and your group status updates below.
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

function RsvpStats({ grouped }: { grouped: Record<Decision, Doc<"rsvps">[]> }) {
  const rows = (Object.keys(decisionLabels) as Decision[]).map((item) => ({
    id: item,
    decision: decisionLabels[item],
    count: grouped[item].length,
    people: grouped[item],
  }));

  return (
    <section
      className="rsvp-stats"
      id="party-rsvps"
      aria-label="Watch party RSVP stats"
    >
      <h2>Who's in?</h2>
      <div className="rsvp-scoreboard">
        {rows.map((row) => (
          <div key={row.id}>
            <strong>{String(row.count).padStart(2, "0")}</strong>
            <span>{row.decision}</span>
          </div>
        ))}
      </div>
      <div className="rsvp-groups">
        {rows.map((row) => (
          <div className="rsvp-group" key={row.id}>
            <h3>{row.decision}</h3>
            {row.people.length ? (
              <ul>
                {row.people.map((person) => (
                  <li key={person._id}>
                    <span>{person.name}</span>
                    {person.isHost ? <strong>Host</strong> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No one yet</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function formatRaceDate(raceDate: string) {
  return raceDate
    .replace("Sunday, ", "Sun ")
    .replace(", 2026", "")
    .toUpperCase();
}

function formatRaceTime(raceTime: string) {
  return raceTime.replace(" PM", "").toUpperCase();
}

function getOrCreateClientId() {
  const existing = window.localStorage.getItem(clientIdKey);
  if (existing) return existing;

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(clientIdKey, nextId);
  return nextId;
}
