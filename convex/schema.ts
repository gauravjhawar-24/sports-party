import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  searches: defineTable({
    areaInput: v.string(),
    normalizedArea: v.string(),
    bestVenueId: v.string(),
    resultVenueIds: v.array(v.string()),
    createdAt: v.number()
  }).index("by_created_at", ["createdAt"]),

  actions: defineTable({
    email: v.string(),
    actionType: v.union(v.literal("share_invite"), v.literal("call_pub")),
    areaInput: v.string(),
    normalizedArea: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    raceName: v.string(),
    createdAt: v.number()
  }).index("by_created_at", ["createdAt"]),

  venueCandidates: defineTable({
    sourceQuery: v.string(),
    sourceTitle: v.string(),
    sourceUrl: v.string(),
    rawSnippet: v.string(),
    venueName: v.string(),
    area: v.string(),
    raceName: v.string(),
    signalType: v.union(v.literal("Verified"), v.literal("Posted about F1"), v.literal("Regular F1 venue"), v.literal("Needs call")),
    confidence: v.number(),
    status: v.union(v.literal("needs_review"), v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number())
  })
    .index("by_status_and_created_at", ["status", "createdAt"])
    .index("by_created_at", ["createdAt"])
});
