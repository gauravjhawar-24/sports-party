import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { VenueAdminClient } from "./VenueAdminClient";

export default async function VenueAdminPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const initialCandidates = await convex.query(api.actions.latestVenueCandidates, {});

  return <VenueAdminClient initialCandidates={initialCandidates} />;
}
