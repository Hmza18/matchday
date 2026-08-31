import {
  buildGameweeks,
  fetchAllFixtures,
  gameweekForDate,
} from "@/lib/football/client";
import { mapPickFixture } from "@/lib/football/map";
import type { PickFixture } from "@/lib/football/types";

export async function findPickFixtureById(
  fixtureId: string,
): Promise<PickFixture | null> {
  const payload = await fetchAllFixtures();
  const weeks = buildGameweeks(payload.league.calendar);
  const now = Date.now();
  const event = payload.events.find((item) => item.id === fixtureId);
  if (!event) return null;

  const gameweek = gameweekForDate(event.date, weeks);
  return mapPickFixture(event, gameweek, now);
}

export function isPickOpen(fixture: PickFixture, now = Date.now()) {
  const kickoffMs = new Date(fixture.kickoffIso).getTime();
  return kickoffMs > now && fixture.status === "NS";
}
