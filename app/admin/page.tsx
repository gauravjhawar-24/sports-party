"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminPage() {
  const latestActions = useQuery(api.actions.latestActions);
  const latestSearches = useQuery(api.actions.latestSearches);
  const stats = useQuery(api.actions.proofStats);

  return (
    <main className="race-shell admin-shell">
      <header className="result-topbar">
        <Link href="/f1">Back to product</Link>
        <div>
          <span>Admin</span>
          <strong>FindMyScreen proof table</strong>
        </div>
      </header>

      <section className="admin-link-panel">
        <div>
          <span>Data pipeline</span>
          <strong>Find public venue signals before customers see them.</strong>
        </div>
        <Link href="/admin/venues">Open venue signals</Link>
      </section>

      <section className="admin-stats" aria-label="Proof summary">
        <article>
          <span>Searches</span>
          <strong>{stats?.searches ?? 0}</strong>
        </article>
        <article>
          <span>Meaningful actions</span>
          <strong>{stats?.meaningfulActions ?? 0}</strong>
        </article>
        <article>
          <span>Share invites</span>
          <strong>{stats?.shareInvites ?? 0}</strong>
        </article>
        <article>
          <span>Plans locked</span>
          <strong>{stats?.lockedPlans ?? 0}</strong>
        </article>
        <article>
          <span>Reservation handoffs</span>
          <strong>{stats?.reservationHandoffs ?? 0}</strong>
        </article>
        <article>
          <span>Reservations confirmed</span>
          <strong>{stats?.reservationConfirmations ?? 0}</strong>
        </article>
        <article>
          <span>Calendar adds</span>
          <strong>{stats?.calendarAdds ?? 0}</strong>
        </article>
      </section>

      <section className="proof-table" aria-label="Saved action proof table">
        <div className="section-heading">
          <span>Actions</span>
          <strong>Latest watch-party actions saved in Convex</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Action</th>
                <th>Venue</th>
                <th>Area</th>
                <th>Saved</th>
              </tr>
            </thead>
            <tbody>
              {(latestActions ?? []).length ? (
                latestActions?.map((action) => (
                  <tr key={action._id}>
                    <td>{action.email}</td>
                    <td>{actionLabel(action.actionType)}</td>
                    <td>{action.venueName}</td>
                    <td>{action.areaInput || action.normalizedArea}</td>
                    <td>
                      {new Date(action.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No actions saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="proof-table" aria-label="Saved searches proof table">
        <div className="section-heading">
          <span>Searches</span>
          <strong>Latest area searches saved in Convex</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Area input</th>
                <th>Matched area</th>
                <th>Best venue</th>
                <th>Results</th>
                <th>Saved</th>
              </tr>
            </thead>
            <tbody>
              {(latestSearches ?? []).length ? (
                latestSearches?.map((search) => (
                  <tr key={search._id}>
                    <td>{search.areaInput || "Blank"}</td>
                    <td>{search.normalizedArea || "Unsupported"}</td>
                    <td>{search.bestVenueId}</td>
                    <td>{search.resultVenueIds.length}</td>
                    <td>
                      {new Date(search.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No searches saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function actionLabel(actionType: string) {
  const labels: Record<string, string> = {
    share_invite: "Share invite",
    call_pub: "Call pub",
    create_watch_party: "Create watch party",
    lock_plan: "Lock plan",
    reservation_handoff_started: "Reservation handoff started",
    reservation_confirmed_by_host: "Reservation confirmed by host",
    calendar_add_clicked: "Calendar add clicked",
  };

  return labels[actionType] ?? actionType;
}
