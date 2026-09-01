import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldSyncAccountData } from "./account-sync.ts";

test("does not sync before local cache is ready, even when already signed in", () => {
  assert.equal(shouldSyncAccountData(false, true), false);
});

test("syncs once cache is ready and a user is present", () => {
  assert.equal(shouldSyncAccountData(true, true), true);
});

test("does not sync for guests after cache is ready", () => {
  assert.equal(shouldSyncAccountData(true, false), false);
});
