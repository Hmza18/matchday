import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEGACY_PICKS_CACHE_KEY,
  picksCacheKey,
  picksCacheKeysToClearOnSignOut,
  picksCacheReadKeys,
} from "./picks-cache.ts";

test("guest and accounts do not share a cache key", () => {
  const alice = "11111111-1111-1111-1111-111111111111";
  const bob = "22222222-2222-2222-2222-222222222222";
  assert.equal(picksCacheKey(null), "matchday-state:guest");
  assert.equal(picksCacheKey(alice), `matchday-state:user:${alice}`);
  assert.notEqual(picksCacheKey(alice), picksCacheKey(bob));
  assert.notEqual(picksCacheKey(alice), picksCacheKey(null));
});

test("a signed-in session never hydrates the shared leftover key", () => {
  const alice = "11111111-1111-1111-1111-111111111111";
  assert.deepEqual(picksCacheReadKeys(alice), [picksCacheKey(alice)]);
  assert.equal(picksCacheReadKeys(alice).includes(LEGACY_PICKS_CACHE_KEY), false);
});

test("guests may still read the pre-namespace key once", () => {
  assert.deepEqual(picksCacheReadKeys(null), [
    picksCacheKey(null),
    LEGACY_PICKS_CACHE_KEY,
  ]);
});

test("sign-out drops the shared leftover key so a later guest cannot inherit it", () => {
  const alice = "11111111-1111-1111-1111-111111111111";
  const cleared = picksCacheKeysToClearOnSignOut();
  assert.deepEqual(cleared, [LEGACY_PICKS_CACHE_KEY]);
  assert.equal(cleared.includes(picksCacheKey(alice)), false);
  assert.equal(cleared.includes(picksCacheKey(null)), false);
});
