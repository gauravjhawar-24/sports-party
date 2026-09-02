export type EvidenceTag = "Verified" | "Posted about F1" | "Regular F1 venue" | "Needs call";

export type Venue = {
  id: string;
  name: string;
  area: string;
  zones: string[];
  evidenceTag: EvidenceTag;
  evidence: string;
  phone: string;
  mapUrl: string;
  vibe: string;
  price: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const nextRace = {
  name: "Italian Grand Prix",
  circuit: "Monza",
  raceDate: "Sunday, 6 Sep 2026",
  raceTime: "6:30 PM IST"
};

export const venues: Venue[] = [
  {
    id: "skydeck-sherlocks-mg-road",
    name: "SkyDeck By Sherlock's",
    area: "MG Road",
    zones: ["mg road", "church street", "brigade road", "central bangalore"],
    evidenceTag: "Posted about F1",
    evidence: "District lists an Italian GP 2026 live screening at SkyDeck By Sherlock's.",
    phone: "Needs call",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=SkyDeck+By+Sherlocks+MG+Road+Bangalore",
    vibe: "Central, big-screen race night, easy for mixed groups.",
    price: "Entry listing seen around Rs 199",
    sourceLabel: "District listing",
    sourceUrl: "https://www.district.in/"
  },
  {
    id: "underdoggs-hebbal",
    name: "Underdoggs Hebbal",
    area: "Hebbal",
    zones: ["hebbal", "sahakara nagar", "north bangalore"],
    evidenceTag: "Posted about F1",
    evidence: "District lists an Italian GP 2026 screening at Underdoggs Hebbal.",
    phone: "Needs call",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Underdoggs+Hebbal+Bangalore",
    vibe: "Sports-bar energy, better when the group wants a crowd.",
    price: "Entry listing seen around Rs 200",
    sourceLabel: "District listing",
    sourceUrl: "https://www.district.in/activities/screening-in-bengaluru/"
  },
  {
    id: "underdoggs-whitefield",
    name: "Underdoggs Sports Bar & Grill",
    area: "Whitefield",
    zones: ["whitefield", "marathahalli", "brookefield"],
    evidenceTag: "Regular F1 venue",
    evidence: "Underdoggs says Formula 1 and other sports are broadcast on its screens.",
    phone: "Needs call",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Underdoggs+Sports+Bar+Whitefield",
    vibe: "Sports-first pub with multiple screens and strong match-day energy.",
    price: "Mid to high",
    sourceLabel: "Venue website",
    sourceUrl: "https://underdoggs.com/"
  },
  {
    id: "amoeba-sports-bar",
    name: "Amoeba Sports Bar",
    area: "Church Street",
    zones: ["church street", "mg road", "brigade road", "central bangalore"],
    evidenceTag: "Regular F1 venue",
    evidence: "Watch Party Radar lists Amoeba Sports Bar as showing Formula 1 frequently.",
    phone: "Needs call",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Amoeba+Sports+Bar+Church+Street+Bangalore",
    vibe: "Compact central sports bar, good for a small F1 group.",
    price: "Mid",
    sourceLabel: "Watch Party Radar",
    sourceUrl: "https://watchpartyradar.com/bangalore/"
  },
  {
    id: "big-pitcher-sarjapur",
    name: "Big Pitcher",
    area: "Sarjapur Road",
    zones: ["sarjapur", "sarjapur road", "bellandur", "hsr", "hsr layout"],
    evidenceTag: "Regular F1 venue",
    evidence: "Big Pitcher's own race-day page describes Formula 1 screening experiences.",
    phone: "Needs call",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Big+Pitcher+Sarjapur+Bangalore",
    vibe: "Large brewpub energy, strong choice for Bellandur and Sarjapur groups.",
    price: "Mid to high",
    sourceLabel: "Venue page",
    sourceUrl: "https://www.bigpitcher.co.in/sarjapur-best-pub-in-bangalore/ourBlogs/ultimate_race-day_experience.html"
  },
  {
    id: "buffalo-wild-wings-indiranagar",
    name: "Buffalo Wild Wings",
    area: "Indiranagar",
    zones: ["indiranagar", "domlur", "old airport road"],
    evidenceTag: "Regular F1 venue",
    evidence: "Older Bangalore F1 guides and fan posts mention Buffalo Wild Wings for Formula 1 screenings.",
    phone: "6360198721",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Buffalo+Wild+Wings+Indiranagar+Bangalore",
    vibe: "Sports-bar crowd, wings, beer and multiple screens.",
    price: "Mid to high",
    sourceLabel: "Public F1 guide",
    sourceUrl: "https://www.whatshot.in/bangalore/f1-fans-walk-into-these-pubs--bars-to-watch-the-main-sunday-race-live-on-the-big-screen-c-35096"
  },
  {
    id: "church-street-social",
    name: "Church Street Social",
    area: "Church Street",
    zones: ["church street", "mg road", "brigade road", "central bangalore"],
    evidenceTag: "Needs call",
    evidence: "Older fan threads mention Social for F1, but V1 needs a fresh check before trusting it.",
    phone: "9152071971",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Church+Street+Social+Bangalore",
    vibe: "Loud central plan with food, drinks and a younger crowd.",
    price: "Mid to high",
    sourceLabel: "Needs fresh check",
    sourceUrl: "https://www.reddit.com/r/bangalore/comments/pm1hyh/f1_screening/"
  },
  {
    id: "doff-indiranagar",
    name: "Doff Pub & Lounge",
    area: "Indiranagar",
    zones: ["indiranagar", "domlur", "old airport road"],
    evidenceTag: "Verified",
    evidence: "Personally confirmed for the Italian GP main race.",
    phone: "9036737098",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Doff+Pub+Lounge+Indiranagar+Bangalore",
    vibe: "Lower-key Indiranagar option when the group wants a calmer race night.",
    price: "Mid",
    sourceLabel: "Needs fresh check",
    sourceUrl: "https://www.whatshot.in/bangalore/f1-fans-walk-into-these-pubs--bars-to-watch-the-main-sunday-race-live-on-the-big-screen-c-35096"
  }
];

const evidenceRank: Record<EvidenceTag, number> = {
  Verified: 0,
  "Posted about F1": 1,
  "Regular F1 venue": 2,
  "Needs call": 3
};

const zoneNearness: Record<string, string[]> = {
  bellandur: [
    "bellandur",
    "sarjapur",
    "sarjapur road",
    "hsr",
    "hsr layout",
    "koramangala",
    "indiranagar",
    "marathahalli",
    "whitefield",
    "mg road",
    "church street",
    "jp nagar"
  ],
  "hsr layout": ["hsr", "hsr layout", "bellandur", "sarjapur", "sarjapur road", "koramangala", "indiranagar", "mg road"],
  hsr: ["hsr", "hsr layout", "bellandur", "sarjapur", "sarjapur road", "koramangala", "indiranagar", "mg road"],
  "sarjapur road": ["sarjapur", "sarjapur road", "bellandur", "hsr", "hsr layout", "koramangala", "whitefield"],
  sarjapur: ["sarjapur", "sarjapur road", "bellandur", "hsr", "hsr layout", "koramangala", "whitefield"],
  koramangala: ["koramangala", "hsr", "hsr layout", "indiranagar", "mg road", "bellandur"],
  indiranagar: ["indiranagar", "domlur", "old airport road", "mg road", "church street", "koramangala", "bellandur"],
  "mg road": ["mg road", "church street", "brigade road", "central bangalore", "indiranagar", "koramangala"],
  whitefield: ["whitefield", "brookefield", "marathahalli", "bellandur", "sarjapur"],
  "jp nagar": ["jp nagar", "j p nagar", "jayanagar", "bannerghatta road", "koramangala"]
};

const areaAliases: Record<string, string[]> = {
  bellandur: ["bellandur", "belandur", "bellanduru", "bellandur gate", "ecospace"],
  "hsr layout": ["hsr layout", "hsr", "h s r", "hsr sector", "sector 1 hsr", "sector 2 hsr"],
  "sarjapur road": ["sarjapur road", "sarjapur", "sarjapura", "sarjapura road"],
  koramangala: ["koramangala", "kormangala", "koramangla", "koramangalaa", "koramangala 5th block", "koramangala 6th block"],
  indiranagar: ["indiranagar", "indira nagar", "indra nagar", "indranagar", "indiranagara", "indranagara", "indira", "100 feet road", "domlur", "old airport road"],
  "mg road": ["mg road", "m g road", "mahatma gandhi road", "brigade road", "church street", "central bangalore"],
  whitefield: ["whitefield", "white field", "brookefield", "brooke field", "marathahalli"],
  "jp nagar": ["jp nagar", "j p nagar", "jpnagar", "jayanagar", "bannerghatta road"]
};

export function rankVenues(areaInput: string) {
  return rankVenueList(areaInput, venues);
}

export function rankVenueList(areaInput: string, venueList: Venue[]) {
  const normalizedArea = normalizeArea(areaInput);
  const nearbyZones = normalizedArea ? zoneNearness[normalizedArea] ?? [normalizedArea] : [];

  const ranked = [...venueList].sort((left, right) => {
    const evidenceDiff = evidenceRank[left.evidenceTag] - evidenceRank[right.evidenceTag];
    if (evidenceDiff !== 0) return evidenceDiff;

    return nearnessScore(right, nearbyZones) - nearnessScore(left, nearbyZones);
  });

  return {
    normalizedArea,
    isSupportedArea: Boolean(normalizedArea),
    results: ranked.slice(0, 3),
    popularAreas: ["Bellandur", "HSR Layout", "Sarjapur Road", "Koramangala", "Indiranagar", "MG Road", "Whitefield", "JP Nagar"]
  };
}

export function buildInviteText(venue: Venue) {
  return [
    `${nextRace.name} watch plan`,
    `${nextRace.raceDate}, ${nextRace.raceTime}`,
    `${venue.name}, ${venue.area}`,
    `Status: ${venue.evidenceTag}`,
    `Vibe: ${venue.vibe}`,
    `Map: ${venue.mapUrl}`,
    "Who's in?"
  ].join("\n");
}

function normalizeArea(input: string) {
  const text = input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const directMatch = Object.keys(areaAliases).find((area) => areaAliases[area].some((alias) => text.includes(alias)));
  if (directMatch) return directMatch;

  if (text.includes("bangalore") || text.includes("bengaluru")) {
    return "mg road";
  }

  return "";
}

function nearnessScore(venue: Venue, nearbyZones: string[]) {
  if (!nearbyZones.length) return 0;
  const index = nearbyZones.findIndex((zone) => venue.zones.includes(zone));
  return index === -1 ? 0 : 100 - index;
}
