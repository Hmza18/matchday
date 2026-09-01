import { API_BASE_URL, API_KEY, REQUEST_TIMEOUT_MS } from "@/src/lib/config";
import type { Wc26FixturesResponse, Wc26PlaysResponse, Wc26ScoreboardResponse } from "@/src/lib/football/types";

export { buildGameweeks, currentGameweek, gameweekForDate } from "@/src/lib/football/gameweeks";

const BASE_URL = API_BASE_URL;

export const PL_LEAGUE_SLUG = "eng.1";

export function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return [...map.values()];
}

/** Thrown when the API answers with a 4xx. These are never retried. */
class ClientError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requestOnce<T>(url: URL): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (API_KEY) headers["x-api-key"] = API_KEY;

    const response = await fetch(url, { headers, signal: controller.signal });

    if (response.status === 429) {
      throw new ClientError(429, "Football API rate limit reached. Try again in a moment.");
    }
    if (response.status >= 400 && response.status < 500) {
      throw new ClientError(response.status, `Football API error (${response.status}).`);
    }
    if (!response.ok) {
      throw new Error(`Football API error (${response.status}).`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch with a hard 10s timeout and a single retry.
 *
 * Only network/timeout failures are retried; a 4xx is a real answer and
 * retrying it just doubles the wait. The timeout matters most under Expo
 * tunnel mode, where a hung request is indistinguishable from a broken app.
 */
export async function wc26Fetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path, BASE_URL);
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(name, String(value));
  }

  try {
    return await requestOnce<T>(url);
  } catch (error) {
    if (error instanceof ClientError) throw error;
    console.warn(`[api] retrying ${path} after ${String(error)}`);
    return requestOnce<T>(url);
  }
}

export async function fetchAllFixtures(): Promise<Wc26FixturesResponse> {
  const payload = await wc26Fetch<Wc26FixturesResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/fixtures`,
    { status: "all", pageIndex: 1, pageSize: 100 },
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

export async function fetchScoreboard(date: Date) {
  return wc26Fetch<Wc26ScoreboardResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/scoreboard`,
    { dates: ymdCompact(date) },
  );
}

export async function fetchMatchPlays(eventId: string) {
  return wc26Fetch<Wc26PlaysResponse>(
    `/get/soccer/${PL_LEAGUE_SLUG}/events/${eventId}/plays`,
    { importantOnly: "true", pageSize: 200 },
  );
}

