/**
 * Merge guest/local picks onto an account without clobbering either side.
 *
 * Sign-in used to replace the in-memory map with whatever the server had.
 * Guest picks live in React state (and AsyncStorage), not in the one-shot
 * cache ref, so a new account (empty remote) wiped the session's picks, and
 * an existing account dropped any local fixture the server did not yet have.
 */

export type ScorePair = [number, number];
export type PickMap = Record<string, ScorePair>;

/** Local picks the account does not have yet. Remote wins on id conflicts. */
export function picksToUpload(local: PickMap, remote: PickMap): PickMap {
  const pending: PickMap = {};
  for (const [fixtureId, scores] of Object.entries(local)) {
    if (remote[fixtureId] === undefined) {
      pending[fixtureId] = scores;
    }
  }
  return pending;
}

/** Remote overwrites overlapping ids; local-only ids are kept (failed uploads). */
export function mergePicks(local: PickMap, remote: PickMap): PickMap {
  return { ...local, ...remote };
}

export function gameweekForStoredPick(
  round: string | null | undefined,
  fallback: number,
): number {
  const match = round?.match(/(\d+)/);
  const parsed = match ? Number(match[1]) : fallback;
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 38) return fallback;
  return parsed;
}
