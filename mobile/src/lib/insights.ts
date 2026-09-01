import type { PickFixture } from "@/src/lib/football/types";

export type FixtureInsights = {
  fixture: PickFixture;
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  expectedPoints: Array<{ score: string; xp: number; width: number }>;
  insight: string;
};

const COMMON_SCORELINES: Array<[number, number]> = [
  [2, 0],
  [2, 1],
  [1, 0],
  [3, 1],
  [1, 1],
  [0, 0],
  [0, 1],
  [1, 2],
];

/** Rough expected-points model from pick distribution and common scorelines. */
function scorelineXp(home: number, away: number, dist: [number, number, number]): number {
  const [homeWin, draw, awayWin] = dist;
  const total = homeWin + draw + awayWin || 1;
  const h = homeWin / total;
  const d = draw / total;
  const a = awayWin / total;

  if (home > away) return h * 3 + d * 1;
  if (home < away) return a * 3 + d * 1;
  return d * 3 + (h + a) * 1;
}

export function insightsForFixture(fixture: PickFixture): FixtureInsights {
  const [homeWin, draw, awayWin] = fixture.dist;
  const total = homeWin + draw + awayWin || 1;
  const homeWinPct = Math.round((homeWin / total) * 100);
  const drawPct = Math.round((draw / total) * 100);
  const awayWinPct = Math.round((awayWin / total) * 100);

  const ranked = COMMON_SCORELINES.map(([h, a]) => ({
    score: `${h}–${a}`,
    xp: scorelineXp(h, a, fixture.dist),
  }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 4);

  const maxXp = ranked[0]?.xp ?? 1;
  const expectedPoints = ranked.map((row) => ({
    ...row,
    xp: Math.round(row.xp * 100) / 100,
    width: Math.round((row.xp / maxXp) * 100),
  }));

  const top = expectedPoints[0];
  const insight = top
    ? `Model favours ${top.score} (${top.xp.toFixed(2)} xP). Crowd split: ${homeWinPct}% home · ${drawPct}% draw · ${awayWinPct}% away.`
    : "Pick distribution drives the model output for this fixture.";

  return {
    fixture,
    homeWinPct,
    drawPct,
    awayWinPct,
    expectedPoints,
    insight,
  };
}

/** Featured fixture: flagged pick of the week, else first open fixture, else first. */
export function featuredFixture(fixtures: PickFixture[]): PickFixture | null {
  if (fixtures.length === 0) return null;
  return fixtures.find((f) => f.flag) ?? fixtures.find((f) => !f.locked) ?? fixtures[0]!;
}
