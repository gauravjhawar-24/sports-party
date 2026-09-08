"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { nextRace } from "../../../lib/venues";

type ScreeningForm = {
  screeningId?: Id<"screenings">;
  eventKey: string;
  venueId: string;
  venueName: string;
  venueArea: string;
  totalSeats: string;
  confirmedBookedSeats: string;
  priceLabel: string;
  bookingRules: string;
  bookingClosesAt: string;
};

const emptyForm: ScreeningForm = {
  eventKey: nextRace.eventKey,
  venueId: "",
  venueName: "",
  venueArea: "",
  totalSeats: "30",
  confirmedBookedSeats: "0",
  priceLabel: "Rs 499 deposit",
  bookingRules: "Entry is confirmed only after ops approval.",
  bookingClosesAt: "Sunday, 6 Sep 2026, 5:00 PM IST",
};

export function ScreeningsAdminClient({
  initialScreenings,
}: {
  initialScreenings: Doc<"screenings">[];
}) {
  const screenings =
    useQuery(api.actions.latestScreenings) ?? initialScreenings;
  const saveScreening = useMutation(api.actions.upsertScreeningInventory);
  const [form, setForm] = useState<ScreeningForm>(emptyForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const summary = useMemo(() => {
    return {
      rows: screenings.length,
      totalSeats: screenings.reduce((sum, row) => sum + row.totalSeats, 0),
      booked: screenings.reduce(
        (sum, row) => sum + row.confirmedBookedSeats,
        0,
      ),
    };
  }, [screenings]);

  function updateField(field: keyof ScreeningForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editScreening(screening: Doc<"screenings">) {
    setForm({
      screeningId: screening._id,
      eventKey: screening.eventKey,
      venueId: screening.venueId,
      venueName: screening.venueName,
      venueArea: screening.venueArea,
      totalSeats: String(screening.totalSeats),
      confirmedBookedSeats: String(screening.confirmedBookedSeats),
      priceLabel: screening.priceLabel,
      bookingRules: screening.bookingRules,
      bookingClosesAt: screening.bookingClosesAt,
    });
    setStatus(`Editing ${screening.venueName}.`);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus("");
    setError("");

    const requiredFields = [
      form.eventKey,
      form.venueId,
      form.venueName,
      form.venueArea,
      form.priceLabel,
      form.bookingRules,
      form.bookingClosesAt,
    ];
    const totalSeats = Number(form.totalSeats);
    const confirmedBookedSeats = Number(form.confirmedBookedSeats);

    if (requiredFields.some((field) => !field.trim())) {
      setError("Fill all fields before saving inventory.");
      setIsSaving(false);
      return;
    }

    if (
      !Number.isFinite(totalSeats) ||
      !Number.isFinite(confirmedBookedSeats)
    ) {
      setError("Seat fields must be numbers.");
      setIsSaving(false);
      return;
    }

    try {
      await saveScreening({
        screeningId: form.screeningId,
        eventKey: form.eventKey,
        venueId: form.venueId,
        venueName: form.venueName,
        venueArea: form.venueArea,
        totalSeats,
        confirmedBookedSeats,
        priceLabel: form.priceLabel,
        bookingRules: form.bookingRules,
        bookingClosesAt: form.bookingClosesAt,
      });
      setStatus(`${form.venueName || "Screening"} inventory saved.`);
    } catch {
      setError("Could not save this inventory row. Check all fields.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="race-shell admin-shell">
      <header className="result-topbar">
        <Link href="/admin">Back to admin</Link>
        <div>
          <span>Admin</span>
          <strong>Screening inventory</strong>
        </div>
      </header>

      <section className="admin-stats" aria-label="Screening inventory summary">
        <article>
          <span>Screenings</span>
          <strong>{summary.rows}</strong>
        </article>
        <article>
          <span>Total seats</span>
          <strong>{summary.totalSeats}</strong>
        </article>
        <article>
          <span>Already booked</span>
          <strong>{summary.booked}</strong>
        </article>
        <article>
          <span>Available base</span>
          <strong>{Math.max(0, summary.totalSeats - summary.booked)}</strong>
        </article>
      </section>

      <section
        className="screening-editor"
        aria-label="Edit screening inventory"
      >
        <div className="section-heading">
          <span>{form.screeningId ? "Edit row" : "New row"}</span>
          <strong>
            {form.screeningId
              ? `Update ${form.venueName}`
              : "Add venue inventory"}
          </strong>
        </div>

        <form className="screening-editor-form" onSubmit={submit}>
          <label>
            Event key
            <input
              value={form.eventKey}
              onChange={(event) => updateField("eventKey", event.target.value)}
            />
          </label>
          <label>
            Venue ID
            <input
              value={form.venueId}
              onChange={(event) => updateField("venueId", event.target.value)}
              placeholder="socials-indiranagar"
            />
          </label>
          <label>
            Venue name
            <input
              value={form.venueName}
              onChange={(event) => updateField("venueName", event.target.value)}
              placeholder="Socials"
            />
          </label>
          <label>
            Area
            <input
              value={form.venueArea}
              onChange={(event) => updateField("venueArea", event.target.value)}
              placeholder="Indiranagar"
            />
          </label>
          <label>
            Total seats
            <input
              min="1"
              type="number"
              value={form.totalSeats}
              onChange={(event) =>
                updateField("totalSeats", event.target.value)
              }
            />
          </label>
          <label>
            Already booked
            <input
              min="0"
              type="number"
              value={form.confirmedBookedSeats}
              onChange={(event) =>
                updateField("confirmedBookedSeats", event.target.value)
              }
            />
          </label>
          <label>
            Price/deposit
            <input
              value={form.priceLabel}
              onChange={(event) =>
                updateField("priceLabel", event.target.value)
              }
            />
          </label>
          <label>
            Booking closes
            <input
              value={form.bookingClosesAt}
              onChange={(event) =>
                updateField("bookingClosesAt", event.target.value)
              }
            />
          </label>
          <label className="screening-editor-wide">
            Rules
            <textarea
              value={form.bookingRules}
              onChange={(event) =>
                updateField("bookingRules", event.target.value)
              }
            />
          </label>

          <div className="screening-editor-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save inventory"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ ...emptyForm });
                setStatus("Ready for a new inventory row.");
                setError("");
              }}
            >
              New row
            </button>
            {status ? <p className="action-status">{status}</p> : null}
            {error ? <p className="email-error">{error}</p> : null}
          </div>
        </form>
      </section>

      <section className="proof-table" aria-label="Current screening inventory">
        <div className="section-heading">
          <span>Inventory rows</span>
          <strong>Current screening capacity saved in Convex</strong>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venue</th>
                <th>Area</th>
                <th>Total</th>
                <th>Booked</th>
                <th>Price</th>
                <th>Closes</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {screenings.length ? (
                screenings.map((screening) => (
                  <tr key={screening._id}>
                    <td>{screening.venueName}</td>
                    <td>{screening.venueArea}</td>
                    <td>{screening.totalSeats}</td>
                    <td>{screening.confirmedBookedSeats}</td>
                    <td>{screening.priceLabel}</td>
                    <td>{screening.bookingClosesAt}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => editScreening(screening)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>No screening inventory saved yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
