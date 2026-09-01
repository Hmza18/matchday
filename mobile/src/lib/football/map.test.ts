import { test } from "node:test";
import assert from "node:assert/strict";
import { isPickOpen, secondsUntilKickoff } from "./pick-lock.ts";
import type { PickFixture } from "./types.ts";

function fixture(overrides: Partial<PickFixture> = {}): PickFixture {
  return {
    id: "f1",
    home: { id: 1, name: "Home", mono: "HOM", logo: null, color: "#000" },
    away: { id: 2, name: "Away", mono: "AWY", logo: null, color: "#111" },
    kickoffIso: new Date("2026-09-01T15:00:00.000Z").toISOString(),
    kickoffLabel: "Tue 1 Sep · 15:00",
    venue: "Test Ground",
    lockSeconds: 120,
    locked: false,
    flag: false,
    def: [1, 1],
    dist: [40, 30, 30],
    round: "Regular Season - 4",
    status: "NS",
    ...overrides,
  };
}

test("a not-started fixture stays open until kickoff", () => {
  const open = fixture();
  assert.equal(isPickOpen(open, Date.parse("2026-09-01T14:59:59.000Z")), true);
  assert.equal(isPickOpen(open, Date.parse("2026-09-01T15:00:00.000Z")), false);
  assert.equal(isPickOpen(open, Date.parse("2026-09-01T15:00:01.000Z")), false);
});

test("snapshot lockSeconds does not keep a kicked-off fixture editable", () => {
  // Same bug the picks screen used to have: lockSeconds frozen at fetch time.
  const stale = fixture({
    lockSeconds: 600,
    locked: false,
    kickoffIso: new Date("2026-09-01T15:00:00.000Z").toISOString(),
  });
  assert.equal(isPickOpen(stale, Date.parse("2026-09-01T15:05:00.000Z")), false);
});

test("in-play status locks even if kickoff is still in the future", () => {
  const live = fixture({
    status: "1H",
    kickoffIso: new Date("2026-09-01T16:00:00.000Z").toISOString(),
  });
  assert.equal(isPickOpen(live, Date.parse("2026-09-01T15:00:00.000Z")), false);
});

test("secondsUntilKickoff ticks against live time, not the snapshot", () => {
  const kickoff = "2026-09-01T15:00:00.000Z";
  assert.equal(secondsUntilKickoff(kickoff, Date.parse("2026-09-01T14:50:00.000Z")), 600);
  assert.equal(secondsUntilKickoff(kickoff, Date.parse("2026-09-01T15:01:00.000Z")), -60);
});
