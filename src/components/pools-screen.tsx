"use client";

import { leagueMeta } from "@/lib/data";
import { boardFor, useMatchday } from "@/lib/store";
import { ChatIcon, SendIcon, TrophyIcon } from "@/components/icons";

export function PoolsScreen() {
  const {
    league,
    setLeague,
    leagues,
    setJoinOpen,
    messages,
    draft,
    setDraft,
    send,
    reacted,
    toggleReact,
  } = useMatchday();

  const empty = league === "Sunday Five";
  const rows = boardFor(league);

  return (
    <div>
      <div className="md-scroll -mx-0.5 mb-0 flex gap-2 overflow-x-auto px-0.5 pt-0.5 pb-3.5">
        {leagues.map((name) => {
          const on = league === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setLeague(name)}
              className="h-9 shrink-0 rounded-full px-[15px] text-[13px] font-semibold whitespace-nowrap"
              style={{
                border: `1px solid ${on ? "#198754" : "#E5E7EB"}`,
                background: on ? "#198754" : "#f8f8f8",
                color: on ? "#f8f8f8" : "#1F2937",
              }}
            >
              {name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setJoinOpen(true)}
          className="h-9 shrink-0 rounded-full border border-dashed border-md-green bg-md-paper px-3.5 text-[13px] font-semibold whitespace-nowrap text-md-green-deep"
        >
          + Join or create
        </button>
      </div>

      {empty ? (
        <div className="rounded-[14px] border border-md-line bg-md-paper px-[22px] py-[34px] text-center">
          <div className="mx-auto mb-3.5 grid size-[46px] place-items-center rounded-full bg-md-mint text-md-green-deep">
            <TrophyIcon />
          </div>
          <h2 className="mb-1.5 font-headline text-[19px] font-semibold">You&apos;re not in a league yet</h2>
          <p className="mb-4 text-[13px] leading-[1.55] text-md-muted">
            Sunday Five has no members. Invite the group or jump into a league someone already set up.
          </p>
          <button
            type="button"
            onClick={() => setJoinOpen(true)}
            className="h-11 rounded-full bg-md-green px-5 text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
          >
            Create or join a league
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[14px] border border-md-line bg-md-paper shadow-[0_1px_2px_rgba(31,41,55,.06)]">
            <div className="flex items-center gap-2 border-b border-md-line px-4 py-3.5">
              <TrophyIcon />
              <h2 className="flex-1 font-headline text-base font-semibold tracking-[0.03em]">{league}</h2>
              <span className="text-[11.5px] text-md-muted">{leagueMeta(league)}</span>
            </div>
            <div className="flex gap-2.5 border-b border-md-line bg-md-page px-4 py-2 text-[10.5px] font-semibold tracking-[0.06em] text-md-muted uppercase">
              <span className="w-[52px]">Rank</span>
              <span className="flex-1">Player</span>
              <span className="w-11 text-right">GW7</span>
              <span className="w-12 text-right">Total</span>
            </div>
            {rows.map((row) => (
              <div
                key={`${row.r}-${row.n}`}
                className="flex items-center gap-2.5 border-b border-[#F1F3F2] px-4 py-[11px] last:border-b-0"
                style={{ background: row.me ? "#D1FAE5" : "#f8f8f8" }}
              >
                <div className="flex w-[52px] items-center gap-[5px]">
                  <span className="font-headline text-base font-semibold tabular-nums">{row.r}</span>
                  <span
                    className="text-[10.5px] font-bold"
                    style={{ color: row.mv > 0 ? "#146C43" : row.mv < 0 ? "#DC2626" : "#6B7280" }}
                  >
                    {row.mv > 0 ? `▲${row.mv}` : row.mv < 0 ? `▼${Math.abs(row.mv)}` : "–"}
                  </span>
                </div>
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[11.5px] font-bold"
                  style={{
                    background: row.me ? "#198754" : "#EEF2F1",
                    color: row.me ? "#f8f8f8" : "#1F2937",
                  }}
                >
                  {row.i}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap">
                    {row.n}
                  </div>
                  <div className="text-[11px] text-md-muted">{row.sub}</div>
                </div>
                <span
                  className="w-11 text-right font-headline text-sm font-semibold tabular-nums"
                  style={{ color: row.d > 0 ? "#146C43" : "#6B7280" }}
                >
                  +{row.d}
                </span>
                <span className="w-12 text-right font-headline text-[18px] font-semibold tabular-nums">
                  {row.tot}
                </span>
              </div>
            ))}
          </div>

          <section className="mt-4 overflow-hidden rounded-[14px] border border-md-line bg-md-paper">
            <div className="flex items-center gap-[7px] border-b border-md-line px-[15px] py-[11px] text-md-muted">
              <ChatIcon />
              <h3 className="flex-1 text-xs font-semibold tracking-[0.06em] uppercase">Banter</h3>
              <span className="text-[11px]">{messages.length} messages</span>
            </div>
            <div className="grid max-h-[290px] gap-[13px] overflow-y-auto px-[15px] py-[13px]">
              {messages.map((message, index) => {
                const bumped = Boolean(reacted[index]);
                const reaction = message.rx
                  ? bumped
                    ? `${message.rx.split(" ")[0]} ${Number(message.rx.split(" ")[1]) + 1}`
                    : message.rx
                  : "";
                return (
                  <div key={`${message.t}-${message.n}-${index}`} className="flex items-start gap-[9px]">
                    <span
                      className="grid size-[26px] shrink-0 place-items-center rounded-full text-[10px] font-bold"
                      style={{
                        background: message.me ? "#198754" : "#EEF2F1",
                        color: message.me ? "#f8f8f8" : "#6B7280",
                      }}
                    >
                      {message.i}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-[7px]">
                        <span className="text-[12.5px] font-semibold">{message.n}</span>
                        <span className="text-[10.5px] text-md-muted">{message.t}</span>
                      </div>
                      <div
                        className="mt-[3px] rounded-[11px] border border-md-line px-[11px] py-2 text-[12.5px] leading-[1.5] text-md-ink"
                        style={{ background: message.me ? "#D1FAE5" : "#F5FAF8" }}
                      >
                        {message.x}
                      </div>
                      {message.rx ? (
                        <button
                          type="button"
                          onClick={() => toggleReact(index)}
                          className="mt-[5px] h-[26px] rounded-full px-[9px] text-[11px] font-semibold"
                          style={{
                            background: bumped ? "#D1FAE5" : "#f8f8f8",
                            border: `1px solid ${bumped ? "#34D399" : "#E5E7EB"}`,
                          }}
                        >
                          {reaction}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-md-line bg-md-page px-3 py-2.5">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Say something regrettable…"
                aria-label="Message the league"
                className="h-11 min-w-0 flex-1 rounded-full border border-md-line bg-md-paper px-3.5 text-[13.5px] text-md-ink"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-md-green text-[#f8f8f8] hover:bg-md-green-deep"
              >
                <SendIcon />
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
