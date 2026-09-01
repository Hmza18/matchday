import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chunkArray,
  fetchAllPages,
  POSTGREST_MAX_ROWS,
} from "./paginate.ts";

describe("chunkArray", () => {
  it("splits into equal chunks and a remainder", () => {
    assert.deepEqual(chunkArray([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  });

  it("returns a single chunk when the list fits", () => {
    assert.deepEqual(chunkArray(["a", "b"], 100), [["a", "b"]]);
  });

  it("returns no chunks for an empty list", () => {
    assert.deepEqual(chunkArray([], 10), []);
  });
});

describe("fetchAllPages", () => {
  it("walks past the 1000-row PostgREST cap until a short page", async () => {
    const all = Array.from({ length: 2140 }, (_, index) => index);
    const requests: Array<[number, number]> = [];

    const rows = await fetchAllPages(async (from, to) => {
      requests.push([from, to]);
      return all.slice(from, to + 1);
    }, POSTGREST_MAX_ROWS);

    assert.equal(rows.length, 2140);
    assert.deepEqual(rows, all);
    assert.deepEqual(requests, [
      [0, 999],
      [1000, 1999],
      [2000, 2999],
    ]);
  });

  it("returns a single page when the result is under the cap", async () => {
    const rows = await fetchAllPages(async (from, to) => {
      return ["a", "b", "c"].slice(from, to + 1);
    });
    assert.deepEqual(rows, ["a", "b", "c"]);
  });

  it("stops when a full-size last page is followed by an empty one", async () => {
    const all = Array.from({ length: 1000 }, (_, index) => index);
    const rows = await fetchAllPages(async (from, to) => all.slice(from, to + 1), 1000);
    assert.equal(rows.length, 1000);
  });
});
