export type TabId = "picks" | "live" | "pools" | "insights";

export type PillKind = "exact" | "close" | "result" | "miss";

export type ChatMessage = {
  i: string;
  n: string;
  t: string;
  x: string;
  me?: boolean;
  rx?: string;
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
};

export type PersistedState = {
  picks?: Record<string, [number, number]>;
  league: string;
  extraLeagues: string[];
  extraMsgs: ChatMessage[];
  premiumUnlocked: boolean;
};

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
