import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { ScreeningsAdminClient } from "./ScreeningsAdminClient";

export const dynamic = "force-dynamic";

export default async function ScreeningsAdminPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in .env.local");
  }

  const convex = new ConvexHttpClient(convexUrl);
  const initialScreenings = await convex.query(
    api.actions.latestScreenings,
    {},
  );

  return <ScreeningsAdminClient initialScreenings={initialScreenings} />;
}
