"use client";

import { useCallback, useEffect, useState } from "react";
import { scorePick } from "@/lib/football/map";
import type { LiveMatch } from "@/lib/football/types";
import { useMatchday } from "@/lib/store";
import { ClubBadge, ResultPill } from "@/components/ui";

type LivePayload = {
  live: LiveMatch[];
  finished: LiveMatch[];
  upcoming: LiveMatch[];
  error?: string;
};

export function LiveScreen() {
  const { picks } = useMatchday();
  const [data, setData] = useState<LivePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/football/live", { cache: "no-store" });
      const payload = (await response.json()) as LivePayload & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load live scores.");
      }
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 40000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="grid gap-3.5">
        {[1, 2].map((key) => (
          <div key={key} className="rounded-[14px] border border-md-line bg-md-paper p-4">
            <div className="md-shimmer h-3 w-1/3 rounded-full" />
            <div className="md-shimmer mx-auto mt-5 h-10 w-40 rounded-xl" />
            <div className="md-shimmer mt-4 h-2 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-[14px] border border-md-danger/20 bg-md-paper p-5">
        <h2 className="font-headline text-[18px] font-semibold">Couldn’t load live scores</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-md-muted">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="mt-4 h-10 rounded-full bg-md-green px-4 text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  const live = data?.live ?? [];
  const finished = data?.finished ?? [];
  const upcoming = data?.upcoming ?? [];

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="md-pulse size-2 rounded-full bg-md-danger" />
        <h2 className="m-0 font-headline text-[15px] font-semibold tracking-[0.07em] uppercase">
          Live now
        </h2>
        {error ? (
          <span className="text-[11px] text-md-muted">Refresh failed · showing last data</span>
        ) : null}
      </div>

      {live.length === 0 ? (
        <div className="mb-6 rounded-[14px] border border-md-line bg-md-paper px-4 py-5 text-[13px] text-md-muted">
          No Premier League matches are live right now.
          {upcoming.length > 0
            ? ` ${upcoming.length} still to kick off today.`
            : finished.length > 0
              ? " Check finished results below."
              : ""}
        </div>
      ) : (
        <div className="grid gap-3.5">
          {live.map((match) => {
            const scored = scorePick(
              picks[match.id],
              match.homeGoals,
              match.awayGoals,
            );
            const pct = Math.min((match.minute / 95) * 100, 100);

            return (
              <article
                key={match.id}
                className="rounded-[14px] border border-md-line bg-md-paper p-4 shadow-[0_1px_2px_rgba(31,41,55,.06)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[11.5px] font-semibold text-md-danger">
                    {match.minute}&apos; {match.statusShort}
                  </span>
                  <span className="flex-1 text-[11.5px] text-md-muted">{match.venue}</span>
                  <ResultPill kind={scored.kind}>{scored.pillText}</ResultPill>
                </div>

                <div className="my-3.5 flex items-center justify-center gap-3.5">
                  <div className="flex flex-1 items-center justify-end gap-2 text-right">
                    <span className="text-sm font-semibold">{match.home.name}</span>
                    <ClubBadge
                      mono={match.home.mono}
                      color={match.home.color}
                      logo={match.home.logo}
                    />
                  </div>
                  <div className="font-headline text-[38px] leading-none font-semibold tracking-[0.02em] tabular-nums">
                    {match.score}
                  </div>
                  <div className="flex flex-1 items-center gap-2">
                    <ClubBadge
                      mono={match.away.mono}
                      color={match.away.color}
                      logo={match.away.logo}
                    />
                    <span className="text-sm font-semibold">{match.away.name}</span>
                  </div>
                </div>

                <div className="text-center text-xs text-md-muted">
                  You said{" "}
                  <strong className="font-headline text-sm font-semibold text-md-ink">
                    {scored.you}
                  </strong>
                  {" · "}
                  {scored.note}
                </div>

                <div className="relative mt-4 h-[26px]">
                  <div className="absolute top-[11px] right-0 left-0 h-1 rounded-full bg-md-mint-soft" />
                  <div
                    className="absolute top-[11px] left-0 h-1 rounded-full bg-[#34D399] transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  {match.events.map((event, index) => {
                    const minuteNum = parseInt(event.min, 10) || 0;
                    return (
                      <span
                        key={`${match.id}-${event.min}-${event.kind}-${index}`}
                        title={`${event.min} ${event.kind} — ${event.teamName}`}
                        className="absolute top-[7px] size-3 border-2 border-md-paper"
                        style={{
                          left: `${(minuteNum / 95) * 100}%`,
                          borderRadius: event.kind === "Goal" ? 99 : 3,
                          background:
                            event.kind === "Goal"
                              ? "#198754"
                              : event.kind === "Red card"
                                ? "#DC2626"
                                : "#F59E0B",
                          transform: "translateX(-6px)",
                        }}
                      />
                    );
                  })}
                  <span
                    className="absolute top-[5px] h-4 w-[3px] rounded-[2px] bg-md-danger transition-[left] duration-500"
                    style={{ left: `${pct}%`, transform: "translateX(-1.5px)" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-md-muted tabular-nums">
                  <span>0&apos;</span>
                  <span>45&apos;</span>
                  <span>90&apos;+</span>
                </div>

                {match.events.length > 0 ? (
                  <ul className="mt-3 grid list-none gap-2 border-t border-md-line pt-[11px]">
                    {[...match.events].reverse().slice(0, 8).map((event, index) => (
                      <li
                        key={`${match.id}-row-${event.min}-${event.kind}-${index}`}
                        className="flex items-center gap-[9px] text-[12.5px]"
                      >
                        <span className="w-[36px] font-headline text-[13px] font-semibold text-md-muted tabular-nums">
                          {event.min}
                        </span>
                        <span
                          className="size-[11px] shrink-0"
                          style={{
                            borderRadius: event.kind === "Goal" ? 99 : 2,
                            background:
                              event.kind === "Goal"
                                ? "#198754"
                                : event.kind === "Red card"
                                  ? "#DC2626"
                                  : "#F59E0B",
                          }}
                        />
                        <span className="font-semibold">{event.kind}</span>
                        <span className="text-md-muted">{event.teamName}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <h2 className="mt-[26px] mb-3 font-headline text-[15px] font-semibold tracking-[0.07em] text-md-muted uppercase">
        Finished
      </h2>
      {finished.length === 0 ? (
        <div className="rounded-[14px] border border-md-line bg-md-paper px-4 py-4 text-[13px] text-md-muted">
          No finished Premier League results to show yet.
        </div>
      ) : (
        <div className="grid gap-2.5">
          {finished.map((match) => {
            const scored = scorePick(
              picks[match.id],
              match.homeGoals,
              match.awayGoals,
            );
            return (
              <article
                key={match.id}
                className="flex items-center gap-3 rounded-[14px] border border-md-line bg-md-paper px-[15px] py-[13px]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <ClubBadge
                      mono={match.home.mono}
                      color={match.home.color}
                      logo={match.home.logo}
                      size={24}
                    />
                    <span className="font-headline text-[19px] font-semibold tabular-nums">
                      {match.score}
                    </span>
                    <ClubBadge
                      mono={match.away.mono}
                      color={match.away.color}
                      logo={match.away.logo}
                      size={24}
                    />
                    <span className="overflow-hidden text-[12.5px] text-ellipsis whitespace-nowrap text-md-muted">
                      {match.home.name} v {match.away.name}
                    </span>
                  </div>
                  <div className="mt-1 text-[11.5px] text-md-muted">
                    FT · You said {scored.you}
                  </div>
                </div>
                <ResultPill kind={scored.kind}>{scored.pillText}</ResultPill>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
