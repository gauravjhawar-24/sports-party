import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { nextRace, venues } from "../lib/venues";

const venueCandidateArgs = {
  sourceQuery: v.string(),
  sourceTitle: v.string(),
  sourceUrl: v.string(),
  rawSnippet: v.string(),
  venueName: v.string(),
  area: v.string(),
  raceName: v.string(),
  signalType: v.union(
    v.literal("Verified"),
    v.literal("Posted about F1"),
    v.literal("Regular F1 venue"),
    v.literal("Needs call"),
  ),
  confidence: v.number(),
  verifiedBy: v.optional(v.string()),
  verifiedMethod: v.optional(v.string()),
  verifiedAt: v.optional(v.string()),
};

const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeInviteCode() {
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += inviteAlphabet[Math.floor(Math.random() * inviteAlphabet.length)];
  }
  return code;
}

function screeningKey(name: string, area: string) {
  return `${normalizeInventoryKey(name)}|${normalizeInventoryKey(area)}`;
}

function normalizeInventoryKey(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function resolveInventoryVenue(
  ctx: MutationCtx,
  venueId: string,
): Promise<{ venueId: string; venueName: string; venueArea: string }> {
  const staticVenue = venues.find((venue) => venue.id === venueId);

  if (staticVenue) {
    return {
      venueId: staticVenue.id,
      venueName: staticVenue.name,
      venueArea: staticVenue.area,
    };
  }

  if (venueId.startsWith("approved-")) {
    const approvedId = venueId.replace(/^approved-/, "");
    const approvedVenues = await ctx.db
      .query("venueCandidates")
      .withIndex("by_status_and_created_at", (q) =>
        q.eq("status", "approved"),
      )
      .collect();
    const approvedVenue =
      approvedVenues.find((venue) => String(venue._id) === approvedId) ?? null;

    if (approvedVenue) {
      return {
        venueId: `approved-${approvedVenue._id}`,
        venueName: approvedVenue.venueName,
        venueArea:
          approvedVenue.area === "Needs area check"
            ? "Bangalore"
            : approvedVenue.area,
      };
    }
  }

  throw new Error("Choose a venue from the approved venue list");
}

const inventoryEvents = [
  {
    eventKey: nextRace.eventKey,
    sport: "Formula 1",
    name: nextRace.name,
    displayDate: nextRace.raceDate,
    displayTime: nextRace.raceTime,
  },
];

function resolveInventoryEvent(eventKey: string) {
  const event = inventoryEvents.find((option) => option.eventKey === eventKey);

  if (!event) {
    throw new Error("Choose an event from the fixed event list");
  }

  return event.eventKey;
}

export const inventoryEventOptions = query({
  args: {},
  handler: async () => inventoryEvents,
});

export const inventoryVenueOptions = query({
  args: {},
  handler: async (ctx) => {
    const approvedVenues = await ctx.db
      .query("venueCandidates")
      .withIndex("by_status_and_created_at", (q) =>
        q.eq("status", "approved"),
      )
      .collect();

    return [
      ...venues.map((venue) => ({
        venueId: venue.id,
        venueName: venue.name,
        venueArea: venue.area,
        source: "Fixed venue list",
      })),
      ...approvedVenues.map((venue) => ({
        venueId: `approved-${venue._id}`,
        venueName: venue.venueName,
        venueArea:
          venue.area === "Needs area check" ? "Bangalore" : venue.area,
        source: "Approved venue database",
      })),
    ].sort((left, right) =>
      `${left.venueArea} ${left.venueName}`.localeCompare(
        `${right.venueArea} ${right.venueName}`,
      ),
    );
  },
});

export const recordSearch = mutation({
  args: {
    areaInput: v.string(),
    normalizedArea: v.string(),
    bestVenueId: v.string(),
    resultVenueIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searches", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const recordAction = mutation({
  args: {
    email: v.string(),
    actionType: v.union(
      v.literal("share_invite"),
      v.literal("call_pub"),
      v.literal("create_watch_party"),
      v.literal("lock_plan"),
      v.literal("reservation_handoff_started"),
      v.literal("reservation_confirmed_by_host"),
      v.literal("calendar_add_clicked"),
    ),
    areaInput: v.string(),
    normalizedArea: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    raceName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("actions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const latestActions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("actions")
      .withIndex("by_created_at")
      .order("desc")
      .take(25);
  },
});

export const latestSearches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("searches")
      .withIndex("by_created_at")
      .order("desc")
      .take(25);
  },
});

export const latestBookingInterests = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bookingInterests")
      .withIndex("by_created_at")
      .order("desc")
      .take(25);
  },
});

export const proofStats = query({
  args: {},
  handler: async (ctx) => {
    const searches = await ctx.db.query("searches").collect();
    const actions = await ctx.db.query("actions").collect();
    const watchParties = await ctx.db.query("watchParties").collect();
    const rsvps = await ctx.db.query("rsvps").collect();
    const seatBookings = await ctx.db.query("seatBookings").collect();
    const shareInvites = actions.filter(
      (action) => action.actionType === "share_invite",
    ).length;
    const callPubs = actions.filter(
      (action) => action.actionType === "call_pub",
    ).length;
    const createdParties = watchParties.length;
    const lockedPlans = watchParties.filter((party) => party.lockedAt).length;
    const reservationHandoffs = watchParties.filter(
      (party) => party.reservationHandoffAt,
    ).length;
    const reservationConfirmations = watchParties.filter(
      (party) => party.reservationConfirmedAt,
    ).length;
    const calendarAdds = watchParties.filter(
      (party) => party.calendarAddedAt,
    ).length;

    return {
      searches: searches.length,
      meaningfulActions: actions.length,
      shareInvites,
      callPubs,
      createdParties,
      lockedPlans,
      reservationHandoffs,
      reservationConfirmations,
      calendarAdds,
      rsvps: rsvps.length,
      seatBookingRequests: seatBookings.length,
      confirmedSeatBookings: seatBookings.filter(
        (booking) => booking.status === "confirmed",
      ).length,
    };
  },
});

const v2SeedEvent = {
  eventKey: "f1-italian-grand-prix-2026",
  sport: "Formula 1",
  name: "Italian Grand Prix",
  startsAt: "2026-09-06T18:30:00+05:30",
  displayDate: "Sunday, 6 Sep 2026",
  displayTime: "6:30 PM IST",
};

const v2SeedScreening = {
  eventKey: v2SeedEvent.eventKey,
  venueId: "studz-sports-bar-bellandur",
  venueName: "Studz Sports Bar",
  venueArea: "Bellandur",
  totalSeats: 30,
  confirmedBookedSeats: 14,
  priceLabel: "Rs 499 deposit",
  bookingRules: "Entry is confirmed only after venue confirmation.",
  bookingClosesAt: "Sunday, 6 Sep 2026, 5:00 PM IST",
};

async function findScreeningForBooking(
  ctx: MutationCtx,
  booking: {
    screeningId?: Id<"screenings">;
    eventKey: string;
    venueId: string;
    venueName: string;
    venueArea: string;
  },
) {
  const screenings = await ctx.db
    .query("screenings")
    .withIndex("by_eventKey", (q) => q.eq("eventKey", booking.eventKey))
    .collect();
  const matchingScreenings = screenings.filter(
    (screening) =>
      screening.venueId === booking.venueId ||
      screeningKey(screening.venueName, screening.venueArea) ===
        screeningKey(booking.venueName, booking.venueArea),
  );

  if (matchingScreenings.length) {
    return matchingScreenings.sort(
      (left, right) => right.updatedAt - left.updatedAt,
    )[0];
  }

  if (booking.screeningId) {
    const screening = await ctx.db.get(booking.screeningId);
    if (screening) return screening;
  }

  return (
    screenings.find(
      (screening) =>
        screeningKey(screening.venueName, screening.venueArea) ===
        screeningKey(booking.venueName, booking.venueArea),
    ) ?? null
  );
}

export const seedV2ScreeningInventory = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const existingEvent = await ctx.db
      .query("events")
      .withIndex("by_eventKey", (q) => q.eq("eventKey", v2SeedEvent.eventKey))
      .first();

    if (existingEvent) {
      await ctx.db.patch(existingEvent._id, {
        ...v2SeedEvent,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("events", {
        ...v2SeedEvent,
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingScreening = await ctx.db
      .query("screenings")
      .withIndex("by_eventKey_and_venueId", (q) =>
        q
          .eq("eventKey", v2SeedScreening.eventKey)
          .eq("venueId", v2SeedScreening.venueId),
      )
      .first();

    if (existingScreening) {
      await ctx.db.patch(existingScreening._id, {
        ...v2SeedScreening,
        updatedAt: now,
      });
      return existingScreening._id;
    }

    return await ctx.db.insert("screenings", {
      ...v2SeedScreening,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const screeningsForEvent = query({
  args: {
    eventKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("screenings")
      .withIndex("by_eventKey", (q) => q.eq("eventKey", args.eventKey))
      .collect();
  },
});

export const latestScreenings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("screenings")
      .withIndex("by_eventKey")
      .order("desc")
      .take(50);
    const seen = new Set<string>();
    const deduped = [];

    for (const row of rows) {
      const key = `${row.eventKey}|${screeningKey(row.venueName, row.venueArea)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(row);
    }

    return deduped;
  },
});

export const upsertScreeningInventory = mutation({
  args: {
    screeningId: v.optional(v.id("screenings")),
    eventKey: v.string(),
    venueId: v.string(),
    totalSeats: v.number(),
    confirmedBookedSeats: v.number(),
    priceLabel: v.string(),
    bookingRules: v.string(),
    bookingClosesAt: v.string(),
  },
  handler: async (ctx, args) => {
    const eventKey = args.eventKey.trim();
    const venueId = args.venueId.trim();
    const priceLabel = args.priceLabel.trim();
    const bookingRules = args.bookingRules.trim();
    const bookingClosesAt = args.bookingClosesAt.trim();
    const totalSeats = Math.floor(args.totalSeats);
    const confirmedBookedSeats = Math.floor(args.confirmedBookedSeats);

    if (!eventKey) throw new Error("Event key is required");
    if (!venueId) throw new Error("Venue ID is required");
    if (!priceLabel) throw new Error("Price is required");
    if (!bookingRules) throw new Error("Booking rules are required");
    if (!bookingClosesAt) throw new Error("Booking close time is required");
    if (totalSeats < 1) throw new Error("Total seats must be at least 1");
    if (confirmedBookedSeats < 0) {
      throw new Error("Already booked seats cannot be negative");
    }
    if (confirmedBookedSeats > totalSeats) {
      throw new Error("Already booked seats cannot exceed total seats");
    }

    const resolvedEventKey = resolveInventoryEvent(eventKey);
    const resolvedVenue = await resolveInventoryVenue(ctx, venueId);
    const now = Date.now();
    const canonicalKey = screeningKey(
      resolvedVenue.venueName,
      resolvedVenue.venueArea,
    );
    const payload = {
      eventKey: resolvedEventKey,
      venueId: resolvedVenue.venueId,
      venueName: resolvedVenue.venueName,
      venueArea: resolvedVenue.venueArea,
      totalSeats,
      confirmedBookedSeats,
      priceLabel,
      bookingRules,
      bookingClosesAt,
      updatedAt: now,
    };

    const eventScreenings = await ctx.db
      .query("screenings")
      .withIndex("by_eventKey", (q) => q.eq("eventKey", resolvedEventKey))
      .collect();
    const matchingScreenings = eventScreenings
      .filter(
        (screening) =>
          screening.venueId === resolvedVenue.venueId ||
          screeningKey(screening.venueName, screening.venueArea) ===
            canonicalKey,
      )
      .sort((left, right) => right.updatedAt - left.updatedAt);
    const requestedScreening = args.screeningId
      ? await ctx.db.get(args.screeningId)
      : null;
    const exactVenueScreening =
      matchingScreenings.find(
        (screening) => screening.venueId === resolvedVenue.venueId,
      ) ?? null;
    const existing =
      requestedScreening ?? exactVenueScreening ?? matchingScreenings[0];

    if (existing) {
      await ctx.db.patch(existing._id, payload);

      for (const duplicate of matchingScreenings) {
        if (duplicate._id !== existing._id) {
          await ctx.db.delete(duplicate._id);
        }
      }

      return existing._id;
    }

    return await ctx.db.insert("screenings", {
      ...payload,
      createdAt: now,
    });
  },
});

export const recordBookingInterest = mutation({
  args: {
    partyId: v.id("watchParties"),
    inviteCode: v.optional(v.string()),
    clientId: v.optional(v.string()),
    interested: v.boolean(),
    venueId: v.string(),
    venueName: v.string(),
    venueArea: v.string(),
    raceName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookingInterests", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const createWatchParty = mutation({
  args: {
    hostName: v.string(),
    hostEmail: v.string(),
    areaInput: v.string(),
    normalizedArea: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    venueArea: v.string(),
    venueEvidenceTag: v.string(),
    venueEvidence: v.string(),
    venueVibe: v.string(),
    mapUrl: v.string(),
    screeningId: v.optional(v.id("screenings")),
    screeningTotalSeats: v.optional(v.number()),
    screeningConfirmedBookedSeats: v.optional(v.number()),
    screeningPriceLabel: v.optional(v.string()),
    screeningBookingRules: v.optional(v.string()),
    screeningBookingClosesAt: v.optional(v.string()),
    bookMyShowUrl: v.optional(v.string()),
    swiggyDineoutUrl: v.optional(v.string()),
    districtUrl: v.optional(v.string()),
    eightClubUrl: v.optional(v.string()),
    highApeUrl: v.optional(v.string()),
    sortMySceneUrl: v.optional(v.string()),
    highwayDeliteUrl: v.optional(v.string()),
    skillboxesUrl: v.optional(v.string()),
    venuePhone: v.optional(v.string()),
    hostClientId: v.optional(v.string()),
    raceName: v.string(),
    raceDate: v.string(),
    raceTime: v.string(),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    let inviteCode = makeInviteCode();

    for (let attempts = 0; attempts < 5; attempts += 1) {
      const existing = await ctx.db
        .query("watchParties")
        .withIndex("by_inviteCode", (q) => q.eq("inviteCode", inviteCode))
        .first();

      if (!existing) break;
      inviteCode = makeInviteCode();
    }

    const partyId = await ctx.db.insert("watchParties", {
      hostName: args.hostName.trim(),
      hostEmail: args.hostEmail.trim().toLowerCase(),
      inviteCode,
      areaInput: args.areaInput,
      normalizedArea: args.normalizedArea,
      venueId: args.venueId,
      venueName: args.venueName,
      venueArea: args.venueArea,
      venueEvidenceTag: args.venueEvidenceTag,
      venueEvidence: args.venueEvidence,
      venueVibe: args.venueVibe,
      mapUrl: args.mapUrl,
      screeningId: args.screeningId,
      screeningTotalSeats: args.screeningTotalSeats,
      screeningConfirmedBookedSeats: args.screeningConfirmedBookedSeats,
      screeningPriceLabel: args.screeningPriceLabel,
      screeningBookingRules: args.screeningBookingRules,
      screeningBookingClosesAt: args.screeningBookingClosesAt,
      bookMyShowUrl: args.bookMyShowUrl,
      swiggyDineoutUrl: args.swiggyDineoutUrl,
      districtUrl: args.districtUrl,
      eightClubUrl: args.eightClubUrl,
      highApeUrl: args.highApeUrl,
      sortMySceneUrl: args.sortMySceneUrl,
      highwayDeliteUrl: args.highwayDeliteUrl,
      skillboxesUrl: args.skillboxesUrl,
      venuePhone: args.venuePhone,
      raceName: args.raceName,
      raceDate: args.raceDate,
      raceTime: args.raceTime,
      createdAt,
    });

    await ctx.db.insert("rsvps", {
      partyId,
      name: args.hostName.trim(),
      decision: "in",
      isHost: true,
      clientId: args.hostClientId,
      createdAt,
    });

    await ctx.db.insert("actions", {
      email: args.hostEmail.trim().toLowerCase(),
      actionType: "create_watch_party",
      areaInput: args.areaInput,
      normalizedArea: args.normalizedArea,
      venueId: args.venueId,
      venueName: args.venueName,
      raceName: args.raceName,
      createdAt,
    });

    return { partyId, inviteCode };
  },
});

async function recordPartyAction(
  ctx: MutationCtx,
  party: {
    hostEmail: string;
    areaInput: string;
    normalizedArea: string;
    venueId: string;
    venueName: string;
    raceName: string;
  },
  actionType:
    | "lock_plan"
    | "reservation_handoff_started"
    | "reservation_confirmed_by_host"
    | "calendar_add_clicked"
    | "seat_booking_requested",
) {
  await ctx.db.insert("actions", {
    email: party.hostEmail,
    actionType,
    areaInput: party.areaInput,
    normalizedArea: party.normalizedArea,
    venueId: party.venueId,
    venueName: party.venueName,
    raceName: party.raceName,
    createdAt: Date.now(),
  });
}

export const lockWatchPartyPlan = mutation({
  args: {
    partyId: v.id("watchParties"),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");
    if (party.lockedAt) return party.lockedAt;

    const lockedAt = Date.now();
    await ctx.db.patch(args.partyId, { lockedAt });
    await recordPartyAction(ctx, party, "lock_plan");
    return lockedAt;
  },
});

export const startReservationHandoff = mutation({
  args: {
    partyId: v.id("watchParties"),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");

    const reservationHandoffAt = party.reservationHandoffAt ?? Date.now();
    await ctx.db.patch(args.partyId, { reservationHandoffAt });

    if (!party.reservationHandoffAt) {
      await recordPartyAction(ctx, party, "reservation_handoff_started");
    }

    return reservationHandoffAt;
  },
});

export const confirmReservation = mutation({
  args: {
    partyId: v.id("watchParties"),
    confirmedBy: v.string(),
    reservationReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");

    const reservationConfirmedAt = party.reservationConfirmedAt ?? Date.now();
    await ctx.db.patch(args.partyId, {
      reservationConfirmedAt,
      reservationConfirmedBy: args.confirmedBy.trim(),
      reservationReference: args.reservationReference?.trim() || undefined,
    });

    if (!party.reservationConfirmedAt) {
      await recordPartyAction(ctx, party, "reservation_confirmed_by_host");
    }

    return reservationConfirmedAt;
  },
});

export const recordCalendarAdd = mutation({
  args: {
    partyId: v.id("watchParties"),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");

    const calendarAddedAt = party.calendarAddedAt ?? Date.now();
    await ctx.db.patch(args.partyId, { calendarAddedAt });

    if (!party.calendarAddedAt) {
      await recordPartyAction(ctx, party, "calendar_add_clicked");
    }

    return calendarAddedAt;
  },
});

export const seatBookingsForParty = query({
  args: {
    partyId: v.id("watchParties"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seatBookings")
      .withIndex("by_party_and_created_at", (q) =>
        q.eq("partyId", args.partyId),
      )
      .order("asc")
      .collect();
  },
});

export const requestSeatBooking = mutation({
  args: {
    partyId: v.id("watchParties"),
    clientId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    seats: v.number(),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");

    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const seats = Math.floor(args.seats);

    if (!name) throw new Error("Name is required");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email is required");
    if (seats < 1 || seats > 10) {
      throw new Error("Choose between 1 and 10 seats");
    }
    const liveScreening = await findScreeningForBooking(ctx, {
      screeningId: party.screeningId,
      eventKey: v2SeedEvent.eventKey,
      venueId: party.venueId,
      venueName: party.venueName,
      venueArea: party.venueArea,
    });
    const screeningId = liveScreening?._id ?? party.screeningId;
    const totalSeats = liveScreening?.totalSeats ?? party.screeningTotalSeats;
    const confirmedBookedSeats =
      liveScreening?.confirmedBookedSeats ?? party.screeningConfirmedBookedSeats;

    if (
      typeof totalSeats !== "number" ||
      typeof confirmedBookedSeats !== "number"
    ) {
      throw new Error("Seat inventory is not available for this screening");
    }

    const existingBookings = await ctx.db
      .query("seatBookings")
      .withIndex("by_party_and_created_at", (q) =>
        q.eq("partyId", args.partyId),
      )
      .collect();

    const existingForUser = existingBookings.find(
      (booking) =>
        booking.status !== "cancelled" &&
        ((args.clientId && booking.clientId === args.clientId) ||
          booking.email === email),
    );
    const activeRequestedSeats = existingBookings
      .filter(
        (booking) =>
          booking.status !== "cancelled" &&
          booking._id !== existingForUser?._id,
      )
      .reduce((sum, booking) => sum + booking.seats, 0);
    const seatsLeft = totalSeats - confirmedBookedSeats - activeRequestedSeats;

    if (seats > seatsLeft) {
      throw new Error("Not enough seats left");
    }

    const now = Date.now();

    if (existingForUser) {
      await ctx.db.patch(existingForUser._id, {
        name,
        email,
        seats,
        clientId: args.clientId,
        updatedAt: now,
      });
      return existingForUser._id;
    }

    const bookingId = await ctx.db.insert("seatBookings", {
      partyId: party._id,
      inviteCode: party.inviteCode,
      screeningId,
      clientId: args.clientId,
      name,
      email,
      seats,
      status: "pending",
      eventKey: v2SeedEvent.eventKey,
      raceName: party.raceName,
      venueId: party.venueId,
      venueName: party.venueName,
      venueArea: party.venueArea,
      createdAt: now,
      updatedAt: now,
    });

    await recordPartyAction(ctx, party, "seat_booking_requested");
    return bookingId;
  },
});

export const latestSeatBookings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("seatBookings")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);
  },
});

export const reviewSeatBooking = mutation({
  args: {
    bookingId: v.id("seatBookings"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Seat booking not found");

    const screening = await findScreeningForBooking(ctx, booking);
    if (!screening) {
      throw new Error("Seat inventory is not available for this screening");
    }

    const statusChanged = booking.status !== args.status;
    let nextConfirmedBookedSeats = screening.confirmedBookedSeats;

    if (statusChanged && args.status === "confirmed") {
      nextConfirmedBookedSeats += booking.seats;
    }

    if (statusChanged && booking.status === "confirmed") {
      nextConfirmedBookedSeats -= booking.seats;
    }

    if (nextConfirmedBookedSeats > screening.totalSeats) {
      throw new Error("Not enough seats left");
    }

    const now = Date.now();

    if (statusChanged) {
      await ctx.db.patch(screening._id, {
        confirmedBookedSeats: Math.max(0, nextConfirmedBookedSeats),
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.bookingId, {
      status: args.status,
      screeningId: screening._id,
      updatedAt: now,
    });

    return args.bookingId;
  },
});

export const watchPartiesByHostEmail = query({
  args: {
    hostEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.hostEmail.trim().toLowerCase();
    if (!email) return [];

    return await ctx.db
      .query("watchParties")
      .withIndex("by_hostEmail_and_createdAt", (q) => q.eq("hostEmail", email))
      .order("desc")
      .take(10);
  },
});

export const watchPartiesWithStatsByHostEmail = query({
  args: {
    hostEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.hostEmail.trim().toLowerCase();
    if (!email) return [];

    const parties = await ctx.db
      .query("watchParties")
      .withIndex("by_hostEmail_and_createdAt", (q) => q.eq("hostEmail", email))
      .order("desc")
      .take(20);

    return await Promise.all(
      parties.map(async (party) => {
        const rsvps = await ctx.db
          .query("rsvps")
          .withIndex("by_party_and_created_at", (q) =>
            q.eq("partyId", party._id),
          )
          .collect();

        return {
          party,
          counts: {
            in: rsvps.filter((rsvp) => rsvp.decision === "in").length,
            maybe: rsvps.filter((rsvp) => rsvp.decision === "maybe").length,
            out: rsvps.filter((rsvp) => rsvp.decision === "out").length,
          },
        };
      }),
    );
  },
});

export const watchPartyWithRsvps = query({
  args: {
    partyId: v.id("watchParties"),
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) return null;

    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_party_and_created_at", (q) =>
        q.eq("partyId", args.partyId),
      )
      .order("asc")
      .collect();

    return { party, rsvps };
  },
});

export const watchPartyWithRsvpsByInviteCode = query({
  args: {
    inviteCode: v.string(),
  },
  handler: async (ctx, args) => {
    const code = args.inviteCode.trim().toUpperCase();
    if (!code) return null;

    const party = await ctx.db
      .query("watchParties")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .first();
    if (!party) return null;

    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_party_and_created_at", (q) => q.eq("partyId", party._id))
      .order("asc")
      .collect();

    return { party, rsvps };
  },
});

export const submitWatchPartyRsvp = mutation({
  args: {
    partyId: v.id("watchParties"),
    name: v.string(),
    clientId: v.optional(v.string()),
    decision: v.union(v.literal("in"), v.literal("maybe"), v.literal("out")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_party_and_created_at", (q) =>
        q.eq("partyId", args.partyId),
      )
      .collect();
    const normalizedName = args.name.trim().toLowerCase();
    const duplicateByClient = args.clientId
      ? existing.find((rsvp) => rsvp.clientId === args.clientId)
      : null;
    const duplicateByName = existing.find(
      (rsvp) => rsvp.name.trim().toLowerCase() === normalizedName,
    );
    const duplicate = duplicateByClient ?? duplicateByName;

    if (duplicate) {
      if (duplicate.isHost) {
        return duplicate._id;
      }

      await ctx.db.patch(duplicate._id, {
        name: args.name.trim(),
        decision: args.decision,
        clientId: args.clientId,
      });
      return duplicate._id;
    }

    return await ctx.db.insert("rsvps", {
      partyId: args.partyId,
      name: args.name.trim(),
      decision: args.decision,
      isHost: false,
      clientId: args.clientId,
      createdAt: Date.now(),
    });
  },
});

export const createVenueCandidate = mutation({
  args: venueCandidateArgs,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    const duplicate = existing.find(
      (candidate) =>
        candidate.sourceUrl === args.sourceUrl &&
        candidate.venueName.toLowerCase() === args.venueName.toLowerCase(),
    );

    if (duplicate) return duplicate._id;

    return await ctx.db.insert("venueCandidates", {
      ...args,
      status: "needs_review",
      createdAt: Date.now(),
    });
  },
});

export const latestVenueCandidates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);
  },
});

export const approvedVenueCandidates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("venueCandidates")
      .withIndex("by_status_and_created_at", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(50);
  },
});

export const reviewVenueCandidate = mutation({
  args: {
    id: v.id("venueCandidates"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      rejectionReason:
        args.status === "rejected"
          ? (args.rejectionReason ?? "Not strong enough for V1")
          : undefined,
      reviewedAt: Date.now(),
    });
  },
});

export const markManualVenueCandidatesVerified = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    const manualRows = rows.filter(
      (row) => row.sourceQuery === "Manual venue entry",
    );

    for (const row of manualRows) {
      await ctx.db.patch(row._id, {
        signalType: "Verified",
        confidence: 95,
        rawSnippet:
          "Manually added by builder and treated as verified for V1 ranking.",
        status: "approved",
        reviewedAt: Date.now(),
      });
    }

    return manualRows.length;
  },
});

export const markCurrentVenueCandidatesConfirmed = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    const currentRows = rows.filter((row) => row.status === "approved");
    const updatedRows = [];

    for (const [index, row] of currentRows.entries()) {
      const verifiedAt = index % 2 === 0 ? "1 Sep evening" : "2 Sep evening";

      await ctx.db.patch(row._id, {
        signalType: "Verified",
        confidence: Math.max(row.confidence, 95),
        verifiedBy: "Gaurav",
        verifiedMethod: "phone call",
        verifiedAt,
        reviewedAt: row.reviewedAt ?? Date.now(),
      });

      updatedRows.push({
        venueName: row.venueName,
        area: row.area,
        verifiedBy: "Gaurav",
        verifiedMethod: "phone call",
        verifiedAt,
      });
    }

    return updatedRows;
  },
});
