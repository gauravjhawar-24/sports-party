import Link from "next/link";
import { redirect } from "next/navigation";
import { nextRace } from "../lib/venues";

type LandingPageProps = {
  searchParams: Promise<{
    area?: string;
    invite?: string;
  }>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;

  if (params.area) {
    const nextParams = new URLSearchParams({ area: params.area });

    if (params.invite) {
      nextParams.set("invite", params.invite);
    }

    redirect(`/f1?${nextParams.toString()}${params.invite === "1" ? "#invite-card" : ""}`);
  }

  return (
    <main className="find-my-screen-landing">
      <section className="landing-hero">
        <nav className="landing-nav" aria-label="Find my Screen">
          <div className="landing-brand">
            <span>FMS</span>
            <strong>Find my Screen</strong>
          </div>
        </nav>

        <div className="landing-hero-grid">
          <div className="landing-copy">
            <div className="flag-ribbon" aria-label="Sports countries">
              <span>India</span>
              <span>England</span>
              <span>Italy</span>
              <span>Spain</span>
              <span>UAE</span>
            </div>
            <p className="landing-eyebrow">Bangalore match nights</p>
            <h1>Find the sports bar where your game is actually on.</h1>
            <p>
              Find my Screen helps fans pick one place for live screenings nearby. Search what is live, see the strongest pub
              pick, and send one plan to the group.
            </p>
          </div>

          <aside className="live-sport-panel" aria-label="Live sports available">
            <span>Live sports board</span>
            <div className="sport-input">
              <label htmlFor="sport-picker">What can I find today?</label>
              <input id="sport-picker" value="Formula 1" readOnly />
            </div>
            <div className="sport-pills" aria-label="Upcoming sports">
              <span>Cricket soon</span>
              <span>Football soon</span>
              <span>UFC soon</span>
            </div>
            <div className="sport-card">
              <small>Live in V1</small>
              <strong>{nextRace.name}</strong>
              <p>{nextRace.raceDate} - {nextRace.raceTime}</p>
              <Link href="/f1">See Bangalore pubs</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="landing-strip" aria-label="How Find my Screen helps">
        <div>
          <span>01</span>
          <strong>Search by area</strong>
          <p>Start with where your group can actually reach.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Get one best pick</strong>
          <p>Verified and high-signal venues rank above guesswork.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Share the plan</strong>
          <p>Send one invite card instead of three links.</p>
        </div>
      </section>
    </main>
  );
}
