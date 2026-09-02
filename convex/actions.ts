import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const venueCandidateArgs = {
  sourceQuery: v.string(),
  sourceTitle: v.string(),
  sourceUrl: v.string(),
  rawSnippet: v.string(),
  venueName: v.string(),
  area: v.string(),
  raceName: v.string(),
  signalType: v.union(v.literal("Verified"), v.literal("Posted about F1"), v.literal("Regular F1 venue"), v.literal("Needs call")),
  confidence: v.number()
};

export const recordSearch = mutation({
  args: {
    areaInput: v.string(),
    normalizedArea: v.string(),
    bestVenueId: v.string(),
    resultVenueIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searches", {
      ...args,
      createdAt: Date.now()
    });
  }
});

export const recordAction = mutation({
  args: {
    email: v.string(),
    actionType: v.union(v.literal("share_invite"), v.literal("call_pub")),
    areaInput: v.string(),
    normalizedArea: v.string(),
    venueId: v.string(),
    venueName: v.string(),
    raceName: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("actions", {
      ...args,
      createdAt: Date.now()
    });
  }
});

export const latestActions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("actions")
      .withIndex("by_created_at")
      .order("desc")
      .take(25);
  }
});

export const latestSearches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("searches")
      .withIndex("by_created_at")
      .order("desc")
      .take(25);
  }
});

export const proofStats = query({
  args: {},
  handler: async (ctx) => {
    const searches = await ctx.db.query("searches").collect();
    const actions = await ctx.db.query("actions").collect();
    const shareInvites = actions.filter((action) => action.actionType === "share_invite").length;
    const callPubs = actions.filter((action) => action.actionType === "call_pub").length;

    return {
      searches: searches.length,
      meaningfulActions: actions.length,
      shareInvites,
      callPubs
    };
  }
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
        candidate.venueName.toLowerCase() === args.venueName.toLowerCase()
    );

    if (duplicate) return duplicate._id;

    return await ctx.db.insert("venueCandidates", {
      ...args,
      status: "needs_review",
      createdAt: Date.now()
    });
  }
});

export const latestVenueCandidates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);
  }
});

export const approvedVenueCandidates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("venueCandidates")
      .withIndex("by_status_and_created_at", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(50);
  }
});

export const reviewVenueCandidate = mutation({
  args: {
    id: v.id("venueCandidates"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      rejectionReason: args.status === "rejected" ? args.rejectionReason ?? "Not strong enough for V1" : undefined,
      reviewedAt: Date.now()
    });
  }
});

export const markManualVenueCandidatesVerified = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("venueCandidates")
      .withIndex("by_created_at")
      .order("desc")
      .take(100);

    const manualRows = rows.filter((row) => row.sourceQuery === "Manual venue entry");

    for (const row of manualRows) {
      await ctx.db.patch(row._id, {
        signalType: "Verified",
        confidence: 95,
        rawSnippet: "Manually added by builder and treated as verified for V1 ranking.",
        status: "approved",
        reviewedAt: Date.now()
      });
    }

    return manualRows.length;
  }
});
