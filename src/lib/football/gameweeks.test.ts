import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGameweeks,
  currentGameweek,
  gameweekForDate,
} from "./gameweeks.ts";

/** 2026-27 Premier League calendar as returned by the fixtures API. */
const PL_2026_CALENDAR = [
  "2026-08-21T07:00Z",
  "2026-08-22T07:00Z",
  "2026-08-23T07:00Z",
  "2026-08-24T07:00Z",
  "2026-08-28T07:00Z",
  "2026-08-29T07:00Z",
  "2026-08-30T07:00Z",
  "2026-08-31T07:00Z",
  "2026-09-04T07:00Z",
  "2026-09-05T07:00Z",
  "2026-09-06T07:00Z",
  "2026-09-12T07:00Z",
  "2026-09-13T07:00Z",
  "2026-09-14T07:00Z",
  "2026-09-18T07:00Z",
  "2026-09-19T07:00Z",
  "2026-09-20T07:00Z",
  "2026-10-10T07:00Z",
  "2026-10-11T07:00Z",
  "2026-10-12T07:00Z",
  "2026-10-17T07:00Z",
  "2026-10-18T07:00Z",
  "2026-10-19T07:00Z",
  "2026-10-23T07:00Z",
  "2026-10-24T07:00Z",
  "2026-10-25T07:00Z",
  "2026-10-31T07:00Z",
  "2026-11-01T07:00Z",
  "2026-11-02T07:00Z",
  "2026-11-07T07:00Z",
  "2026-11-21T07:00Z",
  "2026-11-28T07:00Z",
  "2026-12-02T07:00Z",
  "2026-12-05T07:00Z",
  "2026-12-12T07:00Z",
  "2026-12-19T07:00Z",
  "2026-12-26T07:00Z",
  "2026-12-30T07:00Z",
  "2027-01-02T07:00Z",
  "2027-01-06T07:00Z",
  "2027-01-16T07:00Z",
  "2027-01-23T07:00Z",
  "2027-01-30T07:00Z",
  "2027-02-06T07:00Z",
  "2027-02-10T07:00Z",
  "2027-02-20T07:00Z",
  "2027-02-27T07:00Z",
  "2027-03-03T07:00Z",
  "2027-03-13T07:00Z",
  "2027-03-20T07:00Z",
  "2027-04-10T07:00Z",
  "2027-04-17T07:00Z",
  "2027-04-24T07:00Z",
  "2027-05-01T07:00Z",
  "2027-05-08T07:00Z",
  "2027-05-15T07:00Z",
  "2027-05-23T07:00Z",
  "2027-05-30T07:00Z",
];

describe("buildGameweeks", () => {
  it("splits the 2026-27 calendar into 38 Premier League gameweeks", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.equal(weeks.length, 38);
  });

  it("keeps a Fri–Mon opening weekend as a single gameweek", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.deepEqual(weeks[0], [
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
      "2026-08-24",
    ]);
  });

  it("does not merge the midweek round on 2 Dec with the weekend on 5 Dec", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.deepEqual(weeks[12], ["2026-12-02"]);
    assert.deepEqual(weeks[13], ["2026-12-05"]);
    assert.equal(gameweekForDate("2026-12-02T19:30:00Z", weeks), 13);
    assert.equal(gameweekForDate("2026-12-05T15:00:00Z", weeks), 14);
  });

  it("does not merge Boxing Day midweek with New Year's Day weekend", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.deepEqual(weeks[17], ["2026-12-30"]);
    assert.deepEqual(weeks[18], ["2027-01-02"]);
    assert.equal(gameweekForDate("2026-12-30T20:00:00Z", weeks), 18);
    assert.equal(gameweekForDate("2027-01-02T15:00:00Z", weeks), 19);
  });

  it("places the final day of the season in GW38", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.deepEqual(weeks[37], ["2027-05-30"]);
    assert.equal(gameweekForDate("2027-05-30T15:00:00Z", weeks), 38);
  });
});

describe("currentGameweek", () => {
  it("returns the in-progress week, or the next one during a gap", () => {
    const weeks = buildGameweeks(PL_2026_CALENDAR);
    assert.equal(currentGameweek(weeks, new Date("2026-08-22T12:00:00Z")), 1);
    assert.equal(currentGameweek(weeks, new Date("2026-09-01T12:00:00Z")), 3);
    assert.equal(currentGameweek(weeks, new Date("2026-12-03T12:00:00Z")), 14);
    assert.equal(currentGameweek(weeks, new Date("2027-06-01T12:00:00Z")), 38);
  });
});
