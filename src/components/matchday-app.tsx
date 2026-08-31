"use client";

import {
  AppHeader,
  BottomNav,
  JoinLeagueModal,
  ScreenSwitch,
  SideRail,
} from "@/components/app-chrome";
import { MatchdayProvider } from "@/lib/store";

function AppShell() {
  return (
    <div className="flex min-h-dvh justify-center bg-md-canvas lg:items-stretch">
      <div className="flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-md-page text-md-ink shadow-[0_24px_60px_rgba(31,41,55,.12)] lg:max-w-5xl lg:flex-row lg:shadow-none">
        <SideRail />
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-[760px] flex-1 px-3.5 pt-4 pb-[26px] lg:px-[26px] lg:pt-[22px] lg:pb-10">
            <ScreenSwitch />
          </main>
          <BottomNav />
        </div>
      </div>
      <JoinLeagueModal />
    </div>
  );
}

export function MatchdayApp() {
  return (
    <MatchdayProvider>
      <AppShell />
    </MatchdayProvider>
  );
}
