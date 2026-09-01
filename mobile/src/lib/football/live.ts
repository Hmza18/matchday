import { fetchMatchPlays, fetchScoreboard, uniqueById } from "@/src/lib/football/client";
import { MOCK_MODE } from "@/src/lib/config";
import { mapLiveMatch, mapPlayItem } from "@/src/lib/football/map";
import { mockLiveCentre } from "@/src/lib/football/mock";
import type { LiveEvent, LiveMatch } from "@/src/lib/football/types";

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

export async function loadLiveCentre() {
  if (MOCK_MODE) return mockLiveCentre();
  try {
    return await fetchLiveCentre();
  } catch (error) {
    console.warn(`[api] live centre unavailable, serving bundled data: ${String(error)}`);
    return mockLiveCentre();
  }
}

async function fetchLiveCentre() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const [todayBoard, yesterdayBoard] = await Promise.all([
    fetchScoreboard(today),
    fetchScoreboard(yesterday),
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
  const liveEvents = await Promise.all(liveBase.map(enrichEvents));
  const live: LiveMatch[] = liveBase.map((match, index) => ({
    ...match,
    events: liveEvents[index] ?? match.events,
  }));

  const finished = uniqueById(mapped.filter((match) => match.isFinished)).reverse();
  const upcoming = uniqueById(
    mapped.filter((match) => !match.isLive && !match.isFinished),
  );

  return { live, finished, upcoming, updatedAt: new Date().toISOString() };
}
