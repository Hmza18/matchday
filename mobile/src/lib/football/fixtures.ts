import {
  buildGameweeks,
  currentGameweek,
  fetchAllFixtures,
  gameweekForDate,
  uniqueById,
} from "@/src/lib/football/client";
import { mapPickFixture } from "@/src/lib/football/map";
import type { PickFixture } from "@/src/lib/football/types";

export async function loadFixturesForGw(requestedGw?: number) {
  const payload = await fetchAllFixtures();
  const weeks = buildGameweeks(payload.league.calendar);
  const now = Date.now();

  const mapped = payload.events
    .map((event) => {
      const gw = gameweekForDate(event.date, weeks);
      return mapPickFixture(event, gw, now);
    })
    .filter((fixture): fixture is PickFixture => fixture !== null)
    .sort(
      (a, b) =>
        new Date(a.kickoffIso).getTime() - new Date(b.kickoffIso).getTime(),
    );

  const activeGw =
    requestedGw && requestedGw > 0 ? requestedGw : currentGameweek(weeks);

  let fixtures = mapped.filter((fixture) => {
    const gw = gameweekForDate(fixture.kickoffIso, weeks);
    return gw === activeGw;
  });

  if (fixtures.length === 0) {
    fixtures = mapped.slice(0, 10);
  }

  return {
    season: payload.league.season.year,
    gw: activeGw,
    weeks,
    fixtures: uniqueById(fixtures),
  };
}
