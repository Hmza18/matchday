import { NextResponse } from "next/server";
import { fetchMatchPlays, fetchScoreboard, uniqueById } from "@/lib/football/client";
import { mapLiveMatch, mapPlayItem } from "@/lib/football/map";
import type { LiveEvent, LiveMatch } from "@/lib/football/types";

export const dynamic = "force-dynamic";

async function enrichEvents(match: LiveMatch): Promise<LiveEvent[]> {
  if (match.events.length > 0) return match.events;

  try {
    const plays = await fetchMatchPlays(match.id);
    return plays.items
      .map(mapPlayItem)
      .filter((event): event is LiveEvent => event !== null);
  } catch {
    return match.events;
  }
}

export async function GET() {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const [todayBoard, yesterdayBoard] = await Promise.all([
      fetchScoreboard(today, 30),
      fetchScoreboard(yesterday, 60),
    ]);

    const allEvents = [...yesterdayBoard.events, ...todayBoard.events];
    const seen = new Set<string>();
    const uniqueEvents = allEvents.filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });

    const mapped = uniqueById(
      uniqueEvents
        .map(mapLiveMatch)
        .filter((match): match is LiveMatch => match !== null),
    );

    const liveBase = mapped.filter((match) => match.isLive);
    const liveEvents = await Promise.all(
      liveBase.map(async (match) => enrichEvents(match)),
    );
    const live: LiveMatch[] = liveBase.map((match, index) => ({
      ...match,
      events: liveEvents[index] ?? match.events,
    }));

    const finished = uniqueById(
      mapped.filter((match) => match.isFinished),
    ).reverse();

    const upcoming = uniqueById(
      mapped.filter((match) => !match.isLive && !match.isFinished),
    );

    return NextResponse.json(
      {
        live,
        finished,
        upcoming,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load live scores.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
