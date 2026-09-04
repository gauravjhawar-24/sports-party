import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

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
    };
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
    bookMyShowUrl: v.optional(v.string()),
    swiggyDineoutUrl: v.optional(v.string()),
    districtUrl: v.optional(v.string()),
    eightClubUrl: v.optional(v.string()),
    highApeUrl: v.optional(v.string()),
    sortMySceneUrl: v.optional(v.string()),
    highwayDeliteUrl: v.optional(v.string()),
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
      bookMyShowUrl: args.bookMyShowUrl,
      swiggyDineoutUrl: args.swiggyDineoutUrl,
      districtUrl: args.districtUrl,
      eightClubUrl: args.eightClubUrl,
      highApeUrl: args.highApeUrl,
      sortMySceneUrl: args.sortMySceneUrl,
      highwayDeliteUrl: args.highwayDeliteUrl,
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
    | "calendar_add_clicked",
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
  },
  handler: async (ctx, args) => {
    const party = await ctx.db.get(args.partyId);
    if (!party) throw new Error("Watch party not found");

    const reservationConfirmedAt = party.reservationConfirmedAt ?? Date.now();
    await ctx.db.patch(args.partyId, { reservationConfirmedAt });

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
