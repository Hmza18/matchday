"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";
import { BASE_MESSAGES, BOARD, DEFAULT_LEAGUES } from "@/lib/data";
import { uniqueById } from "@/lib/football/client";
import type { PickFixture } from "@/lib/football/types";
import type { ChatMessage, PersistedState, TabId } from "@/lib/types";
import { assertNever } from "@/lib/types";

const STORAGE_KEY = "matchday-state";

type MatchdayContextValue = {
  tab: TabId;
  setTab: (tab: TabId) => void;
  gw: number;
  setGw: (gw: number) => void;
  prevGw: () => void;
  nextGw: () => void;
  now: number;
  loading: boolean;
  fixturesError: string | null;
  fixtures: PickFixture[];
  refresh: () => void;
  picks: Record<string, [number, number]>;
  pickFor: (id: string, fallback: [number, number]) => [number, number];
  bump: (id: string, side: 0 | 1, delta: number, locked: boolean) => void;
  pop: string | null;
  saved: string | null;
  pickSaveError: string | null;
  league: string;
  setLeague: (name: string) => void;
  leagues: string[];
  joinOpen: boolean;
  setJoinOpen: (open: boolean) => void;
  joinLeague: (name: string) => void;
  draft: string;
  setDraft: (value: string) => void;
  send: (event: FormEvent) => void;
  extraMsgs: ChatMessage[];
  messages: ChatMessage[];
  reacted: Record<number, boolean>;
  toggleReact: (index: number) => void;
  premiumUnlocked: boolean;
  unlockPremium: () => void;
};

const MatchdayContext = createContext<MatchdayContextValue | null>(null);

function loadPersisted(): Omit<PersistedState, "picks"> & { picks?: PersistedState["picks"] } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function savePersisted(payload: Omit<PersistedState, "picks">) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

async function fetchPicks(gw?: number) {
  const query = gw && gw > 0 ? `?gw=${encodeURIComponent(String(gw))}` : "";
  const response = await fetch(`/api/picks${query}`, { cache: "no-store" });
  const payload = (await response.json()) as {
    error?: string;
    picks?: Record<string, [number, number]>;
  };

  if (!response.ok) {
    throw new Error(payload.error || "Failed to load picks.");
  }

  return payload.picks ?? {};
}

async function savePick(
  fixtureId: string,
  homeScore: number,
  awayScore: number,
  gameweek: number,
) {
  const response = await fetch("/api/picks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fixtureId,
      homeScore,
      awayScore,
      gameweek,
    }),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Failed to save pick.");
  }
}

export function MatchdayProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("picks");
  const [gw, setGw] = useState(1);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(true);
  const [fixturesError, setFixturesError] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<PickFixture[]>([]);
  const [picks, setPicks] = useState<Record<string, [number, number]>>({});
  const [pop, setPop] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pickSaveError, setPickSaveError] = useState<string | null>(null);
  const [league, setLeague] = useState("Office League");
  const [extraLeagues, setExtraLeagues] = useState<string[]>([]);
  const [joinOpen, setJoinOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [extraMsgs, setExtraMsgs] = useState<ChatMessage[]>([]);
  const [reacted, setReacted] = useState<Record<number, boolean>>({});
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const hydrated = useRef(false);
  const migrated = useRef(false);
  const popTimer = useRef<number | undefined>(undefined);
  const savedTimer = useRef<number | undefined>(undefined);
  const saveErrorTimer = useRef<number | undefined>(undefined);
  const saveTimers = useRef<Record<string, number>>({});
  const fixturesRef = useRef<PickFixture[]>([]);
  const gwRef = useRef(gw);
  const legacyPicksRef = useRef<Record<string, [number, number]>>({});

  useEffect(() => {
    gwRef.current = gw;
  }, [gw]);

  const loadFixtures = useCallback(async (roundGw?: number) => {
    setLoading(true);
    setFixturesError(null);
    try {
      const query =
        roundGw && roundGw > 0
          ? `?round=${encodeURIComponent(String(roundGw))}`
          : "";
      const response = await fetch(`/api/football/fixtures${query}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        error?: string;
        gw?: number;
        fixtures?: PickFixture[];
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load fixtures.");
      }

      const nextFixtures = uniqueById(payload.fixtures ?? []);
      fixturesRef.current = nextFixtures;
      setFixtures(nextFixtures);
      if (payload.gw) setGw(payload.gw);
    } catch (error) {
      fixturesRef.current = [];
      setFixtures([]);
      setFixturesError(
        error instanceof Error ? error.message : "Failed to load fixtures.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPicks = useCallback(async () => {
    if (!user) {
      setPicks({});
      return;
    }

    try {
      const remotePicks = await fetchPicks();
      const legacy = legacyPicksRef.current;
      const legacyIds = Object.keys(legacy);

      if (!migrated.current && legacyIds.length > 0 && Object.keys(remotePicks).length === 0) {
        migrated.current = true;
        for (const fixtureId of legacyIds) {
          const scores = legacy[fixtureId];
          if (!scores) continue;
          try {
            await savePick(fixtureId, scores[0], scores[1], gwRef.current);
          } catch {
            // Skip fixtures that are locked or unknown during migration.
          }
        }
        legacyPicksRef.current = {};
        savePersisted({
          league,
          extraLeagues,
          extraMsgs,
          premiumUnlocked,
        });
        const migratedPicks = await fetchPicks();
        setPicks(migratedPicks);
        return;
      }

      migrated.current = true;
      setPicks(remotePicks);
    } catch (error) {
      setPickSaveError(
        error instanceof Error ? error.message : "Failed to load picks.",
      );
    }
  }, [user, league, extraLeagues, extraMsgs, premiumUnlocked]);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) {
      legacyPicksRef.current = persisted.picks ?? {};
      setLeague(persisted.league ?? "Office League");
      setExtraLeagues(persisted.extraLeagues ?? []);
      setExtraMsgs(persisted.extraMsgs ?? []);
      setPremiumUnlocked(Boolean(persisted.premiumUnlocked));
    }
    hydrated.current = true;
    void loadFixtures();
    const tick = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => {
      window.clearInterval(tick);
    };
  }, [loadFixtures]);

  useEffect(() => {
    if (!hydrated.current || !user) return;
    void loadPicks();
  }, [user, loadPicks]);

  useEffect(() => {
    if (!hydrated.current) return;
    savePersisted({
      league,
      extraLeagues,
      extraMsgs,
      premiumUnlocked,
    });
  }, [league, extraLeagues, extraMsgs, premiumUnlocked]);

  const refresh = useCallback(() => {
    void loadFixtures(gw);
    void loadPicks();
  }, [gw, loadFixtures, loadPicks]);

  const prevGw = useCallback(() => {
    const next = Math.max(1, gw - 1);
    setGw(next);
    void loadFixtures(next);
  }, [gw, loadFixtures]);

  const nextGw = useCallback(() => {
    const next = Math.min(38, gw + 1);
    setGw(next);
    void loadFixtures(next);
  }, [gw, loadFixtures]);

  const pickFor = useCallback(
    (id: string, fallback: [number, number]) => picks[id] ?? fallback,
    [picks],
  );

  const queueSave = useCallback((fixtureId: string, scores: [number, number]) => {
    window.clearTimeout(saveTimers.current[fixtureId]);
    saveTimers.current[fixtureId] = window.setTimeout(() => {
      void savePick(fixtureId, scores[0], scores[1], gwRef.current)
        .then(() => {
          setPickSaveError(null);
          setSaved(fixtureId);
          window.clearTimeout(savedTimer.current);
          savedTimer.current = window.setTimeout(() => setSaved(null), 1900);
        })
        .catch((error) => {
          const message =
            error instanceof Error ? error.message : "Failed to save pick.";
          setPickSaveError(message);
          window.clearTimeout(saveErrorTimer.current);
          saveErrorTimer.current = window.setTimeout(
            () => setPickSaveError(null),
            3200,
          );
        });
    }, 300);
  }, []);

  const bump = useCallback(
    (id: string, side: 0 | 1, delta: number, locked: boolean) => {
      if (locked) return;
      const fixture = fixturesRef.current.find((f) => f.id === id);
      if (!fixture) return;
      const current = (picks[id] ?? fixture.def).slice() as [number, number];
      const next = Math.max(0, Math.min(9, current[side] + delta));
      if (next === current[side]) return;
      current[side] = next;
      setPicks((prev) => ({ ...prev, [id]: current }));
      setPop(id + String(side));
      window.clearTimeout(popTimer.current);
      popTimer.current = window.setTimeout(() => setPop(null), 190);
      queueSave(id, current);
    },
    [picks, queueSave],
  );

  const joinLeague = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLeague(trimmed);
    setExtraLeagues((prev) =>
      DEFAULT_LEAGUES.includes(trimmed as (typeof DEFAULT_LEAGUES)[number]) ||
      prev.includes(trimmed)
        ? prev
        : [...prev, trimmed],
    );
    setJoinOpen(false);
  }, []);

  const send = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const value = draft.trim();
      if (!value || !user) return;
      const d = new Date();
      const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setExtraMsgs((prev) => [
        ...prev,
        {
          i: user.initials || initialsFromName(user.name),
          n: user.name,
          t: time,
          x: value,
          me: true,
        },
      ]);
      setDraft("");
    },
    [draft, user],
  );

  const toggleReact = useCallback((index: number) => {
    setReacted((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const leagues = useMemo(
    () => [...DEFAULT_LEAGUES, ...extraLeagues],
    [extraLeagues],
  );

  const messages = useMemo(
    () => [...BASE_MESSAGES, ...extraMsgs],
    [extraMsgs],
  );

  const value = useMemo<MatchdayContextValue>(
    () => ({
      tab,
      setTab,
      gw,
      setGw,
      prevGw,
      nextGw,
      now,
      loading,
      fixturesError,
      fixtures,
      refresh,
      picks,
      pickFor,
      bump,
      pop,
      saved,
      pickSaveError,
      league,
      setLeague,
      leagues,
      joinOpen,
      setJoinOpen,
      joinLeague,
      draft,
      setDraft,
      send,
      extraMsgs,
      messages,
      reacted,
      toggleReact,
      premiumUnlocked,
      unlockPremium: () => setPremiumUnlocked(true),
    }),
    [
      tab,
      gw,
      prevGw,
      nextGw,
      now,
      loading,
      fixturesError,
      fixtures,
      refresh,
      picks,
      pickFor,
      bump,
      pop,
      saved,
      pickSaveError,
      league,
      leagues,
      joinOpen,
      joinLeague,
      draft,
      send,
      extraMsgs,
      messages,
      reacted,
      toggleReact,
      premiumUnlocked,
    ],
  );

  return (
    <MatchdayContext.Provider value={value}>{children}</MatchdayContext.Provider>
  );
}

export function useMatchday() {
  const ctx = useContext(MatchdayContext);
  if (!ctx) throw new Error("useMatchday must be used inside MatchdayProvider");
  return ctx;
}

export function screenCopy(tab: TabId, gw: number): [string, string] {
  switch (tab) {
    case "picks":
      return [`Premier League · GW${gw}`, "Your picks"];
    case "live":
      return ["Premier League", "Live centre"];
    case "pools":
      return ["4 leagues", "Pools"];
    case "news":
      return ["Sports Illustrated", "News"];
    case "insights":
      return ["Model & form data", "Insights"];
    default: {
      return assertNever(tab);
    }
  }
}

export function boardFor(league: string) {
  return BOARD[league] ?? [
    {
      r: 1,
      n: "Sam Boyd (you)",
      i: "SB",
      tot: 141,
      d: 0,
      mv: 0,
      sub: "Founder of this league",
      me: true,
    },
  ];
}
