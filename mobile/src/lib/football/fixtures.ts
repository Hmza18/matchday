import {
  buildGameweeks,
  currentGameweek,
  fetchAllFixtures,
  gameweekForDate,
  uniqueById,
} from "@/src/lib/football/client";
import { MOCK_MODE } from "@/src/lib/config";
import { mapPickFixture } from "@/src/lib/football/map";
import { mockFixtures } from "@/src/lib/football/mock";
import type { PickFixture } from "@/src/lib/football/types";

function mockPayload(requestedGw?: number) {
  return {
    season: 2026,
    gw: requestedGw && requestedGw > 0 ? requestedGw : 7,
    weeks: [] as string[][],
    fixtures: mockFixtures(),
    usedFallback: true,
  };
}

export async function loadFixturesForGw(requestedGw?: number) {
  if (MOCK_MODE) return mockPayload(requestedGw);

  // Network failures must surface as errors. Falling back to bundled demo
  // clubs would let signed-in users upsert fake `mock-*` ids into `picks`.
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
    usedFallback: false,
  };
}
