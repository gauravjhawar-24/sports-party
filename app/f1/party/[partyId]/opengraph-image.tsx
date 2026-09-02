import { ImageResponse } from "next/og";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const runtime = "edge";
export const alt = "FindMyScreen watch-party invite";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

type OpenGraphImageProps = {
  params: Promise<{
    partyId: string;
  }>;
};

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { partyId } = await params;
  const partyData = await loadPartyData(partyId);
  const party = partyData?.party;

  const raceName = party?.raceName ?? "F1 race night";
  const venueName = party?.venueName ?? "Watch party";
  const venueArea = party?.venueArea ?? "Bangalore";
  const raceDate = party?.raceDate ?? "RSVP now";
  const raceTime = party?.raceTime ?? "";
  const evidenceTag = party?.venueEvidenceTag ?? "Invite";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#06070b",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "42px"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundColor: "#06070b",
            backgroundImage:
              "radial-gradient(circle at 18% 22%, rgba(225,6,0,0.36), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.08), transparent 36%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-90px",
            bottom: "95px",
            width: "1450px",
            height: "96px",
            display: "flex",
            backgroundColor: "rgba(225,6,0,0.92)",
            transform: "rotate(-10deg)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-70px",
            bottom: "58px",
            width: "1450px",
            height: "28px",
            display: "flex",
            backgroundColor: "rgba(255,255,255,0.7)",
            transform: "rotate(-10deg)"
          }}
        />
        <div
          style={{
            width: "1116px",
            height: "546px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "34px",
            backgroundColor: "rgba(8,9,14,0.86)",
            padding: "48px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  borderRadius: "12px",
                  backgroundColor: "#e10600",
                  padding: "12px 18px",
                  fontSize: "22px",
                  fontWeight: 900,
                  textTransform: "uppercase"
                }}
              >
                FindMyScreen Race Night
              </div>
              <div style={{ display: "flex", color: "#ffbf00", fontSize: "28px", fontWeight: 900 }}>
                You have been invited
              </div>
            </div>
            <div style={{ display: "flex", color: "white", fontSize: "92px", fontWeight: 900, lineHeight: 0.9 }}>
              F1
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", color: "rgba(255,255,255,0.64)", fontSize: "25px", fontWeight: 800 }}>
                {raceDate}{raceTime ? ` · ${raceTime}` : ""}
              </div>
              <div style={{ display: "flex", fontSize: "68px", fontWeight: 900, lineHeight: 0.92 }}>
                {raceName}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "30px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", color: "#ffbf00", fontSize: "23px", fontWeight: 900 }}>
                  Watching at
                </div>
                <div style={{ display: "flex", fontSize: "58px", fontWeight: 900, lineHeight: 0.94 }}>
                  {venueName}
                </div>
                <div style={{ display: "flex", color: "rgba(255,255,255,0.7)", fontSize: "30px", fontWeight: 800 }}>
                  {venueArea}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: "16px",
                  backgroundColor: "#00b277",
                  padding: "16px 22px",
                  fontSize: "25px",
                  fontWeight: 900,
                  textTransform: "uppercase"
                }}
              >
                {evidenceTag}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", fontSize: "38px", fontWeight: 900 }}>
              RSVP on this link
            </div>
            <div style={{ display: "flex", color: "rgba(255,255,255,0.66)", fontSize: "26px", fontWeight: 800 }}>
              One plan. No group debate.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
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
