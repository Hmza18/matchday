export const TAB_ICONS = {
  picks: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  live: "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 7.5a6 6 0 0 0 0 9M16 7.5a6 6 0 0 1 0 9M5 4.5a10 10 0 0 0 0 15M19 4.5a10 10 0 0 1 0 15",
  pools: "M7 4h10v4a5 5 0 0 1-10 0V4zM10 15h4v4h-4zM8 21h8",
  news: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4v2h8V8H8zm0 4v6h8v-6H8z",
  insights: "M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM18 16l.9 2.1L21 19l-2.1.9L18 22l-.9-2.1L15 19l2.1-.9L18 16z",
  settings: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
} as const;

export function formatCountdown(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (sec >= 900) return `${m}m`;
  return `${m}m ${s < 10 ? `0${s}` : s}s`;
}
