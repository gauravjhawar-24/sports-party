import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { PartyPageClient } from "../../../PartyPageClient";

export const dynamic = "force-dynamic";
const siteUrl = "https://findmyscreen.vercel.app";

type PartyPageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const { partyId } = await params;
  const partyData = await loadPartyData(partyId);
  const party = partyData?.party;

  if (!party) {
    return {
      title: "Watch party invite | FindMyScreen",
      description: "Open this FindMyScreen watch-party invite and RSVP."
    };
  }

  const title = `You're invited: ${party.raceName} at ${party.venueName}`;
  const description = `RSVP for ${party.raceName} on ${party.raceDate} at ${party.venueName}, ${party.venueArea}.`;
  const url = `${siteUrl}/f1/party/${partyId}`;
  const image = `${url}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "FindMyScreen",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${party.raceName} watch-party invite at ${party.venueName}`
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { partyId } = await params;
  return <PartyPageClient partyId={partyId} />;
}

async function loadPartyData(partyId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  try {
    const convex = new ConvexHttpClient(convexUrl);
    return await convex.query(api.actions.watchPartyWithRsvps, {
      partyId: partyId as Id<"watchParties">
    });
  } catch {
    return null;
  }
}
