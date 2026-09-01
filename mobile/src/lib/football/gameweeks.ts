/**
 * Calendar days that are this far apart belong to different gameweeks.
 * Midweek rounds sit 3 days before the weekend (Wed → Sat). A 4-day
 * threshold merged those into one 20-match "gameweek" and left the season
 * with 36 numbered weeks instead of 38.
 */
const NEW_GAMEWEEK_GAP_MS = 3 * 24 * 60 * 60 * 1000;

export function buildGameweeks(calendar: string[]) {
  const dates = [...new Set(calendar.map((entry) => entry.slice(0, 10)))].sort();
  const weeks: string[][] = [];
  let current: string[] = [];
  let previous: Date | null = null;

  for (const dateStr of dates) {
    const date = new Date(`${dateStr}T12:00:00Z`);
    if (previous && date.getTime() - previous.getTime() >= NEW_GAMEWEEK_GAP_MS) {
      weeks.push(current);
      current = [];
    }
    current.push(dateStr);
    previous = date;
  }

  if (current.length > 0) weeks.push(current);
  return weeks;
}

export function gameweekForDate(iso: string, weeks: string[][]) {
  const day = iso.slice(0, 10);
  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    const start = week[0]!;
    const end = week[week.length - 1]!;
    if (day >= start && day <= end) return index + 1;
  }
  return 1;
}

export function currentGameweek(weeks: string[][], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    const start = week[0]!;
    const end = week[week.length - 1]!;
    if (today >= start && today <= end) return index + 1;
  }

  for (let index = 0; index < weeks.length; index++) {
    const week = weeks[index]!;
    if (today < week[0]!) return Math.max(1, index + 1);
  }

  return Math.max(1, weeks.length);
}
