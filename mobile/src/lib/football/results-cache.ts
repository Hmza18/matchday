/** Pools/settings must pick up newly finished matches; do not cache for the session. */
export const SEASON_RESULTS_MAX_AGE_MS = 30_000;

export function isSeasonResultsCacheFresh(
  fetchedAtMs: number | null,
  nowMs = Date.now(),
  maxAgeMs = SEASON_RESULTS_MAX_AGE_MS,
) {
  if (fetchedAtMs == null) return false;
  return nowMs - fetchedAtMs < maxAgeMs;
}
