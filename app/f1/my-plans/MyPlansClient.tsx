"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const hostEmailKey = "findmyscreen-last-host-email";

export function MyPlansClient() {
  const [hostEmail, setHostEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");
  const plans = useQuery(
    api.actions.watchPartiesWithStatsByHostEmail,
    submittedEmail ? { hostEmail: submittedEmail } : "skip"
  );

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(hostEmailKey);
    if (!savedEmail) return;

    setHostEmail(savedEmail);
    setSubmittedEmail(savedEmail);
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = hostEmail.trim().toLowerCase();

    if (!email) {
      setError("Enter the host email used to create the plan.");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSubmittedEmail(email);
    window.localStorage.setItem(hostEmailKey, email);
  }

  return (
    <main className="my-plans-page">
      <header className="my-plans-topbar">
        <Link href="/f1">← Find another screening</Link>
        <span>FindMyScreen</span>
      </header>

      <section className="my-plans-hero" aria-label="My watch parties">
        <div className="race-plan-slash" aria-hidden="true" />
        <div className="my-plans-copy">
          <p>Race control / My plans</p>
          <h1>Your watch parties.</h1>
          <span>Enter the host email and reopen every race plan you created.</span>
        </div>

        <form className="my-plans-form" onSubmit={submit}>
          <label htmlFor="host-email">Host email</label>
          <div>
            <input
              id="host-email"
              value={hostEmail}
              onChange={(event) => setHostEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
            />
            <button type="submit">Find plans</button>
          </div>
          {error ? <p className="area-error">{error}</p> : null}
        </form>
      </section>

      <section className="my-plans-results" aria-label="Created watch parties">
        <div className="my-plans-results-header">
          <span>Created plans</span>
          <strong>{submittedEmail || "Enter host email"}</strong>
        </div>

        {!submittedEmail ? (
          <p className="my-plans-empty">Your plans will appear here after you search by host email.</p>
        ) : null}

        {submittedEmail && plans === undefined ? (
          <p className="my-plans-empty">Checking your plans...</p>
        ) : null}

        {plans?.length === 0 ? (
          <p className="my-plans-empty">No watch parties found for this email.</p>
        ) : null}

        {plans?.length ? (
          <div className="my-plans-grid">
            {plans.map(({ party, counts }, index) => (
              <article className="my-plan-card" key={party._id}>
                <div className="my-plan-rank">P{index + 1}</div>
                <div className="my-plan-main">
                  <span>{party.raceName}</span>
                  <h2>{party.venueName}</h2>
                  <p>{party.venueArea} · {party.raceDate} · {party.raceTime}</p>
                </div>
                <div className="my-plan-counts" aria-label="RSVP counts">
                  <span><b>{counts.in}</b> In</span>
                  <span><b>{counts.maybe}</b> Maybe</span>
                  <span><b>{counts.out}</b> Out</span>
                </div>
                <Link href={`/f1/party/${party._id}`}>Open plan →</Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
