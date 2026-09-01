import assert from "node:assert/strict";
import { test } from "node:test";
import {
  gameweekForStoredPick,
  mergePicks,
  picksToUpload,
} from "./pick-sync.ts";

test("guest picks made this session upload when the account has none", () => {
  const local = { "gw4-a": [2, 1] as [number, number], "gw4-b": [0, 0] as [number, number] };
  const pending = picksToUpload(local, {});
  assert.deepEqual(pending, local);
  assert.deepEqual(mergePicks(local, {}), local);
});

test("signing in does not drop current-GW guest picks when the account has older picks", () => {
  const local = { "gw4-a": [2, 1] as [number, number] };
  const remote = { "gw1-a": [1, 0] as [number, number] };
  assert.deepEqual(picksToUpload(local, remote), local);
  assert.deepEqual(mergePicks(local, remote), {
    "gw4-a": [2, 1],
    "gw1-a": [1, 0],
  });
});

test("stale local cache cannot overwrite a pick already on the account", () => {
  const local = { shared: [0, 0] as [number, number] };
  const remote = { shared: [3, 2] as [number, number] };
  assert.deepEqual(picksToUpload(local, remote), {});
  assert.deepEqual(mergePicks(local, remote), { shared: [3, 2] });
});

test("failed uploads keep local-only picks after a remote refresh", () => {
  const local = {
    uploaded: [1, 1] as [number, number],
    stillLocal: [2, 2] as [number, number],
  };
  const confirmed = { uploaded: [1, 1] as [number, number] };
  assert.deepEqual(mergePicks(local, confirmed), {
    uploaded: [1, 1],
    stillLocal: [2, 2],
  });
});

test("gameweek prefers the fixture round and rejects out-of-range values", () => {
  assert.equal(gameweekForStoredPick("Regular Season - 12", 1), 12);
  assert.equal(gameweekForStoredPick(null, 7), 7);
  assert.equal(gameweekForStoredPick("Friendly", 4), 4);
  assert.equal(gameweekForStoredPick("Round 99", 4), 4);
});
