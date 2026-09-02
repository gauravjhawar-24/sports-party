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
    venuePhone: v.optional(v.string()),
    raceName: v.string(),
    raceDate: v.string(),
    raceTime: v.string(),
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
});
