"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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
  const [localLockedAt, setLocalLockedAt] = useState<number | null>(null);
  const [localReservationHandoffAt, setLocalReservationHandoffAt] = useState<
    number | null
  >(null);
  const [localReservationConfirmedAt, setLocalReservationConfirmedAt] =
    useState<number | null>(null);
  const [localCalendarAddedAt, setLocalCalendarAddedAt] = useState<
    number | null
  >(null);
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
  const lockWatchPartyPlan = useMutation(api.actions.lockWatchPartyPlan);
  const startReservationHandoff = useMutation(
    api.actions.startReservationHandoff,
  );
  const confirmReservation = useMutation(api.actions.confirmReservation);
  const recordCalendarAdd = useMutation(api.actions.recordCalendarAdd);

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
  const lockedAt = party.lockedAt ?? localLockedAt;
  const reservationHandoffAt =
    party.reservationHandoffAt ?? localReservationHandoffAt;
  const reservationConfirmedAt =
    party.reservationConfirmedAt ?? localReservationConfirmedAt;
  const calendarAddedAt = party.calendarAddedAt ?? localCalendarAddedAt;
  const partyUrl =
    typeof window === "undefined"
      ? ""
      : party.inviteCode
        ? `${window.location.origin}/f1/join/${party.inviteCode}`
        : window.location.href;
  const calendarPayload = {
    title: `${party.raceName} at ${party.venueName}`,
    description: `FindMyScreen watch party at ${party.venueName}, ${party.venueArea}. RSVP link: ${partyUrl}`,
    location: `${party.venueName}, ${party.venueArea}`,
    url: partyUrl,
    raceDate: party.raceDate,
    raceTime: party.raceTime,
  };
  const googleCalendarUrl = buildGoogleCalendarUrl(calendarPayload);
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

  async function lockPlan() {
    if (!isHostDevice) return;

    setIsSavingBookingInterest(true);
    setBookingInterestStatus("");

    try {
      const nextLockedAt = await lockWatchPartyPlan({ partyId: party._id });
      setLocalLockedAt(nextLockedAt);
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_plan_locked", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
        });
      }
      setBookingInterestStatus(
        "Plan locked. Your crew will see the final plan.",
      );
    } catch {
      setBookingInterestStatus("Could not lock this plan. Try once more.");
    } finally {
      setIsSavingBookingInterest(false);
    }
  }

  async function reserveWithVenue() {
    if (!isHostDevice) return;

    setIsSavingBookingInterest(true);
    setBookingInterestStatus("");

    try {
      const nextReservationHandoffAt = await startReservationHandoff({
        partyId: party._id,
      });
      setLocalReservationHandoffAt(nextReservationHandoffAt);
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_reservation_handoff_started", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
        });
      }
      setShowBookingInterest(true);
      window.open(party.mapUrl, "_blank", "noopener,noreferrer");
      setBookingInterestStatus(
        "Reservation handoff started. Confirm with the venue, then mark it here.",
      );
    } catch {
      setBookingInterestStatus(
        "Could not record the reservation handoff. Try once more.",
      );
    } finally {
      setIsSavingBookingInterest(false);
    }
  }

  async function markReservationConfirmed() {
    if (!isHostDevice) return;

    setIsSavingBookingInterest(true);
    setBookingInterestStatus("");

    try {
      const nextReservationConfirmedAt = await confirmReservation({
        partyId: party._id,
      });
      setLocalReservationConfirmedAt(nextReservationConfirmedAt);
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
        posthog.capture("findmyscreen_reservation_confirmed", {
          party_id: party._id,
          venue_id: party.venueId,
          venue_name: party.venueName,
        });
      }
      setShowBookingInterest(false);
      setBookingInterestStatus(
        "Reservation confirmed. The outing plan is ready.",
      );
    } catch {
      setBookingInterestStatus(
        "Could not mark the reservation confirmed. Try once more.",
      );
    } finally {
      setIsSavingBookingInterest(false);
    }
  }

  async function recordCalendarClick() {
    const nextCalendarAddedAt = await recordCalendarAdd({ partyId: party._id });
    setLocalCalendarAddedAt(nextCalendarAddedAt);
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      posthog.capture("findmyscreen_calendar_added", {
        party_id: party._id,
        venue_id: party.venueId,
        venue_name: party.venueName,
      });
    }
  }

  async function openGoogleCalendar() {
    if (!googleCalendarUrl) return;
    await recordCalendarClick();
    window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
    setStatus("Google Calendar opened.");
  }

  async function downloadCalendarFile() {
    const calendarFile = buildCalendarFile(calendarPayload);
    const blob = new Blob([calendarFile], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "findmyscreen-watch-party.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Calendar file downloaded for Apple or Outlook.");
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

        <PlanProgress
          calendarAddedAt={calendarAddedAt}
          lockedAt={lockedAt}
          reservationConfirmedAt={reservationConfirmedAt}
          reservationHandoffAt={reservationHandoffAt}
        />

        <section className="race-plan-hero" aria-label="Selected watch party">
          <div className="race-plan-slash" aria-hidden="true" />
          <div className="race-plan-meta">
            <span>Race plan / 001</span>
            <strong>
              <i />{" "}
              {reservationConfirmedAt
                ? "Reservation confirmed"
                : lockedAt
                  ? "Plan locked"
                  : `${party.venueEvidenceTag} screening`}
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
              Invite people →
            </button>
            <a href={party.mapUrl} target="_blank" rel="noreferrer">
              Open map
            </a>
            <Link href="/f1">Change venue</Link>
          </div>
        </section>

        {lockedAt ? (
          <section className="final-plan-card" aria-label="Final outing plan">
            <div>
              <span>Final plan</span>
              <h2>{party.venueName}</h2>
              <p>
                {party.raceName} · {formatRaceDate(party.raceDate)} ·{" "}
                {formatRaceTime(party.raceTime)}
              </p>
              <small>
                {reservationConfirmedAt
                  ? "Reservation confirmed by host"
                  : "Reservation pending with host"}
              </small>
            </div>
            {reservationConfirmedAt ? (
              <div className="calendar-actions">
                <button type="button" onClick={() => void openGoogleCalendar()}>
                  Add to Google Calendar
                </button>
                <button
                  className="calendar-secondary"
                  type="button"
                  onClick={() => void downloadCalendarFile()}
                >
                  Apple or Outlook
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="race-plan-lower">
          <RsvpStats grouped={grouped} />

          <aside className="race-plan-invite">
            <div className="race-plan-invite-copy">
              <span>Invite your crew</span>
              <h2>
                {lockedAt
                  ? "Your race plan is locked."
                  : "Build the race plan."}
              </h2>
              <p>
                {reservationConfirmedAt
                  ? "Reservation is confirmed. Share the final plan and add it to calendars."
                  : lockedAt
                    ? "Now reserve with the venue, then mark it confirmed here."
                    : "Send it to the group, collect RSVPs, then lock the plan."}
              </p>
            </div>
            <button type="button" onClick={() => void sharePartyLink()}>
              Invite people →
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
                <div className="host-plan-actions">
                  {!lockedAt ? (
                    <button
                      type="button"
                      disabled={isSavingBookingInterest}
                      onClick={() => void lockPlan()}
                    >
                      {isSavingBookingInterest ? "Locking..." : "Lock plan"}
                    </button>
                  ) : (
                    <span className="host-plan-note">Plan locked.</span>
                  )}
                </div>
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

        <BookingSection
          bookingInterestStatus={bookingInterestStatus}
          isHostDevice={isHostDevice}
          isSavingBookingInterest={isSavingBookingInterest}
          lockedAt={lockedAt}
          onConfirmReservation={markReservationConfirmed}
          onReserveWithVenue={reserveWithVenue}
          party={party}
          reservationConfirmedAt={reservationConfirmedAt}
          reservationHandoffAt={reservationHandoffAt}
          showBookingInterest={showBookingInterest}
        />
      </section>
    </main>
  );
}

function PlanProgress({
  calendarAddedAt,
  lockedAt,
  reservationConfirmedAt,
  reservationHandoffAt,
}: {
  calendarAddedAt: number | null;
  lockedAt: number | null;
  reservationConfirmedAt: number | null;
  reservationHandoffAt: number | null;
}) {
  const steps = [
    { label: "RSVPs open", active: true },
    { label: "Plan locked", active: Boolean(lockedAt) },
    { label: "Venue handoff", active: Boolean(reservationHandoffAt) },
    { label: "Reservation confirmed", active: Boolean(reservationConfirmedAt) },
    { label: "Calendar ready", active: Boolean(calendarAddedAt) },
  ];
  const activeIndex = steps.reduce(
    (latest, step, index) => (step.active ? index : latest),
    0,
  );
  const planProgress = steps.length > 1 ? activeIndex / (steps.length - 1) : 0;

  return (
    <section className="outing-status" aria-label="Outing plan status">
      <span>Plan progress</span>
      <div
        className="outing-track"
        style={{ "--plan-progress": planProgress } as CSSProperties}
      >
        <span className="track-line" aria-hidden="true" />
        <span className="track-status-marker" aria-hidden="true" />
        {steps.map((step) => (
          <strong data-active={step.active} key={step.label}>
            {step.label}
          </strong>
        ))}
      </div>
    </section>
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

function BookingSection({
  bookingInterestStatus,
  isHostDevice,
  isSavingBookingInterest,
  lockedAt,
  onConfirmReservation,
  onReserveWithVenue,
  party,
  reservationConfirmedAt,
  reservationHandoffAt,
  showBookingInterest,
}: {
  bookingInterestStatus: string;
  isHostDevice: boolean;
  isSavingBookingInterest: boolean;
  lockedAt?: number | null;
  onConfirmReservation: () => void;
  onReserveWithVenue: () => void;
  party: Doc<"watchParties">;
  reservationConfirmedAt?: number | null;
  reservationHandoffAt?: number | null;
  showBookingInterest: boolean;
}) {
  const bookingLinks = [
    party.bookMyShowUrl
      ? {
          brand: "BMS",
          label: "BookMyShow",
          href: party.bookMyShowUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.districtUrl
      ? {
          brand: "D",
          label: "District",
          href: party.districtUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.eightClubUrl
      ? {
          brand: "8",
          label: "8club",
          href: party.eightClubUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.highApeUrl
      ? {
          brand: "HA",
          label: "HighApe",
          href: party.highApeUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.skillboxesUrl
      ? {
          brand: "SB",
          label: "Skillboxes",
          href: party.skillboxesUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.sortMySceneUrl
      ? {
          brand: party.sortMySceneUrl.includes("f1commune.com") ? "F1" : "SMS",
          label: party.sortMySceneUrl.includes("f1commune.com")
            ? "F1 Commune"
            : "SortMyScene",
          href: party.sortMySceneUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.highwayDeliteUrl
      ? {
          brand: "HD",
          label: "Highway Delite",
          href: party.highwayDeliteUrl,
          note: "Open the race screening page.",
        }
      : null,
    party.swiggyDineoutUrl
      ? {
          brand: "S",
          label: "Swiggy Dineout",
          href: party.swiggyDineoutUrl,
          note: "Reserve a table through Dineout.",
        }
      : null,
    {
      brand: "MAP",
      label: "Google Maps",
      href: party.mapUrl,
      note: "Check route, address and latest venue details.",
    },
    party.venuePhone && party.venuePhone !== "Needs call"
      ? {
          brand: "CALL",
          label: "Call venue",
          href: `tel:${party.venuePhone}`,
          note: "Speak to the venue before leaving.",
        }
      : null,
  ].filter(
    (
      link,
    ): link is {
      brand: string;
      label: string;
      href: string;
      note: string;
    } => Boolean(link),
  );

  return (
    <section className="race-plan-bookings" aria-label="Booking links">
      <div className="booking-section-head">
        <span>Bookings</span>
        <h2>Reserve your screen.</h2>
        <p>
          Use one of these booking links, then the host can mark the reservation
          confirmed.
        </p>
      </div>

      <div className="booking-link-grid">
        {bookingLinks.map((link) => (
          <a
            className="booking-link-card"
            href={link.href}
            key={link.label}
            rel="noreferrer"
            target={link.href.startsWith("tel:") ? undefined : "_blank"}
          >
            <span className="booking-logo">{link.brand}</span>
            <strong>{link.label}</strong>
            <small>{link.note}</small>
            <em>Open →</em>
          </a>
        ))}
      </div>

      {isHostDevice && lockedAt && !reservationConfirmedAt ? (
        <div className="booking-host-panel">
          <div>
            <span>Host handoff</span>
            <strong>
              {reservationHandoffAt
                ? "Confirm your reservation."
                : "Book outside, confirm here."}
            </strong>
            <p>
              Use a booking link or call the venue, then mark the reservation
              confirmed once the venue accepts it.
            </p>
            {bookingInterestStatus ? (
              <p className="action-status">{bookingInterestStatus}</p>
            ) : null}
          </div>
          <div>
            <button
              type="button"
              disabled={isSavingBookingInterest}
              onClick={() => void onReserveWithVenue()}
            >
              {reservationHandoffAt
                ? "Reservation handoff started"
                : "Reserve with venue"}
            </button>
            {reservationHandoffAt || showBookingInterest ? (
              <button
                type="button"
                disabled={isSavingBookingInterest}
                onClick={() => void onConfirmReservation()}
              >
                Reservation confirmed
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isHostDevice && reservationConfirmedAt && bookingInterestStatus ? (
        <p className="action-status">{bookingInterestStatus}</p>
      ) : null}
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

function buildCalendarFile({
  description,
  location,
  raceDate,
  raceTime,
  title,
  url,
}: {
  description: string;
  location: string;
  raceDate: string;
  raceTime: string;
  title: string;
  url: string;
}) {
  const { endLocal, startLocal } = buildCalendarTimes(raceDate, raceTime);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FindMyScreen//Watch Party//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@findmyscreen`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART;TZID=Asia/Kolkata:${startLocal}`,
    `DTEND;TZID=Asia/Kolkata:${endLocal}`,
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(location)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function buildGoogleCalendarUrl({
  description,
  location,
  raceDate,
  raceTime,
  title,
}: {
  description: string;
  location: string;
  raceDate: string;
  raceTime: string;
  title: string;
}) {
  const { endUtc, startUtc } = buildCalendarTimes(raceDate, raceTime);
  const params = [
    ["action", "TEMPLATE"],
    ["text", title],
    ["dates", `${startUtc}/${endUtc}`],
    ["details", description],
    ["location", location],
  ]
    .map(([key, value]) => `${key}=${encodeCalendarParam(value)}`)
    .join("&");

  return `https://calendar.google.com/calendar/render?${params}`;
}

function encodeCalendarParam(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildCalendarTimes(raceDate: string, raceTime: string) {
  const startDate = parseIstEventDate(raceDate, raceTime);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

  return {
    startUtc: formatUtcCalendarDate(startDate),
    endUtc: formatUtcCalendarDate(endDate),
    startLocal: formatLocalCalendarDate(startDate),
    endLocal: formatLocalCalendarDate(endDate),
  };
}

function parseIstEventDate(raceDate: string, raceTime: string) {
  const dateMatch = raceDate.match(
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/,
  );
  const timeMatch = raceTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!dateMatch || !timeMatch) {
    return new Date("2026-09-06T18:30:00+05:30");
  }

  const monthIndex = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf(dateMatch[1].toLowerCase());
  if (monthIndex < 0) return new Date("2026-09-06T18:30:00+05:30");
  const day = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const utcMs = Date.UTC(year, monthIndex, day, hour - 5, minute - 30, 0);
  return new Date(utcMs);
}

function formatUtcCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatLocalCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
}

function escapeCalendarText(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
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
