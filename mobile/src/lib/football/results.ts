import {
  buildGameweeks,
  currentGameweek,
  fetchAllFixtures,
  gameweekForDate,
} from "@/src/lib/football/client";
import { MOCK_MODE } from "@/src/lib/config";
import { mapLiveMatch } from "@/src/lib/football/map";
import { mockSeasonResults } from "@/src/lib/football/mock";

export type FinishedResult = {
  id: string;
  homeGoals: number;
  awayGoals: number;
  gameweek: number;
};

export async function loadSeasonResults() {
  if (MOCK_MODE) return mockSeasonResults();
  try {
    return await fetchSeasonResults();
  } catch (error) {
    console.warn(`[api] results unavailable, serving bundled data: ${String(error)}`);
    return mockSeasonResults();
  }
}

async function fetchSeasonResults() {
  const payload = await fetchAllFixtures();
  const weeks = buildGameweeks(payload.league.calendar);
  const results: FinishedResult[] = [];

  for (const event of payload.events) {
    const match = mapLiveMatch(event);
    if (!match?.isFinished || match.homeGoals == null || match.awayGoals == null) {
      continue;
    }
    results.push({
      id: match.id,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
      gameweek: gameweekForDate(event.date, weeks),
    });
  }

  return {
    results,
    gw: currentGameweek(weeks),
  };
}
