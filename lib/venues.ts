export type EvidenceTag =
  "Verified" | "Posted about F1" | "Regular F1 venue" | "Needs call";

export type Venue = {
  id: string;
  name: string;
  area: string;
  zones: string[];
  evidenceTag: EvidenceTag;
  evidence: string;
  phone: string;
  mapUrl: string;
  bookMyShowUrl?: string;
  vibe: string;
  price: string;
  sourceLabel: string;
  sourceUrl: string;
  verifiedBy?: string;
  verifiedMethod?: string;
  verifiedAt?: string;
};

export const nextRace = {
  name: "Italian Grand Prix",
  circuit: "Monza",
  raceDate: "Sunday, 6 Sep 2026",
  raceTime: "6:30 PM IST",
};

const confirmedSep1Evening = {
  verifiedBy: "Gaurav",
  verifiedMethod: "phone call",
  verifiedAt: "1 Sep evening",
};

const confirmedSep2Evening = {
  verifiedBy: "Gaurav",
  verifiedMethod: "phone call",
  verifiedAt: "2 Sep evening",
};

export const venues: Venue[] = [
  {
    id: "skydeck-sherlocks-mg-road",
    name: "SkyDeck By Sherlock's",
    area: "MG Road",
    zones: ["mg road", "church street", "brigade road", "central bangalore"],
    evidenceTag: "Verified",
    evidence:
      "District lists an Italian GP 2026 live screening at SkyDeck By Sherlock's.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=SkyDeck+By+Sherlocks+MG+Road+Bangalore",
    bookMyShowUrl:
      "https://in.bookmyshow.com/explore/c/venues/skydeck-by-sherlocks-bengaluru/sdsb",
    vibe: "Central, big-screen race night, easy for mixed groups.",
    price: "Entry listing seen around Rs 199",
    sourceLabel: "District listing",
    sourceUrl: "https://www.district.in/",
    ...confirmedSep1Evening,
  },
  {
    id: "underdoggs-hebbal",
    name: "Underdoggs Hebbal",
    area: "Hebbal",
    zones: ["hebbal", "sahakara nagar", "north bangalore"],
    evidenceTag: "Verified",
    evidence:
      "District lists an Italian GP 2026 screening at Underdoggs Hebbal.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Underdoggs+Hebbal+Bangalore",
    bookMyShowUrl:
      "https://in.bookmyshow.com/explore/c/venues/underdoggs-hebbal-bengaluru/udhb",
    vibe: "Sports-bar energy, better when the group wants a crowd.",
    price: "Entry listing seen around Rs 200",
    sourceLabel: "District listing",
    sourceUrl: "https://www.district.in/activities/screening-in-bengaluru/",
    ...confirmedSep1Evening,
  },
  {
    id: "underdoggs-whitefield",
    name: "Underdoggs Sports Bar & Grill",
    area: "Whitefield",
    zones: ["whitefield", "marathahalli", "brookefield"],
    evidenceTag: "Verified",
    evidence:
      "Underdoggs says Formula 1 and other sports are broadcast on its screens.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Underdoggs+Sports+Bar+Whitefield",
    vibe: "Sports-first pub with multiple screens and strong match-day energy.",
    price: "Mid to high",
    sourceLabel: "Venue website",
    sourceUrl: "https://underdoggs.com/",
    ...confirmedSep1Evening,
  },
  {
    id: "amoeba-sports-bar",
    name: "Amoeba Sports Bar",
    area: "Church Street",
    zones: ["church street", "mg road", "brigade road", "central bangalore"],
    evidenceTag: "Verified",
    evidence:
      "Watch Party Radar lists Amoeba Sports Bar as showing Formula 1 frequently.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Amoeba+Sports+Bar+Church+Street+Bangalore",
    bookMyShowUrl:
      "https://in.bookmyshow.com/explore/c/venues/amoeba-church-street-bangalore/abbr",
    vibe: "Compact central sports bar, good for a small F1 group.",
    price: "Mid",
    sourceLabel: "Watch Party Radar",
    sourceUrl: "https://watchpartyradar.com/bangalore/",
    ...confirmedSep1Evening,
  },
  {
    id: "rcb-bar-cafe-brigade-road",
    name: "RCB Bar & Cafe",
    area: "Brigade Road",
    zones: ["brigade road", "mg road", "church street", "central bangalore"],
    evidenceTag: "Verified",
    evidence: "Phone call confirmation for the Italian GP main race.",
    phone: "9980999944",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=RCB+Bar+Cafe+Garuda+Mall+Magrath+Road+Bangalore",
    vibe: "Sports-first, big-brand bar setup near Brigade Road for groups that want a match-night atmosphere.",
    price: "High",
    sourceLabel: "Official venue page",
    sourceUrl: "https://royalchallengers.com/rcb-bar-cafe",
    ...confirmedSep1Evening,
  },
  {
    id: "pecos-brigade-road",
    name: "Pecos",
    area: "Brigade Road",
    zones: ["brigade road", "mg road", "church street", "central bangalore"],
    evidenceTag: "Verified",
    evidence: "Manually confirmed by builder for the Italian GP main race.",
    phone: "8041640022",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Pecos+Brigade+Road+Bangalore",
    vibe: "Old-school Bangalore pub feel, confirmed for a central race-night plan.",
    price: "Mid to high",
    sourceLabel: "Venue website",
    sourceUrl: "https://pecospub.com/",
    ...confirmedSep2Evening,
  },
  {
    id: "pecos-stones-indiranagar",
    name: "Pecos Stones",
    area: "Indiranagar",
    zones: ["indiranagar", "domlur", "old airport road"],
    evidenceTag: "Verified",
    evidence: "Manually confirmed by builder for the Italian GP main race.",
    phone: "8971664068",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Pecos+Stones+Indiranagar+Bangalore",
    vibe: "Old-school rock pub on 100 Feet Road, confirmed for an Indiranagar race-night plan.",
    price: "Mid to high",
    sourceLabel: "Zomato listing",
    sourceUrl:
      "https://www.zomato.com/bangalore/pecos-stones-indiranagar-bangalore",
    ...confirmedSep2Evening,
  },
  {
    id: "big-pitcher-sarjapur",
    name: "Big Pitcher",
    area: "Sarjapur Road",
    zones: ["sarjapur", "sarjapur road", "bellandur", "hsr", "hsr layout"],
    evidenceTag: "Verified",
    evidence:
      "Big Pitcher's own race-day page describes Formula 1 screening experiences.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Big+Pitcher+Sarjapur+Bangalore",
    bookMyShowUrl:
      "https://in.bookmyshow.com/explore/c/venues/big-pitcher-sarjapur/bpsr",
    vibe: "Large brewpub energy, strong choice for Bellandur and Sarjapur groups.",
    price: "Mid to high",
    sourceLabel: "Venue page",
    sourceUrl:
      "https://www.bigpitcher.co.in/sarjapur-best-pub-in-bangalore/ourBlogs/ultimate_race-day_experience.html",
    ...confirmedSep2Evening,
  },
  {
    id: "buffalo-wild-wings-indiranagar",
    name: "Buffalo Wild Wings",
    area: "Indiranagar",
    zones: ["indiranagar", "domlur", "old airport road"],
    evidenceTag: "Regular F1 venue",
    evidence:
      "Older Bangalore F1 guides and fan posts mention Buffalo Wild Wings for Formula 1 screenings.",
    phone: "6360198721",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Buffalo+Wild+Wings+Indiranagar+Bangalore",
    vibe: "Sports-bar crowd, wings, beer and multiple screens.",
    price: "Mid to high",
    sourceLabel: "Public F1 guide",
    sourceUrl:
      "https://www.whatshot.in/bangalore/f1-fans-walk-into-these-pubs--bars-to-watch-the-main-sunday-race-live-on-the-big-screen-c-35096",
  },
  {
    id: "church-street-social",
    name: "Church Street Social",
    area: "Church Street",
    zones: ["church street", "mg road", "brigade road", "central bangalore"],
    evidenceTag: "Verified",
    evidence: "Phone call confirmation for the Italian GP main race.",
    phone: "9152071971",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Church+Street+Social+Bangalore",
    bookMyShowUrl:
      "https://in.bookmyshow.com/explore/c/venues/church-street-social-bengaluru/cstu",
    vibe: "Loud central plan with food, drinks and a younger crowd.",
    price: "Mid to high",
    sourceLabel: "Needs fresh check",
    sourceUrl:
      "https://www.reddit.com/r/bangalore/comments/pm1hyh/f1_screening/",
    ...confirmedSep2Evening,
  },
  {
    id: "doff-indiranagar",
    name: "Doff Pub & Lounge",
    area: "Indiranagar",
    zones: ["indiranagar", "domlur", "old airport road"],
    evidenceTag: "Verified",
    evidence: "Personally confirmed for the Italian GP main race.",
    phone: "9036737098",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Doff+Pub+Lounge+Indiranagar+Bangalore",
    vibe: "Lower-key Indiranagar option when the group wants a calmer race night.",
    price: "Mid",
    sourceLabel: "Needs fresh check",
    sourceUrl:
      "https://www.whatshot.in/bangalore/f1-fans-walk-into-these-pubs--bars-to-watch-the-main-sunday-race-live-on-the-big-screen-c-35096",
    ...confirmedSep2Evening,
  },
];

export function bookMyShowUrlForVenue(name: string, area: string) {
  const key = `${normalizeVenueKey(name)}|${normalizeVenueKey(area)}`;
  const broadKey = normalizeVenueKey(name);
  const links: Record<string, string> = {
    "skydeck by sherlocks|mg road":
      "https://in.bookmyshow.com/explore/c/venues/skydeck-by-sherlocks-bengaluru/sdsb",
    "underdoggs hebbal|hebbal":
      "https://in.bookmyshow.com/explore/c/venues/underdoggs-hebbal-bengaluru/udhb",
    "amoeba sports bar|church street":
      "https://in.bookmyshow.com/explore/c/venues/amoeba-church-street-bangalore/abbr",
    "amoeba|church street":
      "https://in.bookmyshow.com/explore/c/venues/amoeba-church-street-bangalore/abbr",
    "big pitcher|sarjapur road":
      "https://in.bookmyshow.com/explore/c/venues/big-pitcher-sarjapur/bpsr",
    "church street social|church street":
      "https://in.bookmyshow.com/explore/c/venues/church-street-social-bengaluru/cstu",
    "jp nagar social|jp nagar":
      "https://in.bookmyshow.com/explore/c/venues/jp-nagara-social-bengaluru/ihjj",
    "jp nagara social|jp nagar":
      "https://in.bookmyshow.com/explore/c/venues/jp-nagara-social-bengaluru/ihjj",
    "bira 91 taproom|koramangala":
      "https://in.bookmyshow.com/explore/c/venues/bira-91-taproom-koramangala-bengaluru/btrr",
    "italian bira taproom koramangala|koramangala":
      "https://in.bookmyshow.com/explore/c/venues/bira-91-taproom-koramangala-bengaluru/btrr",
    "watsons|indiranagar":
      "https://in.bookmyshow.com/explore/c/venues/watsons-indiranagar-bengaluru/gaia",
    "italy 26 live watsons|indiranagar":
      "https://in.bookmyshow.com/explore/c/venues/watsons-indiranagar-bengaluru/gaia",
  };

  return links[key] ?? links[broadKey];
}

function normalizeVenueKey(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const evidenceRank: Record<EvidenceTag, number> = {
  Verified: 0,
  "Posted about F1": 1,
  "Regular F1 venue": 2,
  "Needs call": 3,
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
    "jp nagar",
  ],
  "hsr layout": [
    "hsr",
    "hsr layout",
    "bellandur",
    "sarjapur",
    "sarjapur road",
    "koramangala",
    "indiranagar",
    "mg road",
  ],
  hsr: [
    "hsr",
    "hsr layout",
    "bellandur",
    "sarjapur",
    "sarjapur road",
    "koramangala",
    "indiranagar",
    "mg road",
  ],
  "sarjapur road": [
    "sarjapur",
    "sarjapur road",
    "bellandur",
    "hsr",
    "hsr layout",
    "koramangala",
    "whitefield",
  ],
  sarjapur: [
    "sarjapur",
    "sarjapur road",
    "bellandur",
    "hsr",
    "hsr layout",
    "koramangala",
    "whitefield",
  ],
  koramangala: [
    "koramangala",
    "hsr",
    "hsr layout",
    "indiranagar",
    "mg road",
    "bellandur",
  ],
  indiranagar: [
    "indiranagar",
    "domlur",
    "old airport road",
    "mg road",
    "church street",
    "koramangala",
    "bellandur",
  ],
  "mg road": [
    "mg road",
    "church street",
    "brigade road",
    "central bangalore",
    "indiranagar",
    "koramangala",
  ],
  whitefield: [
    "whitefield",
    "brookefield",
    "marathahalli",
    "bellandur",
    "sarjapur",
  ],
  "jp nagar": [
    "jp nagar",
    "j p nagar",
    "jayanagar",
    "bannerghatta road",
    "koramangala",
  ],
};

const areaAliases: Record<string, string[]> = {
  bellandur: [
    "bellandur",
    "belandur",
    "bellanduru",
    "bellandur gate",
    "ecospace",
  ],
  "hsr layout": [
    "hsr layout",
    "hsr",
    "h s r",
    "hsr sector",
    "sector 1 hsr",
    "sector 2 hsr",
  ],
  "sarjapur road": ["sarjapur road", "sarjapur", "sarjapura", "sarjapura road"],
  koramangala: [
    "koramangala",
    "kormangala",
    "koramangla",
    "koramangalaa",
    "koramangala 5th block",
    "koramangala 6th block",
  ],
  indiranagar: [
    "indiranagar",
    "indira nagar",
    "indra nagar",
    "indranagar",
    "indiranagara",
    "indranagara",
    "indira",
    "100 feet road",
    "domlur",
    "old airport road",
  ],
  "mg road": [
    "mg road",
    "m g road",
    "mahatma gandhi road",
    "brigade road",
    "church street",
    "central bangalore",
  ],
  whitefield: [
    "whitefield",
    "white field",
    "brookefield",
    "brooke field",
    "marathahalli",
  ],
  "jp nagar": [
    "jp nagar",
    "j p nagar",
    "jpnagar",
    "jayanagar",
    "bannerghatta road",
  ],
};

export function rankVenues(areaInput: string) {
  return rankVenueList(areaInput, venues);
}

export function rankVenueList(areaInput: string, venueList: Venue[]) {
  const normalizedArea = normalizeArea(areaInput);
  const isSupportedArea = Boolean(normalizedArea);
  const nearbyZones = isSupportedArea
    ? (zoneNearness[normalizedArea] ?? [normalizedArea])
    : [];

  const ranked = [...venueList].sort((left, right) => {
    const evidenceDiff =
      evidenceRank[left.evidenceTag] - evidenceRank[right.evidenceTag];
    if (evidenceDiff !== 0) return evidenceDiff;

    return nearnessScore(right, nearbyZones) - nearnessScore(left, nearbyZones);
  });

  return {
    normalizedArea,
    isSupportedArea,
    results: isSupportedArea ? ranked.slice(0, 6) : [],
    popularAreas: [
      "Bellandur",
      "HSR Layout",
      "Sarjapur Road",
      "Koramangala",
      "Indiranagar",
      "MG Road",
      "Whitefield",
      "JP Nagar",
    ],
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
    "Who's in?",
  ].join("\n");
}

export function hasVenueVerificationProof(venue: Venue) {
  return Boolean(venue.verifiedBy && venue.verifiedMethod && venue.verifiedAt);
}

export function venueConfirmationLine(venue: Venue) {
  if (!hasVenueVerificationProof(venue)) return "Not yet confirmed";

  return `Confirmed by ${venue.verifiedBy}, ${venue.verifiedMethod}, ${venue.verifiedAt}`;
}

function normalizeArea(input: string) {
  const text = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const directMatch = Object.keys(areaAliases).find((area) =>
    areaAliases[area].some((alias) => text.includes(alias)),
  );
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
