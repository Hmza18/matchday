import type { Wc26FixturesResponse, Wc26PlaysResponse, Wc26ScoreboardResponse } from "@/lib/football/types";

const BASE_URL =
  process.env.FOOTBALL_API_BASE?.trim() || "https://worldcup26.ir";

export const PL_LEAGUE_SLUG = "eng.1";

export function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

export async function wc26Fetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 429) {
    throw new Error("Football API rate limit reached. Try again in a moment.");
  }

  if (!response.ok) {
    throw new Error(`Football API error (${response.status}).`);
  }

  return (await response.json()) as T;
}

export async function fetchAllFixtures(
  revalidate = 120,
): Promise<Wc26FixturesResponse> {
  const payload = await wc26Fetch<Wc26FixturesResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/fixtures`,
    { status: "all", pageIndex: 1, pageSize: 100 },
    { next: { revalidate } },
  );

  const events = uniqueById(payload.events);

  return {
    ...payload,
    events,
    count: events.length,
    pageIndex: 1,
    pageCount: 1,
  };
}

export function ymdCompact(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export async function fetchScoreboard(date: Date, revalidate = 30) {
  return wc26Fetch<Wc26ScoreboardResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/scoreboard`,
    { dates: ymdCompact(date) },
    { next: { revalidate } },
  );
}

export async function fetchMatchPlays(eventId: string, revalidate = 30) {
  return wc26Fetch<Wc26PlaysResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/events/${eventId}/plays`,
    { importantOnly: "true", pageSize: 200 },
    { next: { revalidate } },
  );
}

export function buildGameweeks(calendar: string[]) {
  const dates = [...new Set(calendar.map((entry) => entry.slice(0, 10)))].sort();
  const weeks: string[][] = [];
  let current: string[] = [];
  let previous: Date | null = null;

  for (const dateStr of dates) {
    const date = new Date(`${dateStr}T12:00:00Z`);
    if (
      previous &&
      date.getTime() - previous.getTime() >= 4 * 24 * 60 * 60 * 1000
    ) {
      weeks.push(current);
      current = [];
    }
    current.push(dateStr);
    previous = date;
  }

  if (current.length > 0) weeks.push(current);
  return weeks;
}

export function gameweekForDate(iso: string, weeks: string[][]) {
  const day = iso.slice(0, 10);
  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    const start = week[0]!;
    const end = week[week.length - 1]!;
    if (day >= start && day <= end) return index + 1;
  }
  return 1;
}

export function currentGameweek(weeks: string[][], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    const start = week[0]!;
    const end = week[week.length - 1]!;
    if (today >= start && today <= end) return index + 1;
  }

  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    if (today < week[0]!) return Math.max(1, index + 1);
  }

  return Math.max(1, weeks.length);
}
