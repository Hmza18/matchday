import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isFellowPickReadable,
  pickFixtureIdsForBoard,
} from "./picks-privacy.ts";

describe("isFellowPickReadable", () => {
  const kickoff = "2026-09-05T14:00:00.000Z";
  const kickoffMs = Date.parse(kickoff);

  it("hides picks with no kickoff so unsynced rows cannot leak", () => {
    assert.equal(isFellowPickReadable(null, kickoffMs), false);
    assert.equal(isFellowPickReadable(undefined, kickoffMs), false);
    assert.equal(isFellowPickReadable("", kickoffMs), false);
  });

  it("hides another player's pick until kickoff", () => {
    assert.equal(isFellowPickReadable(kickoff, kickoffMs - 1), false);
  });

  it("reveals the pick at kickoff so the board can score a locked fixture", () => {
    assert.equal(isFellowPickReadable(kickoff, kickoffMs), true);
    assert.equal(isFellowPickReadable(kickoff, kickoffMs + 60_000), true);
  });
});

describe("pickFixtureIdsForBoard", () => {
  it("only asks the database for finished fixtures, not the rest of the season", () => {
    assert.deepEqual(
      pickFixtureIdsForBoard([
        { id: "401879301" },
        { id: "401879302" },
        { id: "401879301" },
      ]),
      ["401879301", "401879302"],
    );
    assert.deepEqual(pickFixtureIdsForBoard([]), []);
  });
});
