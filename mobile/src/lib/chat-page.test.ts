import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LEAGUE_CHAT_PAGE_SIZE,
  leagueChatPageQuery,
  transcriptChronological,
} from "./chat-page.ts";

test("chat query pages from the newest row, not the oldest", () => {
  const query = leagueChatPageQuery();
  assert.equal(query.ascending, false);
  assert.equal(query.limit, LEAGUE_CHAT_PAGE_SIZE);
  assert.equal(query.limit, 80);
});

test("ASC+limit would drop the 81st message; DESC+limit keeps it in the transcript", () => {
  const all = Array.from({ length: 81 }, (_, index) => `m${index + 1}`);

  const oldestPage = all.slice(0, 80);
  assert.equal(oldestPage.includes("m81"), false);

  const newestFirst = all.slice().reverse().slice(0, 80);
  const transcript = transcriptChronological(newestFirst);

  assert.equal(transcript[0], "m2");
  assert.equal(transcript[transcript.length - 1], "m81");
  assert.equal(transcript.includes("m1"), false);
  assert.equal(transcript.includes("m81"), true);
  assert.equal(transcript.length, 80);
});
