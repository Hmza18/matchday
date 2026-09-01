/**
 * Local pick cache keys must be scoped to the signed-in account.
 *
 * A single AsyncStorage key (`matchday-state`) was shared by guests and every
 * account on the device. Sign-out unmounts MatchdayProvider without clearing
 * it, so the next session hydrated those picks. A new empty account then
 * uploaded them; a guest session showed them as their own.
 */

export const LEGACY_PICKS_CACHE_KEY = "matchday-state";

export function picksCacheKey(userId: string | null): string {
  return userId ? `${LEGACY_PICKS_CACHE_KEY}:user:${userId}` : `${LEGACY_PICKS_CACHE_KEY}:guest`;
}

/** First existing key wins. Signed-in sessions never read the shared legacy key. */
export function picksCacheReadKeys(userId: string | null): string[] {
  const scoped = picksCacheKey(userId);
  if (userId) return [scoped];
  return [scoped, LEGACY_PICKS_CACHE_KEY];
}

/** Drop the pre-namespace key so a later guest cannot inherit account leftover. */
export function picksCacheKeysToClearOnSignOut(): string[] {
  return [LEGACY_PICKS_CACHE_KEY];
}
