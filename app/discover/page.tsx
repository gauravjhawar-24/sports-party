import Link from "next/link";
import { nextRace, venues } from "../../lib/venues";

const verifiedVenues = venues.filter(
  (venue) => venue.evidenceTag === "Verified",
);
const areaCount = new Set(venues.map((venue) => venue.area)).size;

const sports = [
  {
    name: "Formula 1",
    state: "Live in Bangalore",
    href: "/f1",
    isLive: true,
  },
  {
    name: "Cricket",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
  {
    name: "Football",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
  {
    name: "UFC",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
];

const cities = [
  {
    name: "Bangalore",
    state: `${verifiedVenues.length} verified screens`,
    href: "/f1",
    isLive: true,
  },
  {
    name: "Mumbai",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
  {
    name: "Delhi NCR",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
  {
    name: "Pune",
    state: "Coming soon",
    href: "",
    isLive: false,
  },
];

export default function DiscoverPage() {
  return (
    <main className="discover-page">
      <nav className="discover-nav" aria-label="FindMyScreen discovery">
        <Link href="/">FindMyScreen</Link>
        <span>Bangalore live</span>
      </nav>

      <section className="discover-hero" aria-label="Choose a screening">
        <div>
          <p className="discover-kicker">Discovery hub</p>
          <h1>Pick the sport. Pick the city. Find the screen.</h1>
          <p>
            FindMyScreen is starting with Formula 1 screenings in Bangalore. The
            same flow will open for cricket, football, UFC and more.
          </p>
        </div>

        <aside className="discover-live-board" aria-label="Available now">
          <span>
            <i /> Available now
          </span>
          <h2>{nextRace.name}</h2>
          <dl>
            <div>
              <dt>Sport</dt>
              <dd>Formula 1</dd>
            </div>
            <div>
              <dt>City</dt>
              <dd>Bangalore</dd>
            </div>
            <div>
              <dt>Start</dt>
              <dd>{nextRace.raceTime}</dd>
            </div>
            <div>
              <dt>Venues</dt>
              <dd>{venues.length} signals</dd>
            </div>
          </dl>
          <Link href="/f1">Open F1 board →</Link>
        </aside>
      </section>

      <section className="discover-grid" aria-label="Discovery filters">
        <div className="discover-filter">
          <div className="discover-filter-head">
            <span>01 / Sport</span>
            <h2>What are you watching?</h2>
          </div>
          <div className="discover-choice-grid">
            {sports.map((sport) =>
              sport.isLive ? (
                <Link
                  className="discover-choice discover-choice-live"
                  href={sport.href}
                  key={sport.name}
                >
                  <strong>{sport.name}</strong>
                  <span>{sport.state}</span>
                </Link>
              ) : (
                <div
                  className="discover-choice discover-choice-disabled"
                  aria-disabled="true"
                  key={sport.name}
                >
                  <strong>{sport.name}</strong>
                  <span>{sport.state}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="discover-filter">
          <div className="discover-filter-head">
            <span>02 / City</span>
            <h2>Where are you?</h2>
          </div>
          <div className="discover-choice-grid">
            {cities.map((city) =>
              city.isLive ? (
                <Link
                  className="discover-choice discover-choice-live"
                  href={city.href}
                  key={city.name}
                >
                  <strong>{city.name}</strong>
                  <span>{city.state}</span>
                </Link>
              ) : (
                <div
                  className="discover-choice discover-choice-disabled"
                  aria-disabled="true"
                  key={city.name}
                >
                  <strong>{city.name}</strong>
                  <span>{city.state}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="discover-available" aria-label="Live combinations">
        <div className="discover-filter-head">
          <span>03 / Live routes</span>
          <h2>Start with what is live.</h2>
        </div>

        <div className="discover-route-list">
          <Link className="discover-route discover-route-live" href="/f1">
            <time>Live</time>
            <div>
              <strong>Formula 1 in Bangalore</strong>
              <span>
                {nextRace.name} / {verifiedVenues.length} verified screens /{" "}
                {areaCount} areas
              </span>
            </div>
            <b>Find screens →</b>
          </Link>

          <div className="discover-route">
            <time>Next</time>
            <div>
              <strong>Cricket, football and UFC boards</strong>
              <span>
                Same event → area → venue → watch-plan flow, opening after the
                F1 board proves the loop.
              </span>
            </div>
            <b>Coming soon</b>
          </div>
        </div>
      </section>
    </main>
  );
}
