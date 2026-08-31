import {
  buildGameweeks,
  currentGameweek,
  fetchAllFixtures,
  gameweekForDate,
} from "@/src/lib/football/client";
import { mapLiveMatch } from "@/src/lib/football/map";

export type FinishedResult = {
  id: string;
  homeGoals: number;
  awayGoals: number;
  gameweek: number;
};

export async function loadSeasonResults() {
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
