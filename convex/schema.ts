import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  searches: defineTable({
    areaInput: v.string(),
    normalizedArea: v.string(),
    bestVenueId: v.string(),
    resultVenueIds: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  actions: defineTable({
    email: v.string(),
    actionType: v.union(
      v.literal("share_invite"),
      v.literal("call_pub"),
      v.literal("create_watch_party"),
      v.literal("lock_plan"),
      v.literal("reservation_handoff_started"),
      v.literal("reservation_confirmed_by_host"),
      v.literal("calendar_add_clicked"),
      v.literal("seat_booking_requested"),
    ),
    areaInput: v.string(),
    normalizedArea: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    raceName: v.string(),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),

  bookingInterests: defineTable({
    partyId: v.id("watchParties"),
    inviteCode: v.optional(v.string()),
    clientId: v.optional(v.string()),
    interested: v.boolean(),
    venueId: v.string(),
    venueName: v.string(),
    venueArea: v.string(),
    raceName: v.string(),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_party_and_created_at", ["partyId", "createdAt"]),

  venueCandidates: defineTable({
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
    status: v.union(
      v.literal("needs_review"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status_and_created_at", ["status", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  events: defineTable({
    eventKey: v.string(),
    sport: v.string(),
    name: v.string(),
    startsAt: v.string(),
    displayDate: v.string(),
    displayTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_eventKey", ["eventKey"])
    .index("by_startsAt", ["startsAt"]),

  screenings: defineTable({
    eventKey: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    venueArea: v.string(),
    totalSeats: v.number(),
    confirmedBookedSeats: v.number(),
    priceLabel: v.string(),
    bookingRules: v.string(),
    bookingClosesAt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_eventKey", ["eventKey"])
    .index("by_eventKey_and_venueId", ["eventKey", "venueId"]),

  watchParties: defineTable({
    hostName: v.string(),
    hostEmail: v.string(),
    inviteCode: v.optional(v.string()),
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
    raceName: v.string(),
    raceDate: v.string(),
    raceTime: v.string(),
    lockedAt: v.optional(v.number()),
    reservationHandoffAt: v.optional(v.number()),
    reservationConfirmedAt: v.optional(v.number()),
    reservationConfirmedBy: v.optional(v.string()),
    reservationReference: v.optional(v.string()),
    calendarAddedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_hostEmail_and_createdAt", ["hostEmail", "createdAt"])
    .index("by_inviteCode", ["inviteCode"]),

  rsvps: defineTable({
    partyId: v.id("watchParties"),
    name: v.string(),
    decision: v.union(v.literal("in"), v.literal("maybe"), v.literal("out")),
    isHost: v.boolean(),
    clientId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_party_and_created_at", ["partyId", "createdAt"])
    .index("by_created_at", ["createdAt"]),

  seatBookings: defineTable({
    partyId: v.id("watchParties"),
    inviteCode: v.optional(v.string()),
    screeningId: v.optional(v.id("screenings")),
    clientId: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    seats: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
    eventKey: v.string(),
    raceName: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    venueArea: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_party_and_created_at", ["partyId", "createdAt"])
    .index("by_party_and_email", ["partyId", "email"])
    .index("by_created_at", ["createdAt"]),
});
