import type { BoardRow, ChatMessage } from "@/lib/types";

export const DEFAULT_LEAGUES = [
  "Office League",
  "Uni Mates",
  "Global",
  "Sunday Five",
] as const;

export const BOARD: Record<string, BoardRow[]> = {
  "Office League": [
    { r: 1, n: "Priya Raman", i: "PR", tot: 148, d: 11, mv: 2, sub: "18 exact this season" },
    { r: 2, n: "Tom Vasquez", i: "TV", tot: 145, d: 8, mv: 1, sub: "Longest run: 5 exact" },
    { r: 3, n: "Sam Boyd (you)", i: "SB", tot: 141, d: 14, mv: 3, sub: "Best gameweek yet", me: true },
    { r: 4, n: "Dee Okafor", i: "DO", tot: 139, d: 5, mv: 0, sub: "Never missed a pick" },
    { r: 5, n: "Marcus Hale", i: "MH", tot: 132, d: 2, mv: -2, sub: "Draw specialist" },
    { r: 6, n: "Lena Fischer", i: "LF", tot: 127, d: 0, mv: -4, sub: "Skipped GW6" },
  ],
  "Uni Mates": [
    { r: 1, n: "Sam Boyd (you)", i: "SB", tot: 141, d: 14, mv: 1, sub: "Top of the pile", me: true },
    { r: 2, n: "Rory Nkemelu", i: "RN", tot: 138, d: 9, mv: -1, sub: "Three exact in GW6" },
    { r: 3, n: "Aisha Kaur", i: "AK", tot: 130, d: 12, mv: 2, sub: "Climbing fast" },
    { r: 4, n: "Ben Oyelaran", i: "BO", tot: 121, d: 3, mv: 0, sub: "Backs the away side" },
    { r: 5, n: "Chloe Marsh", i: "CM", tot: 118, d: 6, mv: 1, sub: "Joined GW3" },
    { r: 6, n: "Yusuf Demir", i: "YD", tot: 109, d: 1, mv: -3, sub: "Two blanks running" },
  ],
  Global: [
    { r: 4211, n: "kestrelkid", i: "KK", tot: 172, d: 17, mv: 812, sub: "Kestrel Park fan" },
    { r: 4212, n: "thevalewall", i: "TV", tot: 172, d: 15, mv: 340, sub: "Vale Athletic fan" },
    { r: 4213, n: "Sam Boyd (you)", i: "SB", tot: 141, d: 14, mv: 2104, sub: "Top 4% worldwide", me: true },
    { r: 4214, n: "quarryboy88", i: "Q8", tot: 141, d: 11, mv: -60, sub: "Old Quarry fan" },
    { r: 4215, n: "nortsidenina", i: "NN", tot: 140, d: 9, mv: 0, sub: "Nortside Rovers fan" },
    { r: 4216, n: "coralbaycal", i: "CC", tot: 139, d: 4, mv: -420, sub: "Coral Bay FC fan" },
  ],
};

export const BASE_MESSAGES: ChatMessage[] = [
  { i: "PR", n: "Priya Raman", t: "20:14", x: "Whoever's got Ironbridge 4–0 needs a lie down." },
  { i: "TV", n: "Tom Vasquez", t: "20:16", x: "That was me and I'm not sorry.", rx: "😂 5" },
  { i: "DO", n: "Dee Okafor", t: "20:22", x: "Kestrel keeper is having a nightmare. Glad I went 3–1." },
  { i: "SB", n: "Sam Boyd", t: "20:31", x: "Eleven minutes to lock and I've changed the Atlas score four times.", me: true },
  { i: "MH", n: "Marcus Hale", t: "20:32", x: "Classic Sam.", rx: "🔥 2" },
  { i: "LF", n: "Lena Fischer", t: "20:40", x: "Office League table is going to be brutal after Sunday." },
];

export const TAB_ICONS = {
  picks:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  live: "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 7.5a6 6 0 0 0 0 9M16 7.5a6 6 0 0 1 0 9M5 4.5a10 10 0 0 0 0 15M19 4.5a10 10 0 0 1 0 15",
  pools: "M7 4h10v4a5 5 0 0 1-10 0V4zM10 15h4v4h-4zM8 21h8",
  insights:
    "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16z",
} as const;

export function formatCountdown(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (sec >= 900) return `${m}m`;
  return `${m}m ${s < 10 ? `0${s}` : s}s`;
}

export function leagueMeta(name: string) {
  switch (name) {
    case "Global":
      return "2.4m players";
    case "Uni Mates":
      return "6 players · GW7";
    case "Office League":
      return "6 players · GW7";
    case "Sunday Five":
      return "1 player";
    default:
      return "You just joined";
  }
}
