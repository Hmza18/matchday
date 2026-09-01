export type TabId = "picks" | "live" | "pools" | "news" | "insights" | "settings";

export type PillKind = "exact" | "close" | "result" | "miss";

export type ChatMessage = {
  id: string;
  i: string;
  n: string;
  t: string;
  x: string;
  me?: boolean;
};

export type BoardRow = {
  r: number;
  n: string;
  i: string;
  tot: number;
  d: number;
  mv: number;
  sub: string;
  me?: boolean;
  userId: string;
  avatarUrl?: string | null;
};

export type League = {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  isPublic: boolean;
};

export type PlayerStats = {
  seasonPoints: number;
  gwPoints: number;
  exacts: number;
  fixturesPicked: number;
};

export type PersistedState = {
  picks?: Record<string, [number, number]>;
  activeLeagueId?: string;
  premiumUnlocked?: boolean;
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

export function formatPoints(value: number) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}
