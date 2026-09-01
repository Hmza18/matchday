import { NextResponse } from "next/server";
import {
  buildGameweeks,
  currentGameweek,
  fetchAllFixtures,
  gameweekForDate,
  uniqueById,
} from "@/lib/football/client";
import { mapPickFixture } from "@/lib/football/map";
import type { PickFixture } from "@/lib/football/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedGw = Number(searchParams.get("round") || searchParams.get("gw") || 0);

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
      requestedGw > 0 ? requestedGw : currentGameweek(weeks);

    const fixtures = uniqueById(
      mapped.filter((fixture) => {
        const gw = gameweekForDate(fixture.kickoffIso, weeks);
        return gw === activeGw;
      }),
    );

    return NextResponse.json(
      {
        season: payload.league.season.year,
        gw: activeGw,
        round: fixtures[0]?.round ?? `Regular Season - ${activeGw}`,
        fixtures,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load fixtures.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
