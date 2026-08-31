"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCountdown } from "@/lib/data";
import { pickPoints, scorePick } from "@/lib/football/map";
import type { LiveMatch } from "@/lib/football/types";
import { useMatchday } from "@/lib/store";
import { CheckIcon, ClockIcon, FlameIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { ClubBadge } from "@/components/ui";

export function PicksScreen() {
  const {
    loading,
    fixtures,
    fixturesError,
    picks,
    pickFor,
    bump,
    pop,
    saved,
    pickSaveError,
    refresh,
  } = useMatchday();
  const [finished, setFinished] = useState<LiveMatch[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/football/live", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { finished?: LiveMatch[] }) => {
        if (!cancelled) setFinished(payload.finished ?? []);
      })
      .catch(() => {
        if (!cancelled) setFinished([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fixtures]);

  const gwPoints = useMemo(() => {
    let total = 0;
    let scored = 0;
    for (const fixture of fixtures) {
      const match = finished.find((item) => item.id === fixture.id);
      if (!match || match.homeGoals == null || match.awayGoals == null) continue;
      const result = scorePick(picks[fixture.id], match.homeGoals, match.awayGoals);
      total += pickPoints(result.kind);
      scored += 1;
    }
    return { total, scored };
  }, [fixtures, finished, picks]);

  if (loading) {
    return (
      <div className="grid gap-3.5">
        {[1, 2, 3].map((key) => (
          <div key={key} className="rounded-[14px] border border-md-line bg-md-paper p-4">
            <div className="md-shimmer h-3 w-[42%] rounded-full" />
            <div className="md-shimmer mt-4 h-11 rounded-xl" />
            <div className="md-shimmer mt-2.5 h-11 rounded-xl" />
            <div className="md-shimmer mt-[18px] h-2 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (fixturesError) {
    return (
      <div className="rounded-[14px] border border-md-danger/20 bg-md-paper p-5">
        <h2 className="font-headline text-[18px] font-semibold">Couldn’t load fixtures</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-md-muted">{fixturesError}</p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 h-10 rounded-full bg-md-green px-4 text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="rounded-[14px] border border-md-line bg-md-paper p-5 text-[13px] text-md-muted">
        No Premier League fixtures found for this gameweek.
      </div>
    );
  }

  const openCount = fixtures.filter((fixture) => {
    const kickoffLeft = Math.floor(
      (new Date(fixture.kickoffIso).getTime() - Date.now()) / 1000,
    );
    return kickoffLeft >= 0 && fixture.status === "NS";
  }).length;

  return (
    <div>
      {pickSaveError ? (
        <div className="mb-3 rounded-[14px] border border-md-danger/20 bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          {pickSaveError}
        </div>
      ) : null}
      <div className="mb-3.5 flex items-center justify-between gap-2.5">
        <p className="m-0 text-[13px] leading-[1.5] text-md-muted">
          {openCount > 0
            ? `${openCount} fixtures still open. Tap the steppers — every change saves itself.`
            : "All picks locked in for this gameweek."}
          {gwPoints.scored > 0 ? (
            <>
              {" "}
              GW points so far:{" "}
              <strong className="font-headline text-md-green-deep">
                {gwPoints.total % 1 === 0 ? gwPoints.total.toFixed(0) : gwPoints.total.toFixed(1)}
              </strong>
            </>
          ) : null}
        </p>
        <span className="shrink-0 rounded-full bg-md-mint px-2.5 py-[5px] font-headline text-[13px] font-semibold tracking-[0.03em] text-md-green-deep">
          {fixtures.length - openCount}/{fixtures.length} in
        </span>
      </div>

      <div className="grid gap-3.5">
        {fixtures.map((fixture) => {
          const left = Math.floor(
            (new Date(fixture.kickoffIso).getTime() - Date.now()) / 1000,
          );
          const locked = left < 0 || fixture.status !== "NS";
          const crit = !locked && left < 900;
          const warn = !locked && left < 7200 && !crit;
          const pick = pickFor(fixture.id, fixture.def);
          const home = fixture.home;
          const away = fixture.away;

          return (
            <article
              key={fixture.id}
              className="rounded-[14px] border bg-md-paper p-4 shadow-[0_1px_2px_rgba(31,41,55,.06)]"
              style={{
                borderColor: crit ? "#FCA5A5" : "#E5E7EB",
                opacity: locked ? 0.94 : 1,
              }}
            >
              <div className="mb-0.5 flex items-start gap-2.5">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[7px]">
                  <span className="text-[11.5px] font-medium text-md-muted">
                    {fixture.kickoffLabel}
                  </span>
                  {fixture.flag ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2 py-[3px] text-[10.5px] font-bold tracking-[0.05em] text-[#B45309] uppercase">
                      <FlameIcon />
                      Derby
                    </span>
                  ) : null}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-[5px] rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${crit ? "md-pulse" : ""}`}
                  style={
                    locked
                      ? { background: "#F1F3F2", color: "#6B7280" }
                      : crit
                        ? { background: "#FEE2E2", color: "#B91C1C" }
                        : warn
                          ? { background: "#FEF3C7", color: "#92400E" }
                          : { background: "#F5FAF8", color: "#6B7280", border: "1px solid #E5E7EB" }
                  }
                >
                  <ClockIcon locked={locked} />
                  {locked ? "Picks locked" : `Locks in ${formatCountdown(left)}`}
                </span>
              </div>
              <div className="mb-3 text-[11.5px] text-md-muted">{fixture.venue}</div>

              {([0, 1] as const).map((side) => {
                const club = side === 0 ? home : away;
                const popped = pop === fixture.id + String(side);
                return (
                  <div key={side} className="flex items-center gap-[11px] py-[5px]">
                    <ClubBadge mono={club.mono} color={club.color} logo={club.logo} />
                    <span className="min-w-0 flex-1 text-[14.5px] font-semibold tracking-[-0.005em]">
                      {club.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        aria-label={`Decrease ${club.name} score`}
                        disabled={locked}
                        onClick={() => bump(fixture.id, side, -1, locked)}
                        className="grid size-11 place-items-center rounded-xl border border-md-line"
                        style={{
                          background: locked ? "#F8F9F9" : "#f8f8f8",
                          color: locked ? "#B6BCC4" : "#146C43",
                          cursor: locked ? "not-allowed" : "pointer",
                        }}
                      >
                        <MinusIcon />
                      </button>
                      <span
                        className="w-10 text-center font-headline text-[27px] font-semibold tabular-nums"
                        style={{
                          color: locked ? "#6B7280" : "#1F2937",
                          transform: popped ? "scale(1.22)" : "scale(1)",
                          opacity: popped ? 0.85 : 1,
                          transition: "transform .16s ease, opacity .16s ease",
                        }}
                      >
                        {pick[side]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${club.name} score`}
                        disabled={locked}
                        onClick={() => bump(fixture.id, side, 1, locked)}
                        className="grid size-11 place-items-center rounded-xl border border-md-line"
                        style={{
                          background: locked ? "#F8F9F9" : "#f8f8f8",
                          color: locked ? "#B6BCC4" : "#146C43",
                          cursor: locked ? "not-allowed" : "pointer",
                        }}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-3.5 border-t border-md-line pt-[13px]">
                <div className="flex h-[7px] overflow-hidden rounded-full bg-md-mint-soft">
                  <div
                    className="bg-md-green transition-[width] duration-500"
                    style={{ width: `${fixture.dist[0]}%` }}
                  />
                  <div
                    className="bg-[#34D399] transition-[width] duration-500"
                    style={{ width: `${fixture.dist[1]}%` }}
                  />
                  <div
                    className="bg-[#C7CDD4] transition-[width] duration-500"
                    style={{ width: `${fixture.dist[2]}%` }}
                  />
                </div>
                <div className="mt-[7px] flex justify-between gap-2 text-[11px] text-md-muted">
                  <span className="font-semibold text-md-green-deep">
                    {fixture.dist[0]}% {home.mono} win
                  </span>
                  <span>{fixture.dist[1]}% draw</span>
                  <span>
                    {fixture.dist[2]}% {away.mono} win
                  </span>
                </div>
              </div>

              {saved === fixture.id ? (
                <div className="md-fade mt-3 inline-flex items-center gap-1.5 rounded-full bg-md-mint px-[11px] py-1.5 text-xs font-semibold text-md-green-deep">
                  <CheckIcon />
                  Pick saved
                </div>
              ) : null}
              {locked ? (
                <div className="mt-3 text-xs text-md-muted">
                  Submitted {pick[0]}–{pick[1]} · read only
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
