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
  swiggyDineoutUrl?: string;
  districtUrl?: string;
  eightClubUrl?: string;
  highApeUrl?: string;
  sortMySceneUrl?: string;
  highwayDeliteUrl?: string;
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
      "https://in.bookmyshow.com/events/f1-live-italian-grand-prix-screening/ET00514137",
    eightClubUrl:
      "https://invite.8club.co/hotspots/f1-italian-gp-screening-racing-e-sim-experience-17262",
    highApeUrl:
      "https://highape.com/bangalore/events/f1-live-italian-grand-prix-screening-9snyjzls3d",
    districtUrl:
      "https://www.district.in/events/f1-live-italian-grand-prix-screening-sep6-2026-buy-tickets?srsltid=AfmBOooRz2zp8ydwu7mzUweR4tCLyVMmNhhCFXzqhdt50Ov7UDnyxkf0",
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/church-street/amoeba-sports-bar-1379343/dineout",
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/ashok-nagar/rcb-bar-cafe-358622/dineout",
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/brigade-road/pecos-classic-31012/dineout",
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
    id: "studz-sports-bar-bellandur",
    name: "Studz Sports Bar",
    area: "Bellandur",
    zones: ["bellandur", "sarjapur", "sarjapur road", "hsr", "hsr layout"],
    evidenceTag: "Verified",
    evidence:
      "District lists an Italian Grand Prix Formula 1 live screening at Studz Bellandur.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Studz+Sports+Bar+Bellandur+Bangalore",
    districtUrl:
      "https://www.district.in/events/italian-grand-prix-formula-1-live-at-the-studs-bellandur-sep6-2026-buy-tickets",
    sortMySceneUrl:
      "https://sortmyscene.com/event/italian-grand-prix-formula-1-live-at-the-studs-bellandur-sep-06-2026",
    vibe: "Bellandur sports-bar plan with a listed Italian GP screening.",
    price: "Ticketed listing seen online",
    sourceLabel: "District and SortMyScene listings",
    sourceUrl:
      "https://www.district.in/events/italian-grand-prix-formula-1-live-at-the-studs-bellandur-sep6-2026-buy-tickets",
    ...confirmedSep2Evening,
  },
  {
    id: "topspin-club-ahmedabad",
    name: "TopSpin Club",
    area: "Ahmedabad",
    zones: ["ahmedabad", "sindhu bhavan road"],
    evidenceTag: "Verified",
    evidence:
      "Highway Delite lists an Italian Grand Prix 2026 live screening at TopSpin Club.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=TopSpin+Club+Ahmedabad",
    highwayDeliteUrl:
      "https://experiences.highwaydelite.com/s5/topspin-club/events-and-workshops/f1-italian-grand-prix-2026-live-screening-at-topspin-club",
    vibe: "Ticketed live-screening club setup for an F1 race-night plan.",
    price: "Ticketed listing seen online",
    sourceLabel: "Highway Delite listing",
    sourceUrl:
      "https://experiences.highwaydelite.com/s5/topspin-club/events-and-workshops/f1-italian-grand-prix-2026-live-screening-at-topspin-club",
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/sarjapur-road/big-pitcher-262080/dineout",
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
    swiggyDineoutUrl: "https://www.swiggy.com/restaurants/270831/dineout",
  },
  {
    id: "the-beer-cafe-koramangala",
    name: "The Beer Cafe",
    area: "Koramangala",
    zones: ["koramangala", "hsr", "hsr layout", "bellandur", "indiranagar"],
    evidenceTag: "Verified",
    evidence:
      "F1 Commune lists an Italian Grand Prix live screening at The Beer Cafe.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=The+Beer+Cafe+Koramangala+Bangalore",
    sortMySceneUrl: "https://f1commune.com/",
    vibe: "Koramangala beer-cafe plan with a dedicated F1 screening link.",
    price: "Check event page",
    sourceLabel: "F1 Commune listing",
    sourceUrl: "https://f1commune.com/",
    ...confirmedSep2Evening,
  },
  {
    id: "the-burrow-racecourse-road",
    name: "The Burrow",
    area: "Racecourse Road",
    zones: ["racecourse road", "mg road", "central bangalore", "church street"],
    evidenceTag: "Verified",
    evidence:
      "F1 Commune lists Italian Grand Prix screening tickets for The Burrow.",
    phone: "Needs call",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=The+Burrow+Racecourse+Road+Bangalore",
    sortMySceneUrl: "https://f1commune.com/",
    vibe: "Central race-night option with a dedicated F1 Commune ticket flow.",
    price: "Check event page",
    sourceLabel: "F1 Commune listing",
    sourceUrl: "https://f1commune.com/",
    ...confirmedSep2Evening,
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/ashok-nagar/churchstreet-social-834224/dineout",
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
    swiggyDineoutUrl:
      "https://www.swiggy.com/restaurants/bangalore/indiranagar/doff-pub-471044/dineout",
    ...confirmedSep2Evening,
  },
];

export function bookMyShowUrlForVenue(name: string, area: string) {
  const key = `${normalizeVenueKey(name)}|${normalizeVenueKey(area)}`;
  const broadKey = normalizeVenueKey(name);
  const links: Record<string, string> = {
    "skydeck by sherlocks|mg road":
      "https://in.bookmyshow.com/events/f1-live-italian-grand-prix-screening/ET00514137",
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

export function swiggyDineoutUrlForVenue(name: string, area: string) {
  const key = `${normalizeVenueKey(name)}|${normalizeVenueKey(area)}`;
  const broadKey = normalizeVenueKey(name);
  const links: Record<string, string> = {
    "skydeck by sherlocks|mg road":
      "https://www.swiggy.com/restaurants/bangalore/mg-road/skydeck-by-sherlocks-87627/dineout",
    "underdoggs sports bar and grill|whitefield":
      "https://www.swiggy.com/restaurants/bangalore/whitefield/underdoggs-whitefield-1276653/dineout",
    "underdoggs|whitefield":
      "https://www.swiggy.com/restaurants/bangalore/whitefield/underdoggs-whitefield-1276653/dineout",
    "amoeba sports bar|church street":
      "https://www.swiggy.com/restaurants/bangalore/church-street/amoeba-sports-bar-1379343/dineout",
    "amoeba|church street":
      "https://www.swiggy.com/restaurants/bangalore/church-street/amoeba-sports-bar-1379343/dineout",
    "rcb bar and cafe|brigade road":
      "https://www.swiggy.com/restaurants/bangalore/ashok-nagar/rcb-bar-cafe-358622/dineout",
    "pecos|brigade road":
      "https://www.swiggy.com/restaurants/bangalore/brigade-road/pecos-classic-31012/dineout",
    "big pitcher|sarjapur road":
      "https://www.swiggy.com/restaurants/bangalore/sarjapur-road/big-pitcher-262080/dineout",
    "buffalo wild wings|indiranagar":
      "https://www.swiggy.com/restaurants/270831/dineout",
    "church street social|church street":
      "https://www.swiggy.com/restaurants/bangalore/ashok-nagar/churchstreet-social-834224/dineout",
    "doff pub and lounge|indiranagar":
      "https://www.swiggy.com/restaurants/bangalore/indiranagar/doff-pub-471044/dineout",
    "doff pub|indiranagar":
      "https://www.swiggy.com/restaurants/bangalore/indiranagar/doff-pub-471044/dineout",
    "red rhino|whitefield":
      "https://www.swiggy.com/restaurants/bangalore/whitefield/red-rhino-98774/dineout",
    "jp nagar social|jp nagar":
      "https://www.swiggy.com/restaurants/bangalore/jp-nagar/jp-nagara-social-866336/dineout",
    "jp nagara social|jp nagar":
      "https://www.swiggy.com/restaurants/bangalore/jp-nagar/jp-nagara-social-866336/dineout",
    "bira 91 taproom|koramangala":
      "https://www.swiggy.com/restaurants/bangalore/koramangala/bira-91-taproom-906028/dineout",
    "italian bira taproom koramangala|koramangala":
      "https://www.swiggy.com/restaurants/bangalore/koramangala/bira-91-taproom-906028/dineout",
    "watsons pub|indiranagar":
      "https://www.swiggy.com/restaurants/1359451/dineout",
    "watsons|indiranagar": "https://www.swiggy.com/restaurants/1359451/dineout",
    "italy 26 live watsons|indiranagar":
      "https://www.swiggy.com/restaurants/1359451/dineout",
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
    "racecourse road",
    "central bangalore",
    "indiranagar",
    "koramangala",
  ],
  "racecourse road": [
    "racecourse road",
    "mg road",
    "church street",
    "brigade road",
    "central bangalore",
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
  ahmedabad: ["ahmedabad", "sindhu bhavan road"],
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
  "racecourse road": ["racecourse road", "race course road"],
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
  ahmedabad: ["ahmedabad", "amdavad", "sindhu bhavan", "sindhu bhavan road"],
};

const strictAreaResults = new Set(["ahmedabad"]);

export function rankVenues(areaInput: string) {
  return rankVenueList(areaInput, venues);
}

export function rankVenueList(areaInput: string, venueList: Venue[]) {
  const normalizedArea = normalizeArea(areaInput);
  const isSupportedArea = Boolean(normalizedArea);
  const nearbyZones = isSupportedArea
    ? (zoneNearness[normalizedArea] ?? [normalizedArea])
    : [];

  const ranked = dedupeVenueList(venueList).sort((left, right) => {
    const evidenceDiff =
      evidenceRank[left.evidenceTag] - evidenceRank[right.evidenceTag];
    if (evidenceDiff !== 0) return evidenceDiff;

    return nearnessScore(right, nearbyZones) - nearnessScore(left, nearbyZones);
  });

  const results =
    isSupportedArea && strictAreaResults.has(normalizedArea)
      ? ranked.filter((venue) => nearnessScore(venue, nearbyZones) > 0)
      : ranked;

  return {
    normalizedArea,
    isSupportedArea,
    results: isSupportedArea ? results.slice(0, 6) : [],
    popularAreas: [
      "Bellandur",
      "HSR Layout",
      "Sarjapur Road",
      "Koramangala",
      "Indiranagar",
      "MG Road",
      "Whitefield",
      "JP Nagar",
      "Ahmedabad",
    ],
  };
}

function dedupeVenueList(venueList: Venue[]) {
  const seen = new Set<string>();
  const deduped: Venue[] = [];

  for (const venue of venueList) {
    const key = `${canonicalVenueName(venue.name)}|${normalizeVenueKey(venue.area)}`;
    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(venue);
  }

  return deduped;
}

function canonicalVenueName(name: string) {
  const normalized = normalizeVenueKey(name);
  const aliases: Record<string, string> = {
    amoeba: "amoeba sports bar",
    "amoeba sports bar": "amoeba sports bar",
  };

  return aliases[normalized] ?? normalized;
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
