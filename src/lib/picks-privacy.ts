/**
 * Fellow league members (including everyone in Matchday Global) may only
 * read another player's pick after that fixture's kickoff. Own picks stay
 * readable regardless of kickoff.
 */
export function isFellowPickReadable(
  kickoffAt: string | null | undefined,
  now = Date.now(),
) {
  if (!kickoffAt) return false;
  const kickoffMs = Date.parse(kickoffAt);
  return Number.isFinite(kickoffMs) && kickoffMs <= now;
}

/** Board scoring only needs picks for fixtures that already have a result. */
export function pickFixtureIdsForBoard(results: { id: string }[]) {
  return [...new Set(results.map((result) => result.id))];
}
