import type { SupabaseClient } from "@supabase/supabase-js";
import {
  leagueChatPageQuery,
  transcriptChronological,
} from "@/src/lib/chat-page";
import { pickPoints, scorePick } from "@/src/lib/football/map";
import type { FinishedResult } from "@/src/lib/football/results";
import type { BoardRow, ChatMessage, League, PlayerStats } from "@/src/lib/types";

type LeagueRow = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  is_public?: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  initials: string | null;
  avatar_url?: string | null;
};

function mapLeague(row: LeagueRow): League {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    isPublic: Boolean(row.is_public),
  };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function formatClock(iso: string) {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export async function fetchUserLeagues(supabase: SupabaseClient, userId: string) {
  const { data: memberships, error: memberError } = await supabase
    .from("league_members")
    .select("league_id")
    .eq("user_id", userId);

  if (memberError) throw new Error(memberError.message);

  const ids = (memberships ?? []).map((row) => row.league_id as string);
  if (ids.length === 0) return [] as League[];

  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, invite_code, owner_id, created_at, is_public")
    .in("id", ids)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapLeague(row as LeagueRow))
    .sort((a, b) => Number(b.isPublic) - Number(a.isPublic) || a.name.localeCompare(b.name));
}

export async function createLeagueRemote(supabase: SupabaseClient, name: string) {
  const { data, error } = await supabase.rpc("create_league", { p_name: name });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not create league.");
  return mapLeague(row as LeagueRow);
}

export async function joinLeagueRemote(supabase: SupabaseClient, code: string) {
  const { data, error } = await supabase.rpc("join_league", { p_code: code });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not join league.");
  return mapLeague(row as LeagueRow);
}

export async function joinGlobalLeagueRemote(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc("join_global_league");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Could not join the public league.");
  return mapLeague(row as LeagueRow);
}

export async function fetchLeagueBoard(
  supabase: SupabaseClient,
  league: League,
  currentUserId: string,
  currentGw: number,
  results: FinishedResult[],
): Promise<BoardRow[]> {
  const { data: members, error: memberError } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", league.id);

  if (memberError) throw new Error(memberError.message);

  const memberIds = [...new Set((members ?? []).map((row) => row.user_id as string))];
  if (memberIds.length === 0) return [];

  const [{ data: profiles, error: profileError }, { data: pickRows, error: pickError }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, initials, avatar_url").in("id", memberIds),
      supabase
        .from("picks")
        .select("user_id, fixture_id, home_score, away_score")
        .in("user_id", memberIds),
    ]);

  if (profileError) throw new Error(profileError.message);
  if (pickError) throw new Error(pickError.message);

  const profileMap = new Map<string, ProfileRow>();
  for (const profile of (profiles ?? []) as ProfileRow[]) {
    profileMap.set(profile.id, profile);
  }

  const picksByUser = new Map<string, Record<string, [number, number]>>();
  for (const row of pickRows ?? []) {
    const userId = row.user_id as string;
    const current = picksByUser.get(userId) ?? {};
    current[row.fixture_id as string] = [row.home_score as number, row.away_score as number];
    picksByUser.set(userId, current);
  }

  const scored = memberIds.map((userId) => {
    const profile = profileMap.get(userId);
    const name = profile?.full_name?.trim() || "Player";
    const initials = profile?.initials || initialsFromName(name);
    const picks = picksByUser.get(userId) ?? {};
    let tot = 0;
    let gwPts = 0;
    let exacts = 0;

    for (const result of results) {
      const scoredPick = scorePick(picks[result.id], result.homeGoals, result.awayGoals);
      const points = pickPoints(scoredPick.kind);
      tot += points;
      if (result.gameweek === currentGw) gwPts += points;
      if (scoredPick.kind === "exact") exacts += 1;
    }

    return {
      userId,
      n: userId === currentUserId ? `${name} (you)` : name,
      i: initials,
      avatarUrl: profile?.avatar_url ?? null,
      tot,
      d: gwPts,
      mv: 0,
      sub: league.isPublic
        ? exacts > 0
          ? `${exacts} exact this season`
          : "On the public table"
        : userId === league.ownerId
          ? exacts > 0
            ? `Owner · ${exacts} exact`
            : "League owner"
          : exacts > 0
            ? `${exacts} exact this season`
            : "No exacts yet",
      me: userId === currentUserId,
    };
  });

  scored.sort((a, b) => b.tot - a.tot || b.d - a.d || a.n.localeCompare(b.n));

  return scored.map((row, index) => ({
    ...row,
    r: index + 1,
  }));
}

export async function fetchLeagueMessages(
  supabase: SupabaseClient,
  leagueId: string,
  currentUserId: string,
): Promise<ChatMessage[]> {
  const chatPage = leagueChatPageQuery();
  const { data, error } = await supabase
    .from("league_messages")
    .select("id, user_id, body, created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: chatPage.ascending })
    .limit(chatPage.limit);

  if (error) throw new Error(error.message);

  const rows = transcriptChronological(data ?? []);
  const userIds = [...new Set(rows.map((row) => row.user_id as string))];
  const profileMap = new Map<string, ProfileRow>();

  if (userIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, initials, avatar_url")
      .in("id", userIds);
    if (profileError) throw new Error(profileError.message);
    for (const profile of (profiles ?? []) as ProfileRow[]) {
      profileMap.set(profile.id, profile);
    }
  }

  return rows.map((row) => {
    const profile = profileMap.get(row.user_id as string);
    const name = profile?.full_name?.trim() || "Player";
    return {
      id: row.id as string,
      i: profile?.initials || initialsFromName(name),
      n: name,
      t: formatClock(row.created_at as string),
      x: row.body as string,
      me: row.user_id === currentUserId,
    };
  });
}

export function computePlayerStats(
  picks: Record<string, [number, number]>,
  results: FinishedResult[],
  currentGw: number,
): PlayerStats {
  let seasonPoints = 0;
  let gwPoints = 0;
  let exacts = 0;
  let fixturesPicked = 0;

  for (const result of results) {
    const pick = picks[result.id];
    if (!pick) continue;
    fixturesPicked += 1;
    const scoredPick = scorePick(pick, result.homeGoals, result.awayGoals);
    const points = pickPoints(scoredPick.kind);
    seasonPoints += points;
    if (result.gameweek === currentGw) gwPoints += points;
    if (scoredPick.kind === "exact") exacts += 1;
  }

  return { seasonPoints, gwPoints, exacts, fixturesPicked };
}

export function mapIncomingMessage(
  row: { id: string; user_id: string; body: string; created_at: string },
  currentUserId: string,
  profile?: { full_name: string | null; initials: string | null } | null,
): ChatMessage {
  const name = profile?.full_name?.trim() || "Player";
  return {
    id: row.id,
    i: profile?.initials || initialsFromName(name),
    n: name,
    t: formatClock(row.created_at),
    x: row.body,
    me: row.user_id === currentUserId,
  };
}
