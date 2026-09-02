import { PartyPageClient } from "../../../PartyPageClient";

export const dynamic = "force-dynamic";

type PartyPageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export default async function PartyPage({ params }: PartyPageProps) {
  const { partyId } = await params;
  return <PartyPageClient partyId={partyId} />;
}
