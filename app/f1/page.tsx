import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { HomeClient } from "../HomeClient";
import { nextRace } from "../../lib/venues";

export const dynamic = "force-dynamic";

type F1PageProps = {
  searchParams: Promise<{
    area?: string;
    invite?: string;
  }>;
};

export default async function F1Page({ searchParams }: F1PageProps) {
  const params = await searchParams;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const [initialApprovedSignals, initialScreenings] = await Promise.all([
    convex.query(api.actions.approvedVenueCandidates, {}),
    convex.query(api.actions.screeningsForEvent, {
      eventKey: nextRace.eventKey,
    }),
  ]);

  return (
    <HomeClient
      initialArea={params.area ?? ""}
      initialApprovedSignals={initialApprovedSignals}
      initialScreenings={initialScreenings}
      initialInvite={params.invite === "1"}
      basePath="/f1"
    />
  );
}
