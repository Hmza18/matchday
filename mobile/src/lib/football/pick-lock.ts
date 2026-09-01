import type { PickFixture } from "./types";

/** True while a pick can still be changed. Evaluated against live time so a
 *  fixture loaded before kickoff does not stay editable after it. */
export function isPickOpen(fixture: PickFixture, now = Date.now()) {
  const kickoffMs = new Date(fixture.kickoffIso).getTime();
  if (!Number.isFinite(kickoffMs) || kickoffMs <= now) return false;
  // Live API maps not-started games to "NS"; older mock payloads used "pre".
  return fixture.status === "NS" || fixture.status === "pre";
}

export function secondsUntilKickoff(kickoffIso: string, now = Date.now()) {
  return Math.floor((new Date(kickoffIso).getTime() - now) / 1000);
}
