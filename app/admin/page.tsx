"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function AdminPage() {
  const latestActions = useQuery(api.actions.latestActions);
  const latestSearches = useQuery(api.actions.latestSearches);
  const latestSeatBookings = useQuery(api.actions.latestSeatBookings);
  const stats = useQuery(api.actions.proofStats);
  const reviewSeatBooking = useMutation(api.actions.reviewSeatBooking);

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
        <div className="admin-link-actions">
          <Link href="/admin/screenings">Open screening inventory</Link>
          <Link href="/admin/venues">Open venue signals</Link>
        </div>
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
        <article>
          <span>Seat requests</span>
          <strong>{stats?.seatBookingRequests ?? 0}</strong>
        </article>
        <article>
          <span>Seats approved</span>
          <strong>{stats?.confirmedSeatBookings ?? 0}</strong>
        </article>
      </section>

      <section className="proof-table" aria-label="Saved action proof table">
        <div className="section-heading">
          <span>Seat bookings</span>
          <strong>Approve or reject pending seat requests</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Venue</th>
                <th>Saved</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {(latestSeatBookings ?? []).length ? (
                latestSeatBookings?.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.name}</td>
                    <td>{booking.email}</td>
                    <td>{booking.seats}</td>
                    <td>{booking.status}</td>
                    <td>
                      {booking.venueName}, {booking.venueArea}
                    </td>
                    <td>
                      {new Date(booking.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          disabled={booking.status === "confirmed"}
                          onClick={() =>
                            void reviewSeatBooking({
                              bookingId: booking._id as Id<"seatBookings">,
                              status: "confirmed",
                            })
                          }
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={booking.status === "cancelled"}
                          onClick={() =>
                            void reviewSeatBooking({
                              bookingId: booking._id as Id<"seatBookings">,
                              status: "cancelled",
                            })
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
                  <td colSpan={7}>No seat requests saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    seat_booking_requested: "Seat booking requested",
  };

  return labels[actionType] ?? actionType;
}
