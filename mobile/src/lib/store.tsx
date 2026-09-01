import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/src/lib/auth";
import { loadFixturesForGw } from "@/src/lib/football/fixtures";
import { loadSeasonResults, type FinishedResult } from "@/src/lib/football/results";
import {
  createLeagueRemote,
  fetchLeagueBoard,
  fetchLeagueMessages,
  fetchUserLeagues,
  joinGlobalLeagueRemote,
  joinLeagueRemote,
  mapIncomingMessage,
  computePlayerStats,
} from "@/src/lib/leagues";
import { createSupabaseClient } from "@/src/lib/supabase/client";
import type { PickFixture } from "@/src/lib/football/types";
import type {
  BoardRow,
  ChatMessage,
  League,
  PersistedState,
  PlayerStats,
  TabId,
} from "@/src/lib/types";
import { assertNever } from "@/src/lib/types";

const STORAGE_KEY = "matchday-state";

type MatchdayContextValue = {
  gw: number;
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
  leagues: League[];
  activeLeague: League | null;
  setActiveLeagueId: (id: string) => void;
  board: BoardRow[];
  boardLoading: boolean;
  leagueError: string | null;
  joinOpen: boolean;
  setJoinOpen: (open: boolean) => void;
  createLeague: (name: string) => Promise<void>;
  joinLeagueByCode: (code: string) => Promise<void>;
  draft: string;
  setDraft: (value: string) => void;
  send: () => void;
  messages: ChatMessage[];
  playerStats: PlayerStats;
  premiumUnlocked: boolean;
  unlockPremium: () => void;
};

const MatchdayContext = createContext<MatchdayContextValue | null>(null);

export function MatchdayProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [gw, setGw] = useState(1);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(true);
  const [fixturesError, setFixturesError] = useState<string | null>(null);
  const [fixtures, setFixtures] = useState<PickFixture[]>([]);
  const [picks, setPicks] = useState<Record<string, [number, number]>>({});
  const [pop, setPop] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pickSaveError, setPickSaveError] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [leagueError, setLeagueError] = useState<string | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seasonResults, setSeasonResults] = useState<FinishedResult[]>([]);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const hydrated = useRef(false);
  const migrated = useRef(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveErrorTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const fixturesRef = useRef<PickFixture[]>([]);
  const gwRef = useRef(gw);
  const legacyPicksRef = useRef<Record<string, [number, number]>>({});
  const persistedLeagueId = useRef<string | null>(null);
  const resultsRef = useRef<FinishedResult[]>([]);
  const chatChannel = useRef<RealtimeChannel | null>(null);
  const ensuringLeague = useRef(false);

  useEffect(() => {
    gwRef.current = gw;
  }, [gw]);

  const activeLeague = useMemo(
    () => leagues.find((league) => league.id === activeLeagueId) ?? leagues[0] ?? null,
    [leagues, activeLeagueId],
  );

  const loadFixtures = useCallback(async (roundGw?: number) => {
    setLoading(true);
    setFixturesError(null);
    try {
      const payload = await loadFixturesForGw(roundGw);
      fixturesRef.current = payload.fixtures;
      setFixtures(payload.fixtures);
      setGw(payload.gw);
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

  const fetchRemotePicks = useCallback(async () => {
    if (!user) return {} as Record<string, [number, number]>;
    const { data, error } = await supabase
      .from("picks")
      .select("fixture_id, home_score, away_score")
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    const mapped: Record<string, [number, number]> = {};
    for (const row of data ?? []) {
      mapped[row.fixture_id] = [row.home_score, row.away_score];
    }
    return mapped;
  }, [supabase, user]);

  const savePickRemote = useCallback(
    async (fixtureId: string, homeScore: number, awayScore: number, gameweek: number) => {
      if (!user) return;
      const { error } = await supabase.from("picks").upsert(
        {
          user_id: user.id,
          fixture_id: fixtureId,
          home_score: homeScore,
          away_score: awayScore,
          gameweek,
        },
        { onConflict: "user_id,fixture_id" },
      );
      if (error) throw new Error(error.message);
    },
    [supabase, user],
  );

  const loadPicks = useCallback(async () => {
    // Signed out: the locally cached picks stay on screen. They are pushed up
    // on the next sign-in by the migration branch below.
    if (!user) return;

    try {
      const remotePicks = await fetchRemotePicks();
      const legacy = legacyPicksRef.current;
      const legacyIds = Object.keys(legacy);

      if (!migrated.current && legacyIds.length > 0 && Object.keys(remotePicks).length === 0) {
        migrated.current = true;
        for (const fixtureId of legacyIds) {
          const scores = legacy[fixtureId];
          if (!scores) continue;
          try {
            await savePickRemote(fixtureId, scores[0], scores[1], gwRef.current);
          } catch {
            // skip locked fixtures during migration
          }
        }
        legacyPicksRef.current = {};
        setPicks(await fetchRemotePicks());
        return;
      }

      migrated.current = true;
      setPicks(remotePicks);
    } catch (error) {
      setPickSaveError(
        error instanceof Error ? error.message : "Failed to load picks.",
      );
    }
  }, [user, fetchRemotePicks, savePickRemote]);

  const ensureProfile = useCallback(async () => {
    if (!user) return;
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: user.name,
        initials: user.initials,
      },
      { onConflict: "id" },
    );
  }, [supabase, user]);

  const loadLeagues = useCallback(async () => {
    if (!user) {
      setLeagues([]);
      setActiveLeagueId(null);
      return;
    }

    if (ensuringLeague.current) return;
    ensuringLeague.current = true;
    try {
      await ensureProfile();
      let next = await fetchUserLeagues(supabase, user.id);
      if (!next.some((league) => league.isPublic)) {
        const globalLeague = await joinGlobalLeagueRemote(supabase);
        next = [globalLeague, ...next.filter((league) => league.id !== globalLeague.id)];
      }
      setLeagues(next);
      const preferred =
        persistedLeagueId.current && next.some((league) => league.id === persistedLeagueId.current)
          ? persistedLeagueId.current
          : next.find((league) => league.isPublic)?.id ?? next[0]!.id;
      setActiveLeagueId(preferred);
      setLeagueError(null);
    } catch (error) {
      setLeagueError(error instanceof Error ? error.message : "Failed to load leagues.");
    } finally {
      ensuringLeague.current = false;
    }
  }, [ensureProfile, supabase, user]);

  const loadBoardAndChat = useCallback(
    async (league: League | null) => {
      if (!user || !league) {
        setBoard([]);
        setMessages([]);
        return;
      }

      setBoardLoading(true);
      try {
        if (resultsRef.current.length === 0) {
          const season = await loadSeasonResults();
          resultsRef.current = season.results;
          setSeasonResults(season.results);
        }
        const [nextBoard, nextMessages] = await Promise.all([
          fetchLeagueBoard(supabase, league, user.id, gwRef.current, resultsRef.current),
          fetchLeagueMessages(supabase, league.id, user.id),
        ]);
        setBoard(nextBoard);
        setMessages(nextMessages);
        setLeagueError(null);
      } catch (error) {
        setLeagueError(error instanceof Error ? error.message : "Failed to load league.");
      } finally {
        setBoardLoading(false);
      }
    },
    [supabase, user],
  );

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const persisted = JSON.parse(raw) as PersistedState;
          legacyPicksRef.current = persisted.picks ?? {};
          if (persisted.picks) setPicks(persisted.picks);
          persistedLeagueId.current = persisted.activeLeagueId ?? null;
          setPremiumUnlocked(Boolean(persisted.premiumUnlocked));
        } catch {
          // ignore corrupt cache
        }
      })
      .finally(() => {
        hydrated.current = true;
      });
    void loadFixtures();
    const tick = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [loadFixtures]);

  useEffect(() => {
    if (!hydrated.current || !user) return;
    void loadPicks();
    void loadLeagues();
  }, [user, loadPicks, loadLeagues]);

  useEffect(() => {
    if (!hydrated.current) return;
    // Autosave locally on every change so a pick survives a force-quit,
    // a dropped connection, or being made before sign-in.
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        picks,
        activeLeagueId: activeLeague?.id ?? undefined,
        premiumUnlocked,
      } satisfies PersistedState),
    );
  }, [picks, activeLeague, premiumUnlocked]);

  useEffect(() => {
    void loadBoardAndChat(activeLeague);
  }, [activeLeague, loadBoardAndChat]);

  useEffect(() => {
    if (chatChannel.current) {
      void supabase.removeChannel(chatChannel.current);
      chatChannel.current = null;
    }
    if (!user || !activeLeague) return;

    const channel = supabase
      .channel(`league-chat-${activeLeague.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "league_messages",
          filter: `league_id=eq.${activeLeague.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            body: string;
            created_at: string;
          };
          void (async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, initials")
              .eq("id", row.user_id)
              .maybeSingle();
            setMessages((prev) => {
              if (prev.some((message) => message.id === row.id)) return prev;
              return [...prev, mapIncomingMessage(row, user.id, profile)];
            });
          })();
        },
      )
      .subscribe();

    chatChannel.current = channel;
    return () => {
      void supabase.removeChannel(channel);
      if (chatChannel.current === channel) chatChannel.current = null;
    };
  }, [activeLeague, supabase, user]);

  const refresh = useCallback(() => {
    resultsRef.current = [];
    setSeasonResults([]);
    void loadFixtures(gw);
    void loadPicks();
    void loadLeagues();
  }, [gw, loadFixtures, loadPicks, loadLeagues]);

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

  const queueSave = useCallback(
    (fixtureId: string, scores: [number, number]) => {
      clearTimeout(saveTimers.current[fixtureId]);
      saveTimers.current[fixtureId] = setTimeout(() => {
        void savePickRemote(fixtureId, scores[0], scores[1], gwRef.current)
          .then(() => {
            setPickSaveError(null);
            setSaved(fixtureId);
            clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(null), 1900);
          })
          .catch((error) => {
            const message =
              error instanceof Error ? error.message : "Failed to save pick.";
            setPickSaveError(message);
            clearTimeout(saveErrorTimer.current);
            saveErrorTimer.current = setTimeout(() => setPickSaveError(null), 3200);
          });
      }, 300);
    },
    [savePickRemote],
  );

  const bump = useCallback(
    (id: string, side: 0 | 1, delta: number, locked: boolean) => {
      if (locked) return;
      const fixture = fixturesRef.current.find((item) => item.id === id);
      if (!fixture) return;
      const current = (picks[id] ?? fixture.def).slice() as [number, number];
      const next = Math.max(0, Math.min(9, current[side] + delta));
      if (next === current[side]) return;
      current[side] = next;
      setPicks((prev) => ({ ...prev, [id]: current }));
      setPop(id + String(side));
      clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => setPop(null), 190);
      queueSave(id, current);
    },
    [picks, queueSave],
  );

  const createLeague = useCallback(
    async (name: string) => {
      const created = await createLeagueRemote(supabase, name);
      setLeagues((prev) =>
        prev.some((league) => league.id === created.id) ? prev : [...prev, created],
      );
      setActiveLeagueId(created.id);
      setJoinOpen(false);
    },
    [supabase],
  );

  const joinLeagueByCode = useCallback(
    async (code: string) => {
      const joined = await joinLeagueRemote(supabase, code);
      setLeagues((prev) =>
        prev.some((league) => league.id === joined.id) ? prev : [...prev, joined],
      );
      setActiveLeagueId(joined.id);
      setJoinOpen(false);
    },
    [supabase],
  );

  const send = useCallback(() => {
    const value = draft.trim();
    if (!value || !user || !activeLeague) return;
    setDraft("");
    void (async () => {
      const { data, error } = await supabase
        .from("league_messages")
        .insert({
          league_id: activeLeague.id,
          user_id: user.id,
          body: value,
        })
        .select("id, user_id, body, created_at")
        .single();
      if (error) {
        setLeagueError(error.message);
        setDraft(value);
        return;
      }
      if (!data) return;
      setMessages((prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        return [
          ...prev,
          mapIncomingMessage(data, user.id, {
            full_name: user.name,
            initials: user.initials,
          }),
        ];
      });
    })();
  }, [activeLeague, draft, supabase, user]);

  const playerStats = useMemo(
    () => computePlayerStats(picks, seasonResults, gw),
    [picks, seasonResults, gw],
  );

  const value = useMemo<MatchdayContextValue>(
    () => ({
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
      leagues,
      activeLeague,
      setActiveLeagueId,
      board,
      boardLoading,
      leagueError,
      joinOpen,
      setJoinOpen,
      createLeague,
      joinLeagueByCode,
      draft,
      setDraft,
      send,
      messages,
      playerStats,
      premiumUnlocked,
      unlockPremium: () => setPremiumUnlocked(true),
    }),
    [
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
      leagues,
      activeLeague,
      board,
      boardLoading,
      leagueError,
      joinOpen,
      createLeague,
      joinLeagueByCode,
      draft,
      send,
      messages,
      playerStats,
      premiumUnlocked,
      premiumUnlocked,
    ],
  );

  return <MatchdayContext.Provider value={value}>{children}</MatchdayContext.Provider>;
}

export function useMatchday() {
  const ctx = useContext(MatchdayContext);
  if (!ctx) throw new Error("useMatchday must be used inside MatchdayProvider");
  return ctx;
}

export function screenCopy(tab: TabId, gw: number, leagueCount = 0): [string, string] {
  switch (tab) {
    case "picks":
      return [`Premier League · GW${gw}`, "Your picks"];
    case "live":
      return ["Premier League", "Live centre"];
    case "pools":
      return [leagueCount === 1 ? "1 league" : `${leagueCount} leagues`, "Pools"];
    case "insights":
      return ["Model & form data", "Insights"];
    case "settings":
      return ["Account & leagues", "You"];
    default:
      return assertNever(tab);
  }
}
