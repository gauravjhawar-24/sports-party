import Link from "next/link";
import { redirect } from "next/navigation";
import { nextRace, venues, type Venue } from "../lib/venues";

type LandingPageProps = {
  searchParams: Promise<{
    area?: string;
    invite?: string;
  }>;
};

const verifiedVenues = venues.filter(
  (venue) => venue.evidenceTag === "Verified",
);
const activeVenueCount = venues.length;
const activeAreaCount = new Set(venues.map((venue) => venue.area)).size;
const sampleVenues = [
  verifiedVenues[0],
  verifiedVenues[1],
  venues.find((venue) => venue.name.includes("Buffalo")),
  venues.find((venue) => venue.name.includes("Big Pitcher")),
].filter((venue): venue is Venue => Boolean(venue));

const sports = [
  { label: "Formula 1", state: "live now" },
  { label: "Cricket", state: "coming next" },
  { label: "Football", state: "coming next" },
  { label: "UFC", state: "coming next" },
];

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;

  if (params.area) {
    const nextParams = new URLSearchParams({ area: params.area });

    if (params.invite) {
      nextParams.set("invite", params.invite);
    }

    redirect(
      `/f1?${nextParams.toString()}${params.invite === "1" ? "#invite-card" : ""}`,
    );
  }

  return (
    <main className="findmyscreen-landing">
      <nav className="landing-nav" aria-label="FindMyScreen">
        <Link className="landing-wordmark" href="/">
          FindMyScreen
        </Link>
        <div>
          <span>Bangalore ↓</span>
          <a href="#how-it-works">How it works</a>
          <Link href="/discover">Find a screening →</Link>
        </div>
      </nav>

      <section className="landing-hero" aria-label="Find live screenings">
        <div className="landing-hero-copy">
          <p className="landing-kicker">
            Bangalore / sports-screening discovery
          </p>
          <h1>Where are you watching?</h1>
          <p>
            Find bars and venues actually screening the match, race or fight you
            want to watch with your people.
          </p>

          <form className="landing-search" action="/discover">
            <label htmlFor="landing-event">Search a match, race or event</label>
            <div>
              <input
                id="landing-event"
                value="Choose sport and city"
                readOnly
              />
              <button type="submit">Find a screening →</button>
            </div>
          </form>

          <div className="landing-sport-chips" aria-label="Sports">
            {sports.map((sport) => (
              <span key={sport.label} data-live={sport.state === "live now"}>
                <b>{sport.label}</b>
                <small>{sport.state}</small>
              </span>
            ))}
          </div>

          <form className="landing-join-code" action="/f1/join">
            <label htmlFor="landing-invite-code">
              Have a watch-party code?
            </label>
            <div>
              <input
                id="landing-invite-code"
                name="code"
                placeholder="Enter invite code"
              />
              <button type="submit">Join party</button>
            </div>
          </form>
        </div>

        <SignalMap />
      </section>

      <section
        className="landing-live-strip"
        aria-label="Bangalore live status"
      >
        <span>Bangalore / live</span>
        <strong>
          <i /> {verifiedVenues.length} verified screens
        </strong>
        <strong>{activeVenueCount} venue signals</strong>
        <strong>{activeAreaCount} areas covered</strong>
      </section>

      <section className="landing-section" aria-label="What's on">
        <div className="landing-section-heading">
          <span>Bangalore / this week</span>
          <h2>What’s on</h2>
        </div>
        <div className="event-row-list">
          <Link className="event-row event-row-live" href="/f1">
            <span>01</span>
            <div>
              <h3>{nextRace.name}</h3>
              <p>
                Formula 1 / {nextRace.raceDate.replace("Sunday, ", "Sun ")} /{" "}
                {nextRace.raceTime}
              </p>
            </div>
            <strong>{verifiedVenues.length} verified screens</strong>
            <em>→</em>
          </Link>
          <div className="event-row event-row-muted">
            <span>02</span>
            <div>
              <h3>Cricket watch nights</h3>
              <p>Coming next</p>
            </div>
            <strong>Not live yet</strong>
            <em>→</em>
          </div>
          <div className="event-row event-row-muted">
            <span>03</span>
            <div>
              <h3>Football screenings</h3>
              <p>Coming next</p>
            </div>
            <strong>Not live yet</strong>
            <em>→</em>
          </div>
        </div>
      </section>

      <section
        className="landing-flow"
        id="how-it-works"
        aria-label="How it works"
      >
        <div className="landing-section-heading">
          <span>From event to screen in seconds</span>
          <h2>Pick the event. Pick the area. Pick the screen.</h2>
        </div>
        <div className="flow-board">
          <div>
            <span>01 / Event</span>
            <strong>Match, race or fight</strong>
            <p>
              Formula 1 is live first. Cricket, football and UFC follow the same
              flow.
            </p>
          </div>
          <div>
            <span>02 / Area</span>
            <strong>Indiranagar</strong>
            <p>Also HSR, Bellandur, MG Road, Whitefield and more.</p>
          </div>
          <div>
            <span>03 / Screen</span>
            <ol>
              {sampleVenues.slice(0, 3).map((venue, index) => (
                <li key={venue.id}>
                  <b>0{index + 1}</b>
                  <strong>{venue.name}</strong>
                  <small>
                    {venue.evidenceTag} <i />
                  </small>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="journey-section" aria-label="Host and joiner flows">
        <div className="landing-section-heading">
          <span>Two ways into the plan</span>
          <h2>Host the night. Or just say if you’re in.</h2>
          <p>
            One person picks the screen and creates the plan. Everyone else gets
            one link, one decision and one live headcount.
          </p>
        </div>
        <div className="journey-grid">
          <JourneyColumn
            label="Host flow"
            summary="For the person making the plan and sending it to the group."
            steps={[
              {
                title: "Find a screening",
                detail: "Enter the area where the group can actually reach.",
                image: "/landing-flow/host-01-find-screening.png",
              },
              {
                title: "Pick the venue",
                detail: "Choose the strongest screen from the ranked list.",
                image: "/landing-flow/host-02-pick-venue.png",
              },
              {
                title: "Create the plan",
                detail:
                  "Open one race plan with the venue, map and share link.",
                image: "/landing-flow/host-03-race-plan.png",
              },
              {
                title: "Track plans later",
                detail: "Use host email to reopen every watch party created.",
                image: "/landing-flow/host-04-my-plans.png",
              },
            ]}
          />
          <JourneyColumn
            label="Joiner flow"
            summary="For the friend who gets the link and needs to answer fast."
            steps={[
              {
                title: "Open the invite",
                detail: "See the race, venue, area and time in one place.",
                image: "/landing-flow/joiner-01-open-invite.png",
              },
              {
                title: "Check the group",
                detail: "See who is in, maybe or out before deciding.",
                image: "/landing-flow/joiner-02-rsvp-and-status.png",
                crop: "mid",
              },
              {
                title: "RSVP",
                detail:
                  "Enter name, choose in, maybe or out, and update the plan.",
                image: "/landing-flow/joiner-02-rsvp-and-status.png",
                crop: "low",
              },
            ]}
          />
        </div>
      </section>

      <section className="verified-story" aria-label="Verified screenings">
        <div className="verified-copy">
          <h2>
            <span>Not</span> “they probably have it on.”
          </h2>
          <h3>Actually screening it.</h3>
          <p>
            Stop calling five bars to find out who is showing the race. Start
            with the places that have the strongest signal.
          </p>
        </div>
        <div className="verified-pass">
          <span>
            <i /> Verified screening
          </span>
          <dl>
            <div>
              <dt>Screening</dt>
              <dd>Confirmed</dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>{nextRace.name}</dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{nextRace.raceTime}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>{verifiedVenues[0]?.name ?? "Verified venue"}</dd>
            </div>
            <div>
              <dt>Area</dt>
              <dd>{verifiedVenues[0]?.area ?? "Bangalore"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="watch-plan-preview" aria-label="Watch with friends">
        <div>
          <span>Found the screen?</span>
          <h2>Send it to the group.</h2>
          <p>
            Turn one venue into one shareable plan, then let friends RSVP in,
            maybe or out.
          </p>
        </div>
        <aside>
          <span>Watch plan / 014</span>
          <strong>{nextRace.name}</strong>
          <h3>{verifiedVenues[0]?.name ?? "Pecos"}</h3>
          <p>
            {verifiedVenues[0]?.area ?? "Bangalore"} / {nextRace.raceTime}
          </p>
          <div>
            <b>
              04<small>In</small>
            </b>
            <b>
              02<small>Maybe</small>
            </b>
          </div>
          <Link href="/discover">Share plan →</Link>
        </aside>
      </section>

      <section className="tonight-board" aria-label="Bangalore tonight">
        <div className="landing-section-heading">
          <span>Bangalore / tonight</span>
          <h2>Live board</h2>
        </div>
        <Link href="/f1">
          <time>18:30</time>
          <div>
            <span>Live now</span>
            <strong>{nextRace.name}</strong>
          </div>
          <em>{verifiedVenues.length} verified screens</em>
          <b>→</b>
        </Link>
        <div>
          <time>Next</time>
          <div>
            <span>Cricket / Football / UFC</span>
            <strong>More live boards coming next</strong>
          </div>
          <em>Not live yet</em>
          <b>→</b>
        </div>
      </section>

      <section className="landing-final-cta" aria-label="Find your screen">
        <h2>The game is on. Where are you?</h2>
        <Link href="/discover">Find a screening →</Link>
      </section>

      <footer className="landing-footer">
        <strong>FindMyScreen</strong>
        <p>Find screenings. Pick a place. Bring your people.</p>
        <span>Bangalore</span>
      </footer>
    </main>
  );
}

function JourneyColumn({
  label,
  summary,
  steps,
}: {
  label: string;
  summary: string;
  steps: {
    title: string;
    detail: string;
    image: string;
    crop?: "mid" | "low";
  }[];
}) {
  return (
    <article className="journey-column">
      <div className="journey-column-head">
        <span>{label}</span>
        <p>{summary}</p>
      </div>
      <div className="journey-steps">
        {steps.map((step, index) => (
          <section className="journey-step" key={step.title}>
            <div className="journey-step-copy">
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
            <div className="journey-phone-frame">
              <img
                src={step.image}
                alt={`${label}: ${step.title}`}
                className={step.crop ? `journey-crop-${step.crop}` : undefined}
              />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function SignalMap() {
  return (
    <aside className="signal-map" aria-label="City screening signals">
      <div className="signal-core">
        <span>You</span>
      </div>
      <div className="signal-point signal-point-one">
        <i />
        Pecos <small>Verified</small>
      </div>
      <div className="signal-point signal-point-two">
        <i />
        Doff <small>8:30 PM</small>
      </div>
      <div className="signal-point signal-point-three">
        <i />
        BWW <small>Live signal</small>
      </div>
      <div className="signal-point signal-point-four">
        <i />
        Big Pitcher <small>Near HSR</small>
      </div>
      <div className="signal-stat">
        Live
        <br />
        signals
      </div>
    </aside>
  );
}
