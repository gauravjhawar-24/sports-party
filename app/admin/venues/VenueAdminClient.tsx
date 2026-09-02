"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { nextRace } from "../../../lib/venues";
import type { VenueSignalDraft } from "../../../lib/venueSignals";

type SearchResponse = {
  query: string;
  drafts: VenueSignalDraft[];
  credits: number | null;
  error?: string;
};

export function VenueAdminClient({
  initialCandidates,
}: {
  initialCandidates: Doc<"venueCandidates">[];
}) {
  const [query, setQuery] = useState(
    `${nextRace.name} screening Bangalore pubs`,
  );
  const [drafts, setDrafts] = useState<VenueSignalDraft[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [reviewingIds, setReviewingIds] = useState<string[]>([]);
  const candidates = useQuery(api.actions.latestVenueCandidates);
  const saveCandidate = useMutation(api.actions.createVenueCandidate);
  const reviewCandidate = useMutation(api.actions.reviewVenueCandidate);

  const counts = useMemo(() => {
    const rows = candidates ?? initialCandidates;
    return {
      needsReview: rows.filter(
        (candidate) => candidate.status === "needs_review",
      ).length,
      approved: rows.filter((candidate) => candidate.status === "approved")
        .length,
      rejected: rows.filter((candidate) => candidate.status === "rejected")
        .length,
    };
  }, [candidates, initialCandidates]);
  const reviewRows = useMemo(() => {
    return (candidates ?? initialCandidates).filter(
      (candidate) =>
        candidate.status === "needs_review" &&
        !reviewingIds.includes(candidate._id),
    );
  }, [candidates, initialCandidates, reviewingIds]);
  const approvedRows = useMemo(() => {
    return (candidates ?? initialCandidates).filter(
      (candidate) => candidate.status === "approved",
    );
  }, [candidates, initialCandidates]);

  async function findSignals(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSearching(true);
    setError("");
    setStatus("");

    const response = await fetch("/api/venue-signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = (await response.json()) as SearchResponse;

    setIsSearching(false);

    if (!response.ok) {
      setDrafts([]);
      setError(data.error ?? "Could not search venue signals.");
      return;
    }

    setDrafts(data.drafts);
    setStatus(
      data.drafts.length
        ? `Found ${data.drafts.length} draft signal${data.drafts.length === 1 ? "" : "s"} from ${data.credits ?? "unknown"} credit use.`
        : "No strong venue signals found. Try a more specific query.",
    );
  }

  async function saveDraft(draft: VenueSignalDraft) {
    await saveCandidate(draft);
    setStatus(`${draft.venueName} saved for review.`);
  }

  async function review(
    id: Id<"venueCandidates">,
    venueName: string,
    nextStatus: "approved" | "rejected",
  ) {
    setReviewingIds((current) => [...current, id]);
    setError("");
    setStatus(
      `${nextStatus === "approved" ? "Approving" : "Rejecting"} ${venueName}...`,
    );

    try {
      await reviewCandidate({ id, status: nextStatus });
      setStatus(
        nextStatus === "approved"
          ? `${venueName} approved and moved out of the review queue.`
          : `${venueName} rejected and moved out of the review queue.`,
      );
    } catch {
      setError(`Could not ${nextStatus} ${venueName}. Try once more.`);
      setReviewingIds((current) =>
        current.filter((reviewingId) => reviewingId !== id),
      );
    }
  }

  return (
    <main className="race-shell admin-shell">
      <header className="result-topbar">
        <Link href="/admin">Back to proof table</Link>
        <div>
          <span>Venue signals</span>
          <strong>Find, review, approve</strong>
        </div>
      </header>

      <section className="signal-console">
        <div className="section-heading">
          <span>Source query</span>
          <strong>Pull public F1 screening signals into a review queue</strong>
        </div>

        <form className="signal-form" onSubmit={findSignals}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Find venue signals"}
          </button>
        </form>

        {error ? <p className="signal-error">{error}</p> : null}
        {status ? <p className="signal-status">{status}</p> : null}

        <div className="signal-drafts">
          {drafts.map((draft) => (
            <article
              className="signal-card"
              key={`${draft.sourceUrl}-${draft.venueName}`}
            >
              <div>
                <span>{draft.signalType}</span>
                <strong>{draft.venueName}</strong>
                <p>
                  {draft.area} · confidence {draft.confidence}/100
                </p>
              </div>
              <p>{draft.rawSnippet}</p>
              <a href={draft.sourceUrl} target="_blank" rel="noreferrer">
                Open source
              </a>
              <button type="button" onClick={() => saveDraft(draft)}>
                Save for review
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-stats" aria-label="Venue signal summary">
        <article>
          <span>Needs review</span>
          <strong>{counts.needsReview}</strong>
        </article>
        <article>
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </article>
        <article>
          <span>Rejected</span>
          <strong>{counts.rejected}</strong>
        </article>
        <article>
          <span>Shown to users</span>
          <strong>{counts.approved}</strong>
        </article>
      </section>

      <section className="proof-table" aria-label="Venue review table">
        <div className="section-heading">
          <span>Review queue</span>
          <strong>Only rows waiting for review appear here</strong>
        </div>
        <p className="review-note">
          After approval, a row stays saved in Convex but leaves this queue and
          can appear in customer recommendations.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venue</th>
                <th>Area</th>
                <th>Signal</th>
                <th>Status</th>
                <th>Source</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {reviewRows.length ? (
                reviewRows.map((candidate) => (
                  <tr key={candidate._id}>
                    <td>{candidate.venueName}</td>
                    <td>{candidate.area}</td>
                    <td>
                      {candidate.signalType} · {candidate.confidence}/100
                    </td>
                    <td>{candidate.status.replace("_", " ")}</td>
                    <td>
                      <a
                        href={candidate.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source
                      </a>
                    </td>
                    <td>
                      <div className="review-actions">
                        <button
                          type="button"
                          onClick={() =>
                            review(
                              candidate._id,
                              candidate.venueName,
                              "approved",
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            review(
                              candidate._id,
                              candidate.venueName,
                              "rejected",
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No rows waiting for review.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="proof-table" aria-label="Approved venue table">
        <div className="section-heading">
          <span>Approved bars</span>
          <strong>
            These are saved in Convex and can appear in customer recommendations
          </strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venue</th>
                <th>Area</th>
                <th>Signal</th>
                <th>Proof</th>
                <th>Source</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {approvedRows.length ? (
                approvedRows.map((candidate) => (
                  <tr key={candidate._id}>
                    <td>{candidate.venueName}</td>
                    <td>{candidate.area}</td>
                    <td>
                      {candidate.signalType} · {candidate.confidence}/100
                    </td>
                    <td>
                      {candidate.verifiedBy &&
                      candidate.verifiedMethod &&
                      candidate.verifiedAt
                        ? `${candidate.verifiedBy} · ${candidate.verifiedMethod} · ${candidate.verifiedAt}`
                        : "Not yet confirmed"}
                    </td>
                    <td>
                      <a
                        href={candidate.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {candidate.sourceQuery === "Manual venue entry"
                          ? "Manual entry"
                          : "Source"}
                      </a>
                    </td>
                    <td>
                      {candidate.reviewedAt
                        ? new Date(candidate.reviewedAt).toLocaleString(
                            "en-IN",
                            { dateStyle: "medium", timeStyle: "short" },
                          )
                        : "Approved"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No approved bars yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
