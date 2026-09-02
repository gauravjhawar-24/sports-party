import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { venues } from "../../../../lib/venues";
import { approvedSignalToVenue } from "../../../../lib/venueSignals";
import { InvitePageClient } from "../../../InvitePageClient";

export const dynamic = "force-dynamic";

type InvitePageProps = {
  params: Promise<{
    venueId: string;
  }>;
  searchParams: Promise<{
    area?: string;
  }>;
};

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const [{ venueId }, query] = await Promise.all([params, searchParams]);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const approvedSignals = await convex.query(api.actions.approvedVenueCandidates, {});
  const venueList = [...approvedSignals.map(approvedSignalToVenue), ...venues];
  const venue = venueList.find((item) => item.id === decodeURIComponent(venueId));

  if (!venue) notFound();

  return <InvitePageClient venue={venue} area={query.area ?? venue.area} />;
}
