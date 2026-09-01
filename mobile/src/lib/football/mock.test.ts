import assert from "node:assert/strict";
import { test } from "node:test";
import { isMockFixtureId } from "./mock-ids.ts";

test("bundled demo fixture ids are recognised", () => {
  assert.equal(isMockFixtureId("mock-f1"), true);
  assert.equal(isMockFixtureId("mock-l2"), true);
});

test("real-looking event ids are not treated as bundled demo rows", () => {
  assert.equal(isMockFixtureId("401547"), false);
  assert.equal(isMockFixtureId("eng.1-12345"), false);
  assert.equal(isMockFixtureId(""), false);
});
