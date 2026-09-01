import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SEASON_RESULTS_MAX_AGE_MS,
  isSeasonResultsCacheFresh,
} from "./results-cache.ts";

describe("isSeasonResultsCacheFresh", () => {
  it("treats a missing fetch as stale so the first Pools load always hits the API", () => {
    assert.equal(isSeasonResultsCacheFresh(null, 1_000_000), false);
  });

  it("treats a session-long cache as stale after the TTL so full-time results can land", () => {
    const fetchedAt = 1_000_000;
    assert.equal(
      isSeasonResultsCacheFresh(fetchedAt, fetchedAt + 5_000, SEASON_RESULTS_MAX_AGE_MS),
      true,
    );
    assert.equal(
      isSeasonResultsCacheFresh(
        fetchedAt,
        fetchedAt + SEASON_RESULTS_MAX_AGE_MS,
        SEASON_RESULTS_MAX_AGE_MS,
      ),
      false,
    );
    assert.equal(
      isSeasonResultsCacheFresh(
        fetchedAt,
        fetchedAt + 3 * 60 * 60 * 1000,
        SEASON_RESULTS_MAX_AGE_MS,
      ),
      false,
    );
  });
});
