/**
 * Remote picks and leagues must wait until local cache has been read.
 *
 * AuthGate only mounts MatchdayProvider after auth resolves, so a signed-in
 * user is already present on the first render. If this check used a ref
 * flipped after AsyncStorage returns, the load effect would not re-run and
 * account data would never fetch.
 */
export function shouldSyncAccountData(cacheReady: boolean, hasUser: boolean): boolean {
  return cacheReady && hasUser;
}
