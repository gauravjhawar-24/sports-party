import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { PartyPageClient } from "../../../PartyPageClient";

export const dynamic = "force-dynamic";
const siteUrl = "https://findmyscreen.vercel.app";

type JoinPageProps = {
  params: Promise<{
    inviteCode: string;
  }>;
};

export async function generateMetadata({ params }: JoinPageProps): Promise<Metadata> {
  const { inviteCode } = await params;
  const code = inviteCode.trim().toUpperCase();
  const partyData = await loadPartyDataByCode(code);
  const party = partyData?.party;

  if (!party) {
    return {
      title: "Watch party invite | FindMyScreen",
      description: "Open this FindMyScreen watch-party invite and RSVP."
    };
  }

  const title = `You're invited: ${party.raceName} at ${party.venueName}`;
  const description = `RSVP for ${party.raceName} on ${party.raceDate} at ${party.venueName}, ${party.venueArea}.`;
  const url = `${siteUrl}/f1/join/${code}`;
  const image = `${siteUrl}/f1/party/${party._id}/opengraph-image?v=3`;

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

export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteCode } = await params;
  return <PartyPageClient inviteCode={inviteCode.trim().toUpperCase()} />;
}

async function loadPartyDataByCode(inviteCode: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;

  try {
    const convex = new ConvexHttpClient(convexUrl);
    return await convex.query(api.actions.watchPartyWithRsvpsByInviteCode, {
      inviteCode
    });
  } catch {
    return null;
  }
}
