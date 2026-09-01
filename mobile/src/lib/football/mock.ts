/**
 * Bundled fixture data mirroring Matchday.dc.html.
 *
 * Clubs, scorelines, venues, pick distributions and match events are copied
 * from the design so MOCK_MODE renders exactly what the design specifies.
 * Kickoff times are derived from "now" so countdowns tick realistically.
 */
import type {
  FootballTeam,
  LiveEvent,
  LiveMatch,
  PickFixture,
} from "@/src/lib/football/types";

type ClubCode =
  | "AU" | "CB" | "IB" | "NR" | "KP"
  | "VA" | "MT" | "PW" | "OQ" | "SC";

const CLUBS: Record<ClubCode, { id: number; name: string; color: string }> = {
  AU: { id: 1, name: "Atlas United", color: "#1E3A8A" },
  CB: { id: 2, name: "Coral Bay FC", color: "#BE123C" },
  IB: { id: 3, name: "Ironbridge", color: "#374151" },
  NR: { id: 4, name: "Nortside Rovers", color: "#0E7490" },
  KP: { id: 5, name: "Kestrel Park", color: "#B45309" },
  VA: { id: 6, name: "Vale Athletic", color: "#4C1D95" },
  MT: { id: 7, name: "Marrow Town", color: "#166534" },
  PW: { id: 8, name: "Pelham Wanderers", color: "#9D174D" },
  OQ: { id: 9, name: "Old Quarry", color: "#78350F" },
  SC: { id: 10, name: "Saltmere City", color: "#1D4ED8" },
};

function team(code: ClubCode): FootballTeam {
  const club = CLUBS[code];
  return {
    id: club.id,
    name: club.name,
    mono: code,
    logo: null,
    color: club.color,
  };
}

function kickoffLabel(date: Date) {
  const day = date.toLocaleDateString("en-GB", { weekday: "short" });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} ${dayNum} ${month} · ${time}`;
}

/**
 * lock: seconds until kickoff. Negative means the fixture already kicked off,
 * matching the design's `lock: -1` locked-card case.
 */
const FIXTURE_SEED: Array<{
  id: string;
  home: ClubCode;
  away: ClubCode;
  lock: number;
  venue: string;
  flag: boolean;
  def: [number, number];
  dist: [number, number, number];
}> = [
  { id: "mock-f1", home: "AU", away: "CB", lock: 8040, venue: "Atlas Ground", flag: true, def: [2, 1], dist: [62, 21, 17] },
  { id: "mock-f2", home: "IB", away: "NR", lock: 4080, venue: "The Foundry", flag: false, def: [1, 1], dist: [38, 32, 30] },
  { id: "mock-f3", home: "KP", away: "VA", lock: 660, venue: "Kestrel Park", flag: false, def: [3, 1], dist: [47, 25, 28] },
  { id: "mock-f4", home: "MT", away: "PW", lock: -1, venue: "Marrow Lane", flag: false, def: [1, 1], dist: [41, 29, 30] },
  { id: "mock-f5", home: "OQ", away: "SC", lock: 30600, venue: "Quarry Field", flag: false, def: [0, 2], dist: [24, 26, 50] },
];

export function mockFixtures(now = Date.now()): PickFixture[] {
  return FIXTURE_SEED.map((seed) => {
    const kickoff = new Date(now + seed.lock * 1000);
    const locked = seed.lock < 0;
    return {
      id: seed.id,
      home: team(seed.home),
      away: team(seed.away),
      kickoffIso: kickoff.toISOString(),
      kickoffLabel: kickoffLabel(kickoff),
      venue: seed.venue,
      lockSeconds: seed.lock,
      locked,
      flag: seed.flag,
      def: seed.def,
      dist: seed.dist,
      round: "Gameweek 7",
      status: locked ? "in" : "pre",
    };
  });
}

function events(list: Array<[string, LiveEvent["kind"], ClubCode]>): LiveEvent[] {
  return list.map(([min, kind, code]) => ({
    min,
    kind,
    teamId: CLUBS[code].id,
    teamName: CLUBS[code].name,
  }));
}

function liveMatch(
  id: string,
  home: ClubCode,
  away: ClubCode,
  homeGoals: number,
  awayGoals: number,
  minute: number,
  venue: string,
  list: Array<[string, LiveEvent["kind"], ClubCode]>,
): LiveMatch {
  return {
    id,
    home: team(home),
    away: team(away),
    score: `${homeGoals} – ${awayGoals}`,
    homeGoals,
    awayGoals,
    minute,
    status: "In Progress",
    statusShort: `${minute}'`,
    venue,
    events: events(list),
    isLive: true,
    isFinished: false,
  };
}

function finishedMatch(
  id: string,
  home: ClubCode,
  away: ClubCode,
  homeGoals: number,
  awayGoals: number,
  venue: string,
): LiveMatch {
  return {
    id,
    home: team(home),
    away: team(away),
    score: `${homeGoals} – ${awayGoals}`,
    homeGoals,
    awayGoals,
    minute: 90,
    status: "Full Time",
    statusShort: "FT",
    venue,
    events: [],
    isLive: false,
    isFinished: true,
  };
}

export function mockLiveCentre() {
  const live: LiveMatch[] = [
    liveMatch("mock-l1", "CB", "AU", 2, 1, 63, "Coral Bay Arena", [
      ["18'", "Goal", "CB"],
      ["41'", "Yellow card", "AU"],
      ["57'", "Goal", "AU"],
      ["61'", "Goal", "CB"],
    ]),
    liveMatch("mock-l2", "IB", "NR", 0, 0, 27, "The Foundry", [
      ["9'", "Yellow card", "IB"],
      ["22'", "Yellow card", "NR"],
    ]),
  ];

  // Ids line up with mockFixtures so picks grade against these results.
  const finished: LiveMatch[] = [
    finishedMatch("mock-f4", "MT", "PW", 1, 1, "Marrow Lane"),
    finishedMatch("mock-f3", "KP", "VA", 2, 1, "Kestrel Park"),
  ];

  const upcoming: LiveMatch[] = [];

  return { live, finished, upcoming, updatedAt: new Date().toISOString() };
}

export function mockSeasonResults() {
  return {
    results: [
      { id: "mock-f4", homeGoals: 1, awayGoals: 1, gameweek: 7 },
      { id: "mock-f3", homeGoals: 2, awayGoals: 1, gameweek: 7 },
    ],
    gw: 7,
  };
}
