"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import posthog from "posthog-js";
import { api } from "../convex/_generated/api";
import { InviteReveal } from "./HomeClient";
import { buildInviteText, nextRace, type Venue } from "../lib/venues";

export function InvitePageClient({ venue, area }: { venue: Venue; area: string }) {
  const [status, setStatus] = useState("");
  const recordAction = useMutation(api.actions.recordAction);
  const invite = {
    venue,
    text: buildInviteText(venue)
  };

  async function unlockInvite(email: string) {
    await recordAction({
      email,
      actionType: "share_invite",
      areaInput: area,
      normalizedArea: area.toLowerCase(),
      venueId: venue.id,
      venueName: venue.name,
      raceName: nextRace.name
    });

    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      posthog.capture("findmyscreen_share_invite_unlocked", {
        area_input: area,
        normalized_area: area.toLowerCase(),
        venue_id: venue.id,
        venue_name: venue.name
      });
    }

    setStatus("Invite saved. You can now copy it.");
  }

  function copyInvite() {
    void navigator.clipboard.writeText(invite.text);
    setStatus("Invite text copied.");
  }

  return (
    <main className="race-shell">
      <section className="dedicated-invite-page">
        <header className="result-topbar">
          <Link href={`/f1?area=${encodeURIComponent(area)}`}>Back to venues</Link>
          <div>
            <span>Invite for</span>
            <strong>{venue.name}</strong>
          </div>
        </header>

        <div className="dedicated-invite-grid">
          <div className="dedicated-invite-primary">
            <InviteReveal invite={invite} onCopy={copyInvite} onUnlock={unlockInvite} />
          </div>

          <aside className="dedicated-venue-summary">
            <span>{venue.evidenceTag}</span>
            <h1>{venue.name}</h1>
            <p>{venue.area}</p>
            <dl>
              <div>
                <dt>Race</dt>
                <dd>{nextRace.name}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{nextRace.raceDate}, {nextRace.raceTime}</dd>
              </div>
              <div>
                <dt>Why this works</dt>
                <dd>{venue.evidence}</dd>
              </div>
              <div>
                <dt>Vibe</dt>
                <dd>{venue.vibe}</dd>
              </div>
            </dl>
            <a href={venue.mapUrl} target="_blank" rel="noreferrer">Open map</a>
          </aside>
        </div>

        {status ? <p className="action-status">{status}</p> : null}
      </section>
    </main>
  );
}
