"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import {
  buildInviteText,
  nextRace,
  rankVenueList,
  venues,
  type Venue,
} from "../lib/venues";
import { approvedSignalToVenue } from "../lib/venueSignals";

type PendingAction = "share_invite" | "call_pub";
type PendingActionTarget = {
  action: PendingAction;
  venue: Venue;
};
type PendingPartyTarget = {
  venue: Venue;
};
type RevealedPhone = {
  venue: Venue;
  phone: string;
} | null;
type RevealedInvite = {
  venue: Venue;
  text: string;
} | null;

const quickAreas = ["Bellandur", "HSR", "Indiranagar", "MG Road"];
const clientIdKey = "findmyscreen-client-id";
const hostPartiesKey = "findmyscreen-host-parties";
const nextRaceStartsAt = Date.parse("2026-09-06T18:30:00+05:30");

type RaceCountdown = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function getRaceCountdown(): RaceCountdown {
  const remainingMs = Math.max(0, nextRaceStartsAt - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: padTime(days),
    hours: padTime(hours),
    minutes: padTime(minutes),
    seconds: padTime(seconds),
  };
}

export function HomeClient({
  initialArea = "",
  initialApprovedSignals,
  initialInvite = false,
  basePath = "",
}: {
  initialArea?: string;
  initialApprovedSignals: Doc<"venueCandidates">[];
  initialInvite?: boolean;
  basePath?: string;
}) {
  const initialVenueList = useMemo(() => {
    const approvedVenues = initialApprovedSignals.map(approvedSignalToVenue);
    return [...approvedVenues, ...venues];
  }, [initialApprovedSignals]);
  const initialRun = useMemo(
    () => rankVenueList(initialArea, initialVenueList),
    [initialArea, initialVenueList],
  );
  const initialInviteVenue =
    initialInvite && initialRun.results[0]?.evidenceTag === "Verified"
      ? initialRun.results[0]
      : null;
  const [area, setArea] = useState(initialArea);
  const [submittedArea, setSubmittedArea] = useState(initialArea);
  const [hasSearched, setHasSearched] = useState(Boolean(initialArea));
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<PendingActionTarget | null>(null);
  const [pendingParty, setPendingParty] = useState<PendingPartyTarget | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [submittedLookupEmail, setSubmittedLookupEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [hostError, setHostError] = useState("");
  const [areaError, setAreaError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [raceCountdown, setRaceCountdown] = useState<RaceCountdown>(() =>
    getRaceCountdown(),
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isCompletingAction, setIsCompletingAction] = useState(false);
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<RevealedPhone>(null);
  const [revealedInvite, setRevealedInvite] = useState<RevealedInvite>(
    initialInviteVenue
      ? { venue: initialInviteVenue, text: buildInviteText(initialInviteVenue) }
      : null,
  );
  const recordSearch = useMutation(api.actions.recordSearch);
  const recordAction = useMutation(api.actions.recordAction);
  const createWatchParty = useMutation(api.actions.createWatchParty);
  const approvedSignals = useQuery(api.actions.approvedVenueCandidates);
  const hostParties = useQuery(
    api.actions.watchPartiesByHostEmail,
    submittedLookupEmail ? { hostEmail: submittedLookupEmail } : "skip",
  );
  const approvedSignalRows = approvedSignals ?? initialApprovedSignals;

  useEffect(() => {
    const updateCountdown = () => setRaceCountdown(getRaceCountdown());
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const venueList = useMemo(() => {
    const approvedVenues = approvedSignalRows.map(approvedSignalToVenue);
    return [...approvedVenues, ...venues];
  }, [approvedSignalRows]);
  const run = useMemo(
    () => rankVenueList(submittedArea, venueList),
    [submittedArea, venueList],
  );
  const bestVenue = run.results[0];
  const backupVenues = run.results.slice(1, 3);
  const moreVenues = run.results.slice(3, 6);
  const primaryAction =
    bestVenue?.evidenceTag === "Verified" ? "Share invite" : "Book Now";
  const routePath = basePath || "/";
  const queryPrefix = routePath === "/" ? "/?" : `${routePath}?`;
  const areaHref = (nextArea: string) =>
    `${queryPrefix}area=${encodeURIComponent(nextArea)}`;
  const inviteHref = (venue: Venue) =>
    `${routePath === "/" ? "/f1" : routePath}/invite/${encodeURIComponent(venue.id)}?area=${encodeURIComponent(submittedArea || venue.area)}`;

  async function submitArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextArea = area.trim();
    await searchArea(nextArea);
  }

  async function searchArea(nextArea: string) {
    if (isSearching) return;

    if (!nextArea.trim()) {
      setAreaError("Enter a Bangalore area to continue.");
      return;
    }

    const nextRun = rankVenueList(nextArea, venueList);
    setAreaError("");
    setSubmittedArea(nextArea);
    setHasSearched(true);
    setCopiedInvite(false);
    setActionStatus("");
    setRevealedPhone(null);
    setRevealedInvite(null);

    if (nextRun.results[0]) {
      setIsSearching(true);

      try {
        await recordSearch({
          areaInput: nextArea,
          normalizedArea: nextRun.normalizedArea,
          bestVenueId: nextRun.results[0].id,
          resultVenueIds: nextRun.results.map((venue) => venue.id),
        });
        captureProductEvent("findmyscreen_area_searched", {
          area_input: nextArea,
          normalized_area: nextRun.normalizedArea,
          best_venue_id: nextRun.results[0].id,
        });
      } catch {
        setActionStatus(
          "Results are ready. We could not save this search, so try again if you need it counted.",
        );
      } finally {
        setIsSearching(false);
      }
    }
  }

  function startAction(action: PendingAction, venue: Venue) {
    setPendingAction({ action, venue });
    setEmailError("");
    setActionStatus("");
    setRevealedPhone(null);
    setRevealedInvite(null);
  }

  function startWatchParty(venue: Venue) {
    setPendingParty({ venue });
    setHostError("");
    setActionStatus("");
    setRevealedPhone(null);
    setRevealedInvite(null);
  }

  async function submitWatchParty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingParty || isCreatingParty) return;

    const trimmedName = hostName.trim();
    const trimmedEmail = hostEmail.trim();

    if (!trimmedName) {
      setHostError("Enter your name to create the watch party.");
      return;
    }

    if (trimmedName.length > 60) {
      setHostError("Keep the name under 60 characters.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setHostError("Enter a valid email to create the watch party.");
      return;
    }

    setIsCreatingParty(true);
    setHostError("");

    try {
      const venue = pendingParty.venue;
      const hostClientId = getOrCreateClientId();
      const party = await createWatchParty({
        hostName: trimmedName,
        hostEmail: trimmedEmail.toLowerCase(),
        areaInput: submittedArea || venue.area,
        normalizedArea: run.normalizedArea || venue.area.toLowerCase(),
        venueId: venue.id,
        venueName: venue.name,
        venueArea: venue.area,
        venueEvidenceTag: venue.evidenceTag,
        venueEvidence: venue.evidence,
        venueVibe: venue.vibe,
        mapUrl: venue.mapUrl,
        venuePhone: venue.phone,
        hostClientId,
        raceName: nextRace.name,
        raceDate: nextRace.raceDate,
        raceTime: nextRace.raceTime,
      });
      rememberHostParty(String(party.partyId), party.inviteCode);

      captureProductEvent("findmyscreen_watch_party_created", {
        area_input: submittedArea || venue.area,
        normalized_area: run.normalizedArea || venue.area.toLowerCase(),
        venue_id: venue.id,
        venue_name: venue.name,
      });

      window.location.href = `/f1/join/${party.inviteCode}`;
    } catch {
      setHostError("Could not create the watch party. Please try again.");
    } finally {
      setIsCreatingParty(false);
    }
  }

  function submitPartyLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = lookupEmail.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) {
      setActionStatus("Enter the email you used to create your watch party.");
      return;
    }

    setActionStatus("");
    setSubmittedLookupEmail(nextEmail);
  }

  function submitInviteCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = cleanInviteCode(inviteCode);

    if (code.length < 4) {
      setInviteCodeError("Enter the invite code from your group link.");
      return;
    }

    setInviteCodeError("");
    window.location.href = `/f1/join/${code}`;
  }

  async function revealInvite(venue: Venue) {
    const text = buildInviteText(venue);

    setCopiedInvite(false);
    setActionStatus("Invite ready. Enter email on the card to copy it.");
    setRevealedPhone(null);
    setRevealedInvite({ venue, text });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedInvite(true);
      setActionStatus(
        "Invite ready and text copied. Enter email on the card to save this action.",
      );
    } catch {
      setCopiedInvite(false);
    }
  }

  async function unlockInvite(emailAddress: string, venue: Venue) {
    await recordAction({
      email: emailAddress,
      actionType: "share_invite",
      areaInput: submittedArea,
      normalizedArea: run.normalizedArea,
      venueId: venue.id,
      venueName: venue.name,
      raceName: nextRace.name,
    });
    captureProductEvent("findmyscreen_share_invite_unlocked", {
      area_input: submittedArea,
      normalized_area: run.normalizedArea,
      venue_id: venue.id,
      venue_name: venue.name,
    });

    setActionStatus("Invite saved. You can now copy it.");
  }

  async function completeAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingAction || isCompletingAction) return;

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Enter a valid email to continue.");
      return;
    }

    const actionToComplete = pendingAction;
    setIsCompletingAction(true);
    setEmailError("");

    try {
      await recordAction({
        email: email.trim(),
        actionType: actionToComplete.action,
        areaInput: submittedArea,
        normalizedArea: run.normalizedArea,
        venueId: actionToComplete.venue.id,
        venueName: actionToComplete.venue.name,
        raceName: nextRace.name,
      });
      captureProductEvent("findmyscreen_action_completed", {
        action_type: actionToComplete.action,
        area_input: submittedArea,
        normalized_area: run.normalizedArea,
        venue_id: actionToComplete.venue.id,
        venue_name: actionToComplete.venue.name,
      });

      if (actionToComplete.action === "share_invite") {
        const text = buildInviteText(actionToComplete.venue);

        try {
          await navigator.clipboard.writeText(text);
          setCopiedInvite(true);
          setActionStatus(
            "Invite ready and text copied. Send it to your group.",
          );
        } catch {
          setCopiedInvite(false);
          setActionStatus("Invite ready. Use Copy text.");
        }

        setRevealedInvite({
          venue: actionToComplete.venue,
          text,
        });
      } else if (actionToComplete.venue.phone !== "Needs call") {
        setRevealedPhone({
          venue: actionToComplete.venue,
          phone: actionToComplete.venue.phone,
        });
        setActionStatus("Phone number ready.");
      } else {
        setRevealedPhone({
          venue: actionToComplete.venue,
          phone: "Phone number not available yet",
        });
        setActionStatus("Booking action saved.");
      }

      setPendingAction(null);
      setEmail("");
    } catch {
      setEmailError("Something went wrong. Please try again.");
    } finally {
      setIsCompletingAction(false);
    }
  }

  return (
    <main className={`race-shell ${!hasSearched ? "race-shell-start" : ""}`}>
      {!hasSearched ? (
        <section className="start-screen">
          <header className="topbar">
            <div className="topbar-left">
              <div className="brand-mark">FMS</div>
              <span>FindMyScreen Bangalore</span>
              <span>
                RND 16 · Italian Grand Prix · Autodromo Nazionale Monza
              </span>
            </div>
            <div className="topbar-right">
              <span aria-hidden="true" />
              <strong>F1 race-night finder</strong>
              <a href="/f1/my-plans">My plans</a>
            </div>
          </header>

          <div className="hero-grid">
            <div className="hero-copy">
              <div className="start-lights" aria-label="Race lights on">
                <span />
                <span />
                <span />
                <span />
                <span />
                <em>Lights on</em>
              </div>
              <p className="eyebrow">Race control for pub plans</p>
              <h1>Pick one place for the next F1 race.</h1>
              <p className="lead">
                Enter the Bangalore area you want to view it in. We will find
                one clear watch-party invite and two backups.
              </p>

              <form
                className="area-form"
                onSubmit={submitArea}
                action={basePath || "/"}
              >
                <label htmlFor="area">
                  Please enter the area you want to view it in
                </label>
                <div>
                  <input
                    id="area"
                    name="area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="Bellandur, near HSR, MG Road"
                  />
                  <button type="submit" disabled={isSearching}>
                    {isSearching ? "Finding..." : "Find F1 plan"}
                  </button>
                </div>
                {areaError ? <p className="area-error">{areaError}</p> : null}
              </form>

              <div className="quick-areas" aria-label="Quick Bangalore areas">
                {quickAreas.map((quickArea, index) => (
                  <a
                    href={areaHref(quickArea)}
                    key={quickArea}
                    onClick={(event) => {
                      event.preventDefault();
                      window.history.pushState(null, "", areaHref(quickArea));
                      setArea(quickArea);
                      if (!isSearching) void searchArea(quickArea);
                    }}
                  >
                    <span>S{index + 1}</span>
                    {quickArea}
                  </a>
                ))}
              </div>

              <JoinWatchParty
                error={inviteCodeError}
                inviteCode={inviteCode}
                onInviteCodeChange={setInviteCode}
                onSubmit={submitInviteCode}
              />
              <MyWatchParties
                hostParties={hostParties}
                lookupEmail={lookupEmail}
                onLookupEmailChange={setLookupEmail}
                onSubmit={submitPartyLookup}
                submittedLookupEmail={submittedLookupEmail}
              />
            </div>

            <aside className="race-panel" aria-label="Next F1 race">
              <div className="race-panel-header">
                <span>Next main race</span>
                <b>RND 16/24</b>
              </div>
              <div className="race-panel-title">
                <strong>{nextRace.name}</strong>
                <p>{nextRace.circuit}</p>
              </div>
              <dl className="race-facts">
                <div>
                  <dt>Date</dt>
                  <dd>{nextRace.raceDate.replace("Sunday, ", "Sun ")}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{nextRace.raceTime.replace(" PM", "")} IST</dd>
                </div>
                <div>
                  <dt>Laps</dt>
                  <dd>53</dd>
                </div>
                <div>
                  <dt>Dist.</dt>
                  <dd>306.720 km</dd>
                </div>
                <div>
                  <dt>Circuit</dt>
                  <dd>5.793 km</dd>
                </div>
              </dl>
              <div className="race-countdown" aria-label="Race countdown">
                <span>Race starts in</span>
                <div>
                  <b>
                    {raceCountdown.days}
                    <small>D</small>
                  </b>
                  <b>
                    {raceCountdown.hours}
                    <small>H</small>
                  </b>
                  <b>
                    {raceCountdown.minutes}
                    <small>M</small>
                  </b>
                  <b>
                    {raceCountdown.seconds}
                    <small>S</small>
                  </b>
                </div>
              </div>
              <div className="upcoming-races">
                <span>Upcoming</span>
                <ol>
                  <li>
                    <b>17</b>
                    <strong>
                      Singapore GP<small>Marina Bay</small>
                    </strong>
                    <em>21 Sep</em>
                  </li>
                  <li>
                    <b>18</b>
                    <strong>
                      USGP Austin<small>COTA</small>
                    </strong>
                    <em>19 Oct</em>
                  </li>
                  <li>
                    <b>19</b>
                    <strong>
                      Mexico City GP<small>Hermanos Rodriguez</small>
                    </strong>
                    <em>26 Oct</em>
                  </li>
                  <li>
                    <b>20</b>
                    <strong>
                      Sao Paulo GP<small>Interlagos</small>
                    </strong>
                    <em>09 Nov</em>
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </section>
      ) : (
        <section className="recommendation-page">
          <header className="result-topbar">
            <button type="button" onClick={() => setHasSearched(false)}>
              Change area
            </button>
            <a href="/f1/my-plans">My plans</a>
            <div>
              <span>Showing F1 screening plan for</span>
              <strong>{submittedArea || "Bangalore"}</strong>
            </div>
          </header>

          {!run.isSupportedArea ? (
            <section className="pit-message" role="status">
              <strong>We are starting with Bangalore F1 screenings.</strong>
              <p>Try one of these areas instead.</p>
              <div
                className="quick-areas compact"
                aria-label="Supported Bangalore areas"
              >
                {quickAreas.map((quickArea) => (
                  <a
                    href={areaHref(quickArea)}
                    key={quickArea}
                    onClick={(event) => {
                      event.preventDefault();
                      window.history.pushState(null, "", areaHref(quickArea));
                      setArea(quickArea);
                      if (!isSearching) void searchArea(quickArea);
                    }}
                  >
                    {quickArea}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {bestVenue ? (
            <>
              <section className="trust-note" aria-label="Recommendation note">
                <span>Starting grid locked</span>
                <p>
                  P1 is the strongest race-night plan. P2-P3 are solid
                  alternatives. P4-P6 are backups if location or booking gets
                  messy.
                </p>
              </section>

              <div
                className="race-grid-results"
                aria-label="F1 screening recommendation"
              >
                <article className="pole-card">
                  <div className="pole-position-mark">
                    <span>P1</span>
                    <strong>Pole position</strong>
                  </div>
                  <div className="pole-content">
                    <div className="result-label race-result-label">
                      <span>Most reliable plan</span>
                      <EvidenceBadge tag={bestVenue.evidenceTag} />
                    </div>
                    <h2>{bestVenue.name}</h2>
                    <p className="venue-area">{bestVenue.area}</p>
                    <VenueStats venue={bestVenue} position={1} />

                    <div className="invite-lines">
                      <div>
                        <span>Race</span>
                        <strong>{nextRace.name}</strong>
                      </div>
                      <div>
                        <span>Why this wins</span>
                        <strong>{bestVenue.evidence}</strong>
                      </div>
                      <div>
                        <span>Vibe</span>
                        <strong>{bestVenue.vibe}</strong>
                      </div>
                      <div>
                        <span>Price</span>
                        <strong>{bestVenue.price}</strong>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="primary-action"
                        type="button"
                        onClick={() => startWatchParty(bestVenue)}
                      >
                        Create Watch Party
                      </button>
                      <button
                        className="secondary-action"
                        type="button"
                        onClick={() => startAction("call_pub", bestVenue)}
                      >
                        Book Now
                      </button>
                    </div>
                    {actionStatus ? (
                      <p className="action-status">{actionStatus}</p>
                    ) : null}
                    {revealedPhone ? (
                      <PhoneReveal
                        venueName={revealedPhone.venue.name}
                        phone={revealedPhone.phone}
                        mapUrl={revealedPhone.venue.mapUrl}
                      />
                    ) : null}
                    {bestVenue.evidenceTag !== "Verified" ? (
                      <p className="honesty-note">
                        Not personally verified today. Confirm once before
                        sending this to friends.
                      </p>
                    ) : null}
                  </div>
                </article>

                <div className="grid-pack">
                  <div className="section-heading">
                    <span>P2-P3</span>
                    <strong>Close contenders</strong>
                  </div>
                  {backupVenues.map((venue, index) => (
                    <article
                      className="grid-venue-card grid-venue-card-mid"
                      key={venue.id}
                    >
                      <div className="grid-venue-top">
                        <span className="grid-position">P{index + 2}</span>
                        <EvidenceBadge tag={venue.evidenceTag} />
                      </div>
                      <div>
                        <h3>{venue.name}</h3>
                        <p>{venue.area}</p>
                      </div>
                      <VenueStats venue={venue} position={index + 2} />
                      <p className="pick-note">
                        {venue.evidenceTag === "Verified"
                          ? "Confirmed backup for race night."
                          : "Good option, but call once before you go."}
                      </p>
                      <div className="backup-actions">
                        <button
                          type="button"
                          onClick={() => startWatchParty(venue)}
                        >
                          Create Watch Party
                        </button>
                        <button
                          type="button"
                          onClick={() => startAction("call_pub", venue)}
                        >
                          Book Now
                        </button>
                      </div>
                    </article>
                  ))}

                  {moreVenues.length ? (
                    <div
                      className="reserve-grid"
                      aria-label="P4 to P6 backup venues"
                    >
                      <div className="section-heading reserve-heading">
                        <span>P4-P6</span>
                        <strong>Backup grid</strong>
                      </div>
                      {moreVenues.map((venue, index) => (
                        <article
                          className="grid-venue-card grid-venue-card-backup"
                          key={venue.id}
                        >
                          <div className="grid-venue-top">
                            <span className="grid-position">P{index + 4}</span>
                            <EvidenceBadge tag={venue.evidenceTag} />
                          </div>
                          <div>
                            <h3>{venue.name}</h3>
                            <p>{venue.area}</p>
                          </div>
                          <VenueStats venue={venue} position={index + 4} />
                          <p className="pick-note">
                            {venue.evidenceTag === "Verified"
                              ? "Confirmed backup for race night."
                              : "Backup option. Call before you commit."}
                          </p>
                          <div className="backup-actions">
                            <button
                              type="button"
                              onClick={() => startWatchParty(venue)}
                            >
                              Create Watch Party
                            </button>
                            <button
                              type="button"
                              onClick={() => startAction("call_pub", venue)}
                            >
                              Book Now
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </section>
      )}

      {pendingAction ? (
        <div className="modal-backdrop" role="presentation">
          <form className="email-modal" onSubmit={completeAction}>
            <span>
              {pendingAction.action === "share_invite"
                ? "Share invite"
                : "Book Now"}
            </span>
            <h2>
              {pendingAction.action === "share_invite"
                ? "Please enter your email to create your invite"
                : "Please enter your email to view booking details"}
            </h2>
            <input
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {emailError ? <p className="email-error">{emailError}</p> : null}
            <div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isCompletingAction}
              >
                Cancel
              </button>
              <button type="submit" disabled={isCompletingAction}>
                {isCompletingAction ? "Loading..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {pendingParty ? (
        <div className="modal-backdrop" role="presentation">
          <form className="email-modal" onSubmit={submitWatchParty}>
            <span>Create Watch Party</span>
            <h2>Enter your name and email</h2>
            <p>You will be counted as I'm in for {pendingParty.venue.name}.</p>
            <input
              autoFocus
              value={hostName}
              onChange={(event) => setHostName(event.target.value)}
              placeholder="Your name"
              maxLength={60}
            />
            <input
              value={hostEmail}
              onChange={(event) => setHostEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {hostError ? <p className="email-error">{hostError}</p> : null}
            <div>
              <button
                type="button"
                onClick={() => setPendingParty(null)}
                disabled={isCreatingParty}
              >
                Cancel
              </button>
              <button type="submit" disabled={isCreatingParty}>
                {isCreatingParty ? "Creating..." : "Create party"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function captureProductEvent(
  event: string,
  properties: Record<string, string>,
) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}

function getOrCreateClientId() {
  if (typeof window === "undefined") return undefined;

  const existing = window.localStorage.getItem(clientIdKey);
  if (existing) return existing;

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(clientIdKey, nextId);
  return nextId;
}

function cleanInviteCode(value: string) {
  const trimmed = value.trim();
  const urlMatch = trimmed.match(/\/f1\/join\/([^/?#]+)/i);
  if (urlMatch?.[1])
    return urlMatch[1]
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

  const lastToken = trimmed.split(/\s+/).at(-1) ?? trimmed;
  return lastToken
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function rememberHostParty(partyId: string, inviteCode?: string) {
  if (typeof window === "undefined") return;

  const current = JSON.parse(
    window.localStorage.getItem(hostPartiesKey) || "[]",
  ) as string[];
  const next = [partyId, ...current.filter((item) => item !== partyId)].slice(
    0,
    10,
  );
  window.localStorage.setItem(hostPartiesKey, JSON.stringify(next));
  window.localStorage.setItem(`findmyscreen-host-party:${partyId}`, "true");
  if (inviteCode) {
    window.localStorage.setItem(
      `findmyscreen-host-party-code:${inviteCode}`,
      "true",
    );
  }
}

function JoinWatchParty({
  error,
  inviteCode,
  onInviteCodeChange,
  onSubmit,
}: {
  error: string;
  inviteCode: string;
  onInviteCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section
      className="my-parties-box join-party-box"
      aria-label="Join a watch party"
    >
      <div className="my-parties-header">
        <span>Have an invite code?</span>
        <strong>Join a watch party</strong>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="watch-party-code">Invite code</label>
        <input
          id="watch-party-code"
          value={inviteCode}
          onChange={(event) => onInviteCodeChange(event.target.value)}
          placeholder="Example: K7P9Q2"
        />
        <button type="submit">Join</button>
      </form>
      {error ? <p className="area-error">{error}</p> : null}
    </section>
  );
}

function MyWatchParties({
  hostParties,
  lookupEmail,
  onLookupEmailChange,
  onSubmit,
  submittedLookupEmail,
}: {
  hostParties: Doc<"watchParties">[] | undefined;
  lookupEmail: string;
  onLookupEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submittedLookupEmail: string;
}) {
  return (
    <section className="my-parties-box" aria-label="Find your watch parties">
      <div className="my-parties-header">
        <span>Already made a plan?</span>
        <strong>Find your watch parties</strong>
      </div>
      <form onSubmit={onSubmit}>
        <label htmlFor="watch-party-email">Host email</label>
        <input
          id="watch-party-email"
          value={lookupEmail}
          onChange={(event) => onLookupEmailChange(event.target.value)}
          placeholder="Email used by host"
        />
        <button type="submit">Find</button>
      </form>
      {submittedLookupEmail ? (
        <div className="my-party-results">
          {hostParties === undefined ? <p>Checking...</p> : null}
          {hostParties?.length === 0 ? (
            <p>No watch parties found for this email.</p>
          ) : null}
          {hostParties?.map((party) => (
            <a
              href={
                party.inviteCode
                  ? `/f1/join/${party.inviteCode}`
                  : `/f1/party/${party._id}`
              }
              key={party._id}
            >
              <span>{party.raceName}</span>
              <strong>{party.venueName}</strong>
              <small>
                {party.raceDate} · {party.raceTime}
              </small>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function EvidenceBadge({ tag }: { tag: string }) {
  const className = `evidence-badge ${tag.toLowerCase().replaceAll(" ", "-")}`;
  return <span className={className}>{tag}</span>;
}

function VenueStats({ venue, position }: { venue: Venue; position: number }) {
  const booking = venue.evidenceTag === "Verified" ? "Ready" : "Call first";
  const screen =
    venue.evidenceTag === "Verified" || venue.evidenceTag === "Posted about F1"
      ? "Confirmed signal"
      : "Likely";
  const crowd =
    position === 1 ? "Best fit" : position <= 3 ? "Strong" : "Backup";

  return (
    <div className="venue-stats" aria-label={`${venue.name} quick stats`}>
      <span>
        <b>Distance</b>
        {venue.area}
      </span>
      <span>
        <b>Screen</b>
        {screen}
      </span>
      <span>
        <b>Crowd</b>
        {crowd}
      </span>
      <span>
        <b>Booking</b>
        {booking}
      </span>
    </div>
  );
}

async function copyTextAgain(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // The visible text remains on screen if the browser blocks clipboard access.
  }
}

export function InviteReveal({
  invite,
  onCopy,
  onUnlock,
}: {
  invite: {
    venue: Venue;
    text: string;
  };
  onCopy: () => void;
  onUnlock: (emailAddress: string) => Promise<void>;
}) {
  const [emailAddress, setEmailAddress] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  async function submitInviteEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(emailAddress.trim())) {
      setEmailError("Enter a valid email to continue.");
      return;
    }

    setIsSaving(true);
    setEmailError("");

    try {
      await onUnlock(emailAddress.trim());
      setIsUnlocked(true);
    } catch {
      setEmailError("Could not save this action. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="invite-reveal" id="invite-card" role="status">
      <div className="invite-reveal-header">
        <span>Invite ready</span>
        <strong>Send this to the group</strong>
      </div>
      <InviteCardPreview venue={invite.venue} />
      {!isUnlocked ? (
        <form className="invite-email-form" onSubmit={submitInviteEmail}>
          <label htmlFor="invite-email">Enter email to copy this invite</label>
          <div>
            <input
              id="invite-email"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              placeholder="you@example.com"
            />
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Unlock"}
            </button>
          </div>
          {emailError ? <p>{emailError}</p> : null}
        </form>
      ) : (
        <div className="invite-share-actions">
          <button type="button" onClick={onCopy}>
            Copy text
          </button>
        </div>
      )}
    </div>
  );
}

export function InviteCardPreview({
  venue,
}: {
  venue: { name: string; area: string; evidenceTag: string };
}) {
  return (
    <div
      className="invite-card-preview"
      aria-label="Shareable race invite preview"
    >
      <div className="invite-topline">
        <span>FindMyScreen race night</span>
        <b>F1</b>
      </div>
      <div className="invite-race">
        <span>Next main race</span>
        <strong>{nextRace.name}</strong>
        <p>
          {nextRace.raceDate} - {nextRace.raceTime}
        </p>
      </div>
      <div className="invite-place">
        <span>Watching at</span>
        <h3>{venue.name}</h3>
        <p>{venue.area}</p>
      </div>
      <div className="invite-proof-row">
        <small>{venue.evidenceTag} pick</small>
        <em>One plan. No group debate.</em>
      </div>
      <strong className="invite-question">Who's in?</strong>
    </div>
  );
}

function PhoneReveal({
  venueName,
  phone,
  mapUrl,
}: {
  venueName: string;
  phone: string;
  mapUrl: string;
}) {
  const hasPhone = phone !== "Phone number not available yet";

  return (
    <div className="phone-reveal" role="status">
      <span>Phone number</span>
      <strong>{phone}</strong>
      <p>{venueName}</p>
      {hasPhone ? (
        <a href={`tel:${phone}`}>Call now</a>
      ) : (
        <a href={mapUrl} target="_blank" rel="noreferrer">
          Open map to find contact
        </a>
      )}
    </div>
  );
}
