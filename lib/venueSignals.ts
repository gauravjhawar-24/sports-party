import {
  bookMyShowUrlForVenue,
  nextRace,
  swiggyDineoutUrlForVenue,
  venues,
  type EvidenceTag,
  type Venue,
} from "./venues";

export type SignalStatus = "needs_review" | "approved" | "rejected";
export type SignalType = EvidenceTag;

export type VenueSignalDraft = {
  sourceQuery: string;
  sourceTitle: string;
  sourceUrl: string;
  rawSnippet: string;
  venueName: string;
  area: string;
  raceName: string;
  signalType: SignalType;
  confidence: number;
  verifiedBy?: string;
  verifiedMethod?: string;
  verifiedAt?: string;
};

export type ApprovedVenueSignal = VenueSignalDraft & {
  _id: string;
  status: SignalStatus;
};

const areaNames = [
  "Bellandur",
  "HSR",
  "Sarjapur Road",
  "Koramangala",
  "Indiranagar",
  "MG Road",
  "Church Street",
  "Hebbal",
  "Whitefield",
  "Marathahalli",
];

const weakVenueWords = new Set([
  "f1",
  "formula 1",
  "screening",
  "bengaluru",
  "bangalore",
  "events",
  "tickets",
  "bookmyshow",
  "district",
]);

export function buildVenueSearchQuery(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return `${nextRace.name} screening Bangalore pubs`;
  if (/bangalore|bengaluru/i.test(trimmed)) return trimmed;
  return `${trimmed} Bangalore F1 screening pubs`;
}

export function draftsFromTavilyResults(
  sourceQuery: string,
  results: TavilyResult[],
) {
  const seen = new Set<string>();

  return results.flatMap((result) => {
    const text = `${result.title} ${result.content}`.toLowerCase();
    const isBangalore =
      /bangalore|bengaluru|indiranagar|koramangala|bellandur|hsr|mg road|church street|hebbal|whitefield|sarjapur/i.test(
        text,
      );
    const isF1 =
      /f1|formula 1|grand prix|italian gp|race screening|screening/i.test(text);

    if (!isBangalore || !isF1 || !result.url) return [];

    const venueName = guessVenueName(result.title);
    if (!venueName || weakVenueWords.has(venueName.toLowerCase())) return [];

    const key = `${venueName.toLowerCase()}-${result.url}`;
    if (seen.has(key)) return [];
    seen.add(key);

    const signalType = inferSignalType(text);
    const area = inferArea(`${result.title} ${result.content}`);
    const confidence = inferConfidence(text, signalType, Boolean(area));

    return [
      {
        sourceQuery,
        sourceTitle: result.title,
        sourceUrl: result.url,
        rawSnippet: result.content,
        venueName,
        area: area || "Needs area check",
        raceName: nextRace.name,
        signalType,
        confidence,
      },
    ];
  });
}

export function approvedSignalToVenue(signal: ApprovedVenueSignal): Venue {
  const area = signal.area === "Needs area check" ? "Bangalore" : signal.area;
  const venueName = cleanVenueDisplayName(signal);
  const query = encodeURIComponent(`${venueName} ${area} Bangalore`);
  const hasProof = Boolean(
    signal.verifiedBy && signal.verifiedMethod && signal.verifiedAt,
  );
  const isManualVerified = signal.sourceQuery === "Manual venue entry";
  const staticVenue = venues.find(
    (venue) =>
      normalizeVenueName(venue.name) === normalizeVenueName(venueName) &&
      normalizeVenueName(venue.area) === normalizeVenueName(area),
  );

  return {
    id: `approved-${signal._id}`,
    name: venueName,
    area,
    zones: zoneAliases(area),
    evidenceTag: signal.signalType,
    evidence: readableEvidence(signal),
    phone: "Needs call",
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    bookMyShowUrl: signal.sourceUrl.includes("bookmyshow.com")
      ? signal.sourceUrl
      : (staticVenue?.bookMyShowUrl ?? bookMyShowUrlForVenue(venueName, area)),
    swiggyDineoutUrl: signal.sourceUrl.includes("swiggy.com")
      ? signal.sourceUrl
      : staticVenue
        ? staticVenue.swiggyDineoutUrl
        : swiggyDineoutUrlForVenue(venueName, area),
    districtUrl: staticVenue?.districtUrl,
    eightClubUrl: staticVenue?.eightClubUrl,
    highApeUrl: staticVenue?.highApeUrl,
    sortMySceneUrl: staticVenue?.sortMySceneUrl,
    highwayDeliteUrl: staticVenue?.highwayDeliteUrl,
    vibe: hasProof
      ? `Confirmed ${area} option for this race night.`
      : isManualVerified
        ? `Manual ${area} option added by the FindMyScreen team for this race night.`
        : "Fresh online signal. Call once before you send the plan.",
    price: hasProof || isManualVerified ? "Check with venue" : "Needs check",
    sourceLabel: sourceLabel(signal.sourceUrl),
    sourceUrl: signal.sourceUrl,
    verifiedBy: signal.verifiedBy,
    verifiedMethod: signal.verifiedMethod,
    verifiedAt: signal.verifiedAt,
  };
}

function normalizeVenueName(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanVenueDisplayName(signal: ApprovedVenueSignal) {
  const title = signal.sourceTitle.toLowerCase();
  const snippet = signal.rawSnippet.toLowerCase();
  const source = signal.sourceUrl.toLowerCase();

  if (title.includes("bira") || snippet.includes("bira 91 tap room"))
    return "Bira 91 Taproom";
  if (title.includes("skydeck") || snippet.includes("skydeck by sherlock"))
    return "SkyDeck By Sherlock's";
  if (
    title.includes("watsons") ||
    snippet.includes("watsons.pub") ||
    source.includes("instagram.com")
  )
    return "Watson's Pub";

  return signal.venueName;
}

function guessVenueName(title: string) {
  const cleaned = title
    .replace(
      /\b(F1|Formula 1|Italian GP|Grand Prix|screening|watch party|tickets?|events?)\b/gi,
      "",
    )
    .replace(/[|:–—-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const firstChunk = cleaned
    .split(/ in Bengaluru| in Bangalore| Bengaluru| Bangalore/i)[0]
    ?.trim();
  if (!firstChunk) return "";
  return firstChunk.length > 44 ? firstChunk.slice(0, 44).trim() : firstChunk;
}

function inferArea(text: string) {
  const match = areaNames.find((area) =>
    new RegExp(area.replace(" ", "\\s+"), "i").test(text),
  );
  return match ?? "";
}

function inferSignalType(text: string): SignalType {
  if (
    /italian gp|grand prix|race screening|screening|watch party|live screening/i.test(
      text,
    )
  ) {
    return "Posted about F1";
  }
  if (/formula 1|f1/i.test(text)) return "Regular F1 venue";
  return "Needs call";
}

function inferConfidence(
  text: string,
  signalType: SignalType,
  hasArea: boolean,
) {
  let score =
    signalType === "Posted about F1"
      ? 70
      : signalType === "Regular F1 venue"
        ? 54
        : 38;
  if (/italian gp|monza/i.test(text)) score += 12;
  if (/ticket|book|entry|cover/i.test(text)) score += 8;
  if (hasArea) score += 8;
  return Math.min(score, 95);
}

function readableEvidence(signal: VenueSignalDraft) {
  if (signal.signalType === "Posted about F1") {
    return `${sourceLabel(signal.sourceUrl)} has a fresh F1 screening signal for ${signal.raceName}.`;
  }
  if (signal.signalType === "Verified") {
    if (signal.verifiedBy && signal.verifiedMethod && signal.verifiedAt) {
      return signal.sourceQuery === "Manual venue entry"
        ? "This venue was manually confirmed for this race-night plan."
        : "This venue has direct confirmation for this race plan.";
    }

    return "This venue needs proof details before it can be treated as confirmed.";
  }
  if (signal.signalType === "Regular F1 venue") {
    return `${sourceLabel(signal.sourceUrl)} mentions F1 or regular sports screening.`;
  }
  return `${sourceLabel(signal.sourceUrl)} has a weak signal. Call once before planning.`;
}

function sourceLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Public source";
  }
}

function zoneAliases(area: string) {
  const lower = area.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  return Array.from(new Set([lower, ...words]));
}

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
};
