"use client";

import { FormEvent, useState } from "react";
import { InsightsScreen } from "@/components/insights-screen";
import { LiveScreen } from "@/components/live-screen";
import { PicksScreen } from "@/components/picks-screen";
import { NewsScreen } from "@/components/news-screen";
import { PoolsScreen } from "@/components/pools-screen";
import { ChevronLeft, ChevronRight, IconPath, RefreshIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { TAB_ICONS } from "@/lib/data";
import { screenCopy, useMatchday } from "@/lib/store";
import type { TabId } from "@/lib/types";
import { assertNever } from "@/lib/types";

const TABS: { id: TabId; label: string; premium?: boolean }[] = [
  { id: "picks", label: "Picks" },
  { id: "live", label: "Live" },
  { id: "pools", label: "Pools" },
  { id: "news", label: "News" },
  { id: "insights", label: "Insights", premium: true },
];

export function AppHeader() {
  const { tab, gw, prevGw, nextGw, refresh } = useMatchday();
  const { user, signOut } = useAuth();
  const [kicker, title] = screenCopy(tab, gw);
  const showGw = tab === "picks" || tab === "live";

  return (
    <header
      className="sticky top-0 z-20 px-4 pt-[58px] pb-[13px] text-[#f8f8f8] shadow-[0_8px_24px_rgba(15,23,42,.14)] backdrop-blur-md"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,rgba(248,248,248,.06) 0 26px,rgba(248,248,248,0) 26px 52px),linear-gradient(155deg,#1a9d61 0%,#198754 42%,#0f5c38 100%)",
      }}
    >
      <div className="mx-auto flex min-h-[34px] max-w-[760px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold tracking-[0.1em] text-[#f8f8f8]/70 uppercase">
            {kicker}
          </div>
          <h1 className="mt-px font-headline text-[23px] leading-[1.1] font-semibold tracking-[0.015em]">
            {title}
          </h1>
        </div>
        {showGw ? (
          <div className="flex items-center gap-0.5 rounded-full border border-[#f8f8f8]/20 bg-[#f8f8f8]/15 p-0.5">
            <button
              type="button"
              aria-label="Previous gameweek"
              onClick={prevGw}
              className="-my-[5px] grid size-11 place-items-center rounded-full"
            >
              <ChevronLeft />
            </button>
            <span className="px-1 font-headline text-[15px] font-medium tracking-[0.03em] whitespace-nowrap">
              GW {gw}
            </span>
            <button
              type="button"
              aria-label="Next gameweek"
              onClick={nextGw}
              className="-my-[5px] grid size-11 place-items-center rounded-full"
            >
              <ChevronRight />
            </button>
          </div>
        ) : null}
        {tab === "picks" ? (
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh fixtures"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#f8f8f8]/20 bg-[#f8f8f8]/15"
          >
            <RefreshIcon />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          title={user?.name ? `Signed in as ${user.name}` : "Sign out"}
          aria-label="Sign out"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-[#f8f8f8]/20 bg-[#f8f8f8]/15 text-[11px] font-bold tracking-wide lg:hidden"
        >
          {user?.initials ?? "OUT"}
        </button>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { tab, setTab } = useMatchday();

  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-30 flex border-t border-md-line/80 bg-md-paper/95 px-0.5 pt-1.5 pb-[26px] shadow-[0_-8px_24px_rgba(15,23,42,.06)] backdrop-blur-md lg:hidden"
    >
      {TABS.map((item) => {
        const on = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={on ? "page" : undefined}
            className="relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-[3px] pt-1"
            style={{ color: on ? "#198754" : "#6B7280" }}
          >
            <span className="relative grid place-items-center">
              <IconPath d={TAB_ICONS[item.id]} size={22} />
              {item.id === "live" ? (
                <span className="md-pulse absolute -top-0.5 -right-1 size-2 rounded-full border-[1.5px] border-md-paper bg-md-danger" />
              ) : null}
              {item.premium ? (
                <span className="absolute -top-[3px] -right-[7px] grid size-3 place-items-center rounded-full bg-md-mint text-[7.5px] font-bold text-md-green-deep">
                  P
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.01em]">{item.label}</span>
            <span
              className="absolute top-0 h-[3px] rounded-full bg-md-green transition-[width] duration-200"
              style={{ width: on ? 22 : 0 }}
            />
          </button>
        );
      })}
    </nav>
  );
}

export function SideRail() {
  const { tab, setTab } = useMatchday();
  const { user, signOut } = useAuth();

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 hidden h-dvh w-[216px] shrink-0 flex-col gap-1.5 border-r border-md-line bg-md-paper px-3.5 py-[22px] lg:flex"
    >
      <div className="mb-5 flex items-center gap-[9px] px-2">
        <div
          className="grid size-[30px] place-items-center rounded-[9px] font-headline text-base font-bold text-[#f8f8f8]"
          style={{ background: "linear-gradient(160deg,#198754,#146C43)" }}
        >
          M
        </div>
        <span className="font-headline text-[19px] font-semibold tracking-[0.02em]">MATCHDAY</span>
      </div>
      {TABS.map((item) => {
        const on = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={on ? "page" : undefined}
            className="flex min-h-11 w-full items-center gap-[11px] rounded-[11px] px-3 py-2.5 text-left"
            style={{
              background: on ? "#D1FAE5" : "transparent",
              color: on ? "#146C43" : "#6B7280",
            }}
          >
            <IconPath d={TAB_ICONS[item.id]} />
            <span className="text-sm font-semibold">{item.label}</span>
            {item.id === "live" ? (
              <span className="md-pulse size-[7px] rounded-full bg-md-danger" />
            ) : null}
            {item.premium ? (
              <span className="ml-auto rounded-full bg-md-mint px-1.5 py-[3px] text-[9.5px] font-bold tracking-[0.06em] text-md-green-deep">
                PRO
              </span>
            ) : null}
          </button>
        );
      })}
      <div className="mt-auto border-t border-md-line px-2.5 pt-3">
        <div className="flex items-center gap-[9px]">
          <div className="grid size-8 place-items-center rounded-full bg-[#1a1a1a] text-xs font-bold text-[#f8f8f8]">
            {user?.initials ?? "MD"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold">{user?.name ?? "Player"}</div>
            <div className="truncate text-[11px] text-md-muted">{user?.email ?? ""}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="mt-3 h-9 w-full rounded-full border border-md-line text-[12px] font-semibold text-md-muted hover:border-md-green hover:text-md-green-deep"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

export function JoinLeagueModal() {
  const { joinOpen, setJoinOpen, joinLeague } = useMatchday();
  const [name, setName] = useState("");

  if (!joinOpen) return null;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    joinLeague(name);
    setName("");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#1a1a1a]/40 p-4 sm:place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-[18px] border border-md-line bg-md-paper p-5 shadow-xl"
      >
        <h2 className="font-headline text-[19px] font-semibold">Join or create a league</h2>
        <p className="mt-1 mb-4 text-[13px] leading-[1.55] text-md-muted">
          Name a new private league or type one that already exists.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sunday Five, Office League…"
          aria-label="League name"
          className="h-11 w-full rounded-full border border-md-line bg-md-page px-4 text-[13.5px]"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setJoinOpen(false)}
            className="h-11 flex-1 rounded-full border border-md-line text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 flex-1 rounded-full bg-md-green text-sm font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export function ScreenSwitch() {
  const { tab } = useMatchday();

  switch (tab) {
    case "picks":
      return <PicksScreen />;
    case "live":
      return <LiveScreen />;
    case "pools":
      return <PoolsScreen />;
    case "news":
      return <NewsScreen />;
    case "insights":
      return <InsightsScreen />;
    default:
      return assertNever(tab);
  }
}
