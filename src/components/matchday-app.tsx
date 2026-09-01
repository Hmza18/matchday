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
      <div className="flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-md-page text-md-ink shadow-[0_28px_70px_rgba(15,23,42,.14)] ring-1 ring-md-line/60 lg:max-w-5xl lg:flex-row lg:shadow-none lg:ring-0">
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
