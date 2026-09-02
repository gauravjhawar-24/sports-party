"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import posthog from "posthog-js";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { buildInviteText, nextRace, rankVenueList, venues, type Venue } from "../lib/venues";
import { approvedSignalToVenue } from "../lib/venueSignals";

type PendingAction = "share_invite" | "call_pub";
type PendingActionTarget = {
  action: PendingAction;
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
type InviteImageAction = "download" | "share";

const quickAreas = ["Bellandur", "HSR", "Indiranagar", "MG Road"];

export function HomeClient({
  initialArea = "",
  initialApprovedSignals,
  initialInvite = false,
  basePath = ""
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
  const initialRun = useMemo(() => rankVenueList(initialArea, initialVenueList), [initialArea, initialVenueList]);
  const initialInviteVenue = initialInvite && initialRun.results[0]?.evidenceTag === "Verified" ? initialRun.results[0] : null;
  const [area, setArea] = useState(initialArea);
  const [submittedArea, setSubmittedArea] = useState(initialArea);
  const [hasSearched, setHasSearched] = useState(Boolean(initialArea));
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingActionTarget | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [areaError, setAreaError] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCompletingAction, setIsCompletingAction] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState<RevealedPhone>(null);
  const [revealedInvite, setRevealedInvite] = useState<RevealedInvite>(
    initialInviteVenue ? { venue: initialInviteVenue, text: buildInviteText(initialInviteVenue) } : null
  );
  const recordSearch = useMutation(api.actions.recordSearch);
  const recordAction = useMutation(api.actions.recordAction);
  const approvedSignals = useQuery(api.actions.approvedVenueCandidates);
  const approvedSignalRows = approvedSignals ?? initialApprovedSignals;

  const venueList = useMemo(() => {
    const approvedVenues = approvedSignalRows.map(approvedSignalToVenue);
    return [...approvedVenues, ...venues];
  }, [approvedSignalRows]);
  const run = useMemo(() => rankVenueList(submittedArea, venueList), [submittedArea, venueList]);
  const [bestVenue, ...backupVenues] = run.results;
  const primaryAction = bestVenue?.evidenceTag === "Verified" ? "Share invite" : "Call pub";
  const routePath = basePath || "/";
  const queryPrefix = routePath === "/" ? "/?" : `${routePath}?`;
  const areaHref = (nextArea: string) => `${queryPrefix}area=${encodeURIComponent(nextArea)}`;
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
          resultVenueIds: nextRun.results.map((venue) => venue.id)
        });
        captureProductEvent("find_my_screen_area_searched", {
          area_input: nextArea,
          normalized_area: nextRun.normalizedArea,
          best_venue_id: nextRun.results[0].id
        });
      } catch {
        setActionStatus("Results are ready. We could not save this search, so try again if you need it counted.");
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

  async function revealInvite(venue: Venue) {
    const text = buildInviteText(venue);

    setCopiedInvite(false);
    setActionStatus("Invite ready. Enter email on the card to download or share it.");
    setRevealedPhone(null);
    setRevealedInvite({ venue, text });

    try {
      await navigator.clipboard.writeText(text);
      setCopiedInvite(true);
      setActionStatus("Invite ready and text copied. Enter email on the card to download or share it.");
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
      raceName: nextRace.name
    });
    captureProductEvent("find_my_screen_share_invite_unlocked", {
      area_input: submittedArea,
      normalized_area: run.normalizedArea,
      venue_id: venue.id,
      venue_name: venue.name
    });

    setActionStatus("Invite saved. You can now download or share it.");
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
        raceName: nextRace.name
      });
      captureProductEvent("find_my_screen_action_completed", {
        action_type: actionToComplete.action,
        area_input: submittedArea,
        normalized_area: run.normalizedArea,
        venue_id: actionToComplete.venue.id,
        venue_name: actionToComplete.venue.name
      });

      if (actionToComplete.action === "share_invite") {
        const text = buildInviteText(actionToComplete.venue);

        try {
          await navigator.clipboard.writeText(text);
          setCopiedInvite(true);
          setActionStatus("Invite ready and text copied. Send it to your group.");
        } catch {
          setCopiedInvite(false);
          setActionStatus("Invite ready. Use Copy text or Download card.");
        }

        setRevealedInvite({
          venue: actionToComplete.venue,
          text
        });
      } else if (actionToComplete.venue.phone !== "Needs call") {
        setRevealedPhone({
          venue: actionToComplete.venue,
          phone: actionToComplete.venue.phone
        });
        setActionStatus("Phone number ready.");
      } else {
        setRevealedPhone({
          venue: actionToComplete.venue,
          phone: "Phone number not available yet"
        });
        setActionStatus("Call action saved.");
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
    <main className="race-shell">
      {!hasSearched ? (
        <section className="start-screen">
          <header className="topbar">
            <div className="brand-mark">FMS</div>
            <div>
              <strong>Find my Screen Bangalore</strong>
              <span>F1 race-night finder</span>
            </div>
          </header>

          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Race control for pub plans</p>
              <h1>Pick one place for the next F1 race.</h1>
              <p className="lead">
                Enter the Bangalore area you want to view it in. We will find one clear watch-party invite and two backups.
              </p>

              <form className="area-form" onSubmit={submitArea} action={basePath || "/"}>
                <label htmlFor="area">Please enter the area you want to view it in</label>
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
                {quickAreas.map((quickArea) => (
                  <a href={areaHref(quickArea)} key={quickArea} onClick={(event) => {
                    event.preventDefault();
                    window.history.pushState(null, "", areaHref(quickArea));
                    setArea(quickArea);
                    if (!isSearching) void searchArea(quickArea);
                  }}>
                    {quickArea}
                  </a>
                ))}
              </div>
            </div>

            <aside className="race-panel" aria-label="Next F1 race">
              <span>Next main race</span>
              <strong>{nextRace.name}</strong>
              <p>{nextRace.circuit}</p>
              <div>
                <b>{nextRace.raceDate}</b>
                <b>{nextRace.raceTime}</b>
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
            <div>
              <span>Showing F1 screening plan for</span>
              <strong>{submittedArea || "Bangalore"}</strong>
            </div>
          </header>

          {!run.isSupportedArea ? (
            <section className="pit-message" role="status">
              <strong>We are starting with Bangalore F1 screenings.</strong>
              <p>Try one of these areas instead.</p>
              <div className="quick-areas compact" aria-label="Supported Bangalore areas">
                {quickAreas.map((quickArea) => (
                  <a href={areaHref(quickArea)} key={quickArea} onClick={(event) => {
                    event.preventDefault();
                    window.history.pushState(null, "", areaHref(quickArea));
                    setArea(quickArea);
                    if (!isSearching) void searchArea(quickArea);
                  }}>
                    {quickArea}
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {bestVenue ? (
            <>
              <section className="trust-note" aria-label="Recommendation note">
                <span>Best safe plan first</span>
                <p>We picked the place you can trust most for race night. Closer options are below if you want to compare.</p>
              </section>

              <div className="results-grid" aria-label="F1 screening recommendation">
                <article className="invite-card">
                  <div className="card-rail" />
                  <div className="invite-content">
                    <div className="result-label">
                      <span>Best pick</span>
                      <EvidenceBadge tag={bestVenue.evidenceTag} />
                    </div>
                    <p className="pick-note">Most reliable pick for tonight's race plan.</p>
                    <h2>{bestVenue.name}</h2>
                    <p className="venue-area">{bestVenue.area}</p>

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
                      {bestVenue.evidenceTag === "Verified" ? (
                        <a
                          className="primary-action"
                          href={inviteHref(bestVenue)}
                        >
                          {copiedInvite ? "Invite copied" : primaryAction}
                        </a>
                      ) : (
                        <button type="button" onClick={() => startAction("call_pub", bestVenue)}>
                          {primaryAction}
                        </button>
                      )}
                      {bestVenue.evidenceTag !== "Verified" ? (
                        <a className="secondary-action" href={inviteHref(bestVenue)}>
                          Share invite
                        </a>
                      ) : null}
                      <a className="secondary-action" href={bestVenue.mapUrl} target="_blank" rel="noreferrer">
                        Open map
                      </a>
                    </div>
                    {actionStatus ? <p className="action-status">{actionStatus}</p> : null}
                    {revealedPhone ? (
                      <PhoneReveal venueName={revealedPhone.venue.name} phone={revealedPhone.phone} mapUrl={revealedPhone.venue.mapUrl} />
                    ) : null}
              {bestVenue.evidenceTag !== "Verified" ? (
                <p className="honesty-note">Not personally verified today. Call once before sending this to friends.</p>
              ) : null}
                  </div>
                </article>

                <div className="backup-stack">
                  <div className="section-heading">
                    <span>Backups</span>
                    <strong>Two options if the best pick does not work</strong>
                  </div>
                  {backupVenues.map((venue, index) => (
                    <article className="backup-card" key={venue.id}>
                      <div>
                        <span className="backup-number">0{index + 1}</span>
                        <h3>{venue.name}</h3>
                        <p>{venue.area}</p>
                      </div>
                      <EvidenceBadge tag={venue.evidenceTag} />
                      <p className="pick-note">
                        {venue.evidenceTag === "Verified" ? "Verified backup if the best pick does not work." : "Closer option, but call once before you go."}
                      </p>
                      <p>{venue.evidence}</p>
                      <div className="backup-actions">
                        <button type="button" onClick={() => startAction("call_pub", venue)}>Call pub</button>
                        <a href={inviteHref(venue)}>Share invite</a>
                        <a href={venue.mapUrl} target="_blank" rel="noreferrer">Map</a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </section>
      )}

      {pendingAction ? (
        <div className="modal-backdrop" role="presentation">
          <form className="email-modal" onSubmit={completeAction}>
            <span>{pendingAction.action === "share_invite" ? "Share invite" : "Call pub"}</span>
            <h2>
              {pendingAction.action === "share_invite"
                ? "Please enter your email to create your invite"
                : "Please enter your email to view phone number"}
            </h2>
            <input
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {emailError ? <p className="email-error">{emailError}</p> : null}
            <div>
              <button type="button" onClick={() => setPendingAction(null)} disabled={isCompletingAction}>Cancel</button>
              <button type="submit" disabled={isCompletingAction}>
                {isCompletingAction ? "Loading..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function captureProductEvent(event: string, properties: Record<string, string>) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(event, properties);
}

function EvidenceBadge({ tag }: { tag: string }) {
  const className = `evidence-badge ${tag.toLowerCase().replaceAll(" ", "-")}`;
  return <span className={className}>{tag}</span>;
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
  onUnlock
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
      <div className="invite-card-preview" aria-label="Shareable race invite preview">
        <div className="invite-topline">
          <span>Find my Screen race night</span>
          <b>F1</b>
        </div>
        <div className="invite-race">
          <span>Next main race</span>
          <strong>{nextRace.name}</strong>
          <p>{nextRace.raceDate} - {nextRace.raceTime}</p>
        </div>
        <div className="invite-place">
          <span>Watching at</span>
          <h3>{invite.venue.name}</h3>
          <p>{invite.venue.area}</p>
        </div>
        <div className="invite-proof-row">
          <small>{invite.venue.evidenceTag} pick</small>
          <em>One plan. No group debate.</em>
        </div>
        <strong className="invite-question">Who's in?</strong>
      </div>
      {!isUnlocked ? (
        <form className="invite-email-form" onSubmit={submitInviteEmail}>
          <label htmlFor="invite-email">Enter email to download or share this invite</label>
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
          <button type="button" onClick={() => void createInviteImage(invite.venue, "download")}>
            Download card
          </button>
          <button type="button" onClick={() => void createInviteImage(invite.venue, "share")}>
            Share image
          </button>
          <button type="button" onClick={onCopy}>Copy text</button>
        </div>
      )}
    </div>
  );
}

async function createInviteImage(venue: Venue, action: InviteImageAction) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const background = await loadImage("/invite-card-bg.png");
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.08)");
  gradient.addColorStop(0.42, "rgba(0, 0, 0, 0.4)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.74)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
  ctx.lineWidth = 3;
  roundRect(ctx, 70, 70, 940, 1210, 28);
  ctx.stroke();

  ctx.fillStyle = "#e10600";
  roundRect(ctx, 94, 94, 236, 58, 10);
  ctx.fill();
  drawText(ctx, "FIND MY SCREEN RACE NIGHT", 118, 132, 26, 900, "#ffffff", 620);
  drawText(ctx, "F1", 820, 168, 118, 900, "rgba(255, 255, 255, 0.9)", 180);

  drawText(ctx, "ONE PLAN. NO GROUP DEBATE.", 94, 640, 30, 900, "#ffb000", 880);
  drawText(ctx, nextRace.name.toUpperCase(), 94, 720, 58, 900, "#ffffff", 880);
  drawText(ctx, `${nextRace.raceDate} - ${nextRace.raceTime}`, 94, 790, 34, 800, "#f7f7f2", 880);

  drawText(ctx, "WATCHING AT", 94, 900, 24, 900, "rgba(247, 247, 242, 0.7)");
  drawText(ctx, venue.name.toUpperCase(), 94, 972, 76, 900, "#ffffff", 880);
  drawText(ctx, venue.area, 94, 1050, 36, 800, "#f7f7f2", 880);

  ctx.fillStyle = venue.evidenceTag === "Verified" ? "#00a86b" : "#ffb000";
  roundRect(ctx, 94, 1110, 310, 60, 14);
  ctx.fill();
  drawText(ctx, venue.evidenceTag.toUpperCase(), 122, 1149, 26, 900, "#ffffff");

  drawText(ctx, "Who's in?", 94, 1230, 54, 900, "#ffffff", 880);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;

  const fileName = `find-my-screen-${slugify(venue.name)}-${slugify(nextRace.name)}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (action === "share" && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `${nextRace.name} watch plan`,
      text: `${venue.name}, ${venue.area}`,
      files: [file]
    });
    return;
  }

  downloadBlob(blob, fileName);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  weight: number,
  color: string,
  maxWidth?: number
) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  ctx.textBaseline = "alphabetic";

  if (!maxWidth || ctx.measureText(text).width <= maxWidth) {
    ctx.fillText(text, x, y);
    return;
  }

  let output = text;
  while (output.length > 3 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  ctx.fillText(`${output}...`, x, y);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function PhoneReveal({ venueName, phone, mapUrl }: { venueName: string; phone: string; mapUrl: string }) {
  const hasPhone = phone !== "Phone number not available yet";

  return (
    <div className="phone-reveal" role="status">
      <span>Phone number</span>
      <strong>{phone}</strong>
      <p>{venueName}</p>
      {hasPhone ? (
        <a href={`tel:${phone}`}>Call now</a>
      ) : (
        <a href={mapUrl} target="_blank" rel="noreferrer">Open map to find contact</a>
      )}
    </div>
  );
}
