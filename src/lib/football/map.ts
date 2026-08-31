import type {
  FootballTeam,
  LiveEvent,
  LiveMatch,
  PickFixture,
  Wc26Competition,
  Wc26Competitor,
  Wc26Detail,
  Wc26Event,
  Wc26PlaysResponse,
} from "@/lib/football/types";
import type { PillKind } from "@/lib/types";
import { assertNever } from "@/lib/types";

const TEAM_COLORS = [
  "#1E3A8A",
  "#BE123C",
  "#374151",
  "#0E7490",
  "#B45309",
  "#4C1D95",
  "#166534",
  "#9D174D",
  "#78350F",
  "#1D4ED8",
  "#0F766E",
  "#7C2D12",
];

function hashColor(id: number) {
  return TEAM_COLORS[Math.abs(id) % TEAM_COLORS.length]!;
}

function initialsFromName(name: string) {
  const cleaned = name.replace(/[^A-Za-z0-9 ]/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "FC";
  if (parts.length === 1) return parts[0]!.slice(0, 3).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function parseTeamId(id: string) {
  const parsed = Number.parseInt(id, 10);
  return Number.isFinite(parsed) ? parsed : Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
}

function normalizeColor(color?: string, id?: number) {
  if (color && color.trim()) {
    const trimmed = color.trim();
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  }
  return hashColor(id ?? 0);
}

export function mapTeamFromCompetitor(competitor: Wc26Competitor): FootballTeam {
  const id = parseTeamId(competitor.team.id);
  const name = competitor.team.displayName || competitor.team.name;
  return {
    id,
    name,
    mono: competitor.team.abbreviation || initialsFromName(name),
    logo: competitor.team.logo ?? null,
    color: normalizeColor(competitor.team.color, id),
  };
}

function getCompetition(event: Wc26Event): Wc26Competition | null {
  return event.competitions[0] ?? null;
}

function getSides(competition: Wc26Competition) {
  const home = competition.competitors.find((c) => c.homeAway === "home");
  const away = competition.competitors.find((c) => c.homeAway === "away");
  return { home, away };
}

function formatKickoffLabel(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function communityDist(homeId: number, awayId: number): [number, number, number] {
  const seed = Math.abs(homeId * 31 + awayId * 17);
  const home = 30 + (seed % 35);
  const draw = 18 + ((seed >> 3) % 22);
  const away = Math.max(8, 100 - home - draw);
  const total = home + draw + away;
  return [
    Math.round((home / total) * 100),
    Math.round((draw / total) * 100),
    Math.max(0, 100 - Math.round((home / total) * 100) - Math.round((draw / total) * 100)),
  ];
}

function statusShort(competition: Wc26Competition) {
  const { type } = competition.status;
  if (type.state === "pre") return "NS";
  return type.shortDetail || type.detail || type.description || type.name;
}

function parseScore(value: string | undefined) {
  if (value == null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function teamNameLookup(competition: Wc26Competition) {
  const lookup = new Map<string, string>();
  for (const competitor of competition.competitors) {
    lookup.set(
      competitor.team.id,
      competitor.team.displayName || competitor.team.name,
    );
  }
  return lookup;
}

export function mapDetailEvent(
  detail: Wc26Detail,
  lookup: Map<string, string>,
): LiveEvent | null {
  const text = detail.type.text.toLowerCase();
  let kind: LiveEvent["kind"] | null = null;

  if (detail.scoringPlay || text.includes("goal")) kind = "Goal";
  else if (detail.redCard || text.includes("red")) kind = "Red card";
  else if (detail.yellowCard || text.includes("yellow")) kind = "Yellow card";
  else if (text.includes("var")) kind = "Var";

  if (!kind) return null;

  const min = detail.clock.displayValue || `${Math.floor(detail.clock.value / 60)}'`;
  const teamId = parseTeamId(detail.team.id);

  return {
    min,
    kind,
    teamId,
    teamName: lookup.get(detail.team.id) ?? "Unknown",
  };
}

export function mapPlayItem(
  item: Wc26PlaysResponse["items"][number],
): LiveEvent | null {
  const text = item.type.text.toLowerCase();
  let kind: LiveEvent["kind"] | null = null;

  if (item.scoringPlay || (text.includes("goal") && !text.includes("goal kick"))) {
    kind = "Goal";
  } else if (item.redCard || text.includes("red card")) kind = "Red card";
  else if (item.yellowCard || text.includes("yellow card")) kind = "Yellow card";
  else if (text.includes("var")) kind = "Var";

  if (!kind) return null;

  return {
    min: item.clock.displayValue || "—",
    kind,
    teamId: 0,
    teamName: item.team.name || "Unknown",
  };
}

export function mapPickFixture(
  event: Wc26Event,
  gameweek: number,
  now = Date.now(),
): PickFixture | null {
  const competition = getCompetition(event);
  if (!competition) return null;

  const { home, away } = getSides(competition);
  if (!home || !away) return null;

  const kickoffIso = competition.startDate || event.date;
  const kickoffMs = new Date(kickoffIso).getTime();
  const lockSeconds = Math.floor((kickoffMs - now) / 1000);
  const short = statusShort(competition);
  const locked = lockSeconds < 0 || competition.status.type.state !== "pre";

  return {
    id: event.id,
    home: mapTeamFromCompetitor(home),
    away: mapTeamFromCompetitor(away),
    kickoffIso,
    kickoffLabel: formatKickoffLabel(kickoffIso),
    venue:
      competition.venue.fullName ||
      competition.venue.address?.city ||
      "TBC",
    lockSeconds,
    locked,
    flag: false,
    def: [1, 1],
    dist: communityDist(parseTeamId(home.team.id), parseTeamId(away.team.id)),
    round: `Regular Season - ${gameweek}`,
    status: short,
  };
}

export function mapLiveMatch(event: Wc26Event): LiveMatch | null {
  const competition = getCompetition(event);
  if (!competition) return null;

  const { home, away } = getSides(competition);
  if (!home || !away) return null;

  const homeGoals = parseScore(home.score);
  const awayGoals = parseScore(away.score);
  const score =
    homeGoals == null || awayGoals == null
      ? "–"
      : `${homeGoals} – ${awayGoals}`;

  const lookup = teamNameLookup(competition);
  const events = (competition.details ?? [])
    .map((detail) => mapDetailEvent(detail, lookup))
    .filter((item): item is LiveEvent => item !== null);

  const { type, displayClock, clock } = competition.status;
  const minute =
    type.state === "in"
      ? Math.max(0, Math.floor(clock / 60))
      : type.state === "post"
        ? 90
        : 0;

  return {
    id: event.id,
    home: mapTeamFromCompetitor(home),
    away: mapTeamFromCompetitor(away),
    score,
    homeGoals,
    awayGoals,
    minute,
    status: type.description || type.name,
    statusShort: statusShort(competition),
    venue:
      competition.venue.fullName ||
      competition.venue.address?.city ||
      "TBC",
    events,
    isLive: type.state === "in",
    isFinished: type.state === "post" && type.completed,
  };
}

export function scorePick(
  pick: [number, number] | undefined,
  homeGoals: number | null,
  awayGoals: number | null,
): { kind: "exact" | "close" | "result" | "miss"; pillText: string; note: string; you: string } {
  if (!pick) {
    return { kind: "miss", pillText: "No pick", note: "you skipped this one", you: "—" };
  }

  const you = `${pick[0]}–${pick[1]}`;
  if (homeGoals == null || awayGoals == null) {
    return { kind: "miss", pillText: "Pending", note: "awaiting full time", you };
  }

  if (pick[0] === homeGoals && pick[1] === awayGoals) {
    return { kind: "exact", pillText: "Exact · 3.0", note: "exact as it stands", you };
  }

  const pickDiff = pick[0] - pick[1];
  const actualDiff = homeGoals - awayGoals;
  const pickOutcome = Math.sign(pickDiff);
  const actualOutcome = Math.sign(actualDiff);

  if (pickOutcome === actualOutcome) {
    const close =
      Math.abs(pick[0] - homeGoals) + Math.abs(pick[1] - awayGoals) === 1;
    if (close) {
      return { kind: "close", pillText: "Close · 1.5", note: "one goal off", you };
    }
    return { kind: "result", pillText: "Result · 1.0", note: "correct result", you };
  }

  return { kind: "miss", pillText: "Miss · 0", note: "needs a turnaround", you };
}

export function pickPoints(kind: PillKind): number {
  switch (kind) {
    case "exact":
      return 3;
    case "close":
      return 1.5;
    case "result":
      return 1;
    case "miss":
      return 0;
    default:
      return assertNever(kind);
  }
}
