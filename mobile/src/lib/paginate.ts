/**
 * PostgREST (Supabase) silently truncates a select at `max-rows` (default
 * 1000) unless the client pages with `.range()`. League scoring loads every
 * member's picks; three accounts with a full Premier League card already
 * exceed that cap, and the extra rows never reach the table.
 */
export const POSTGREST_MAX_ROWS = 1000;

/** Keep `.in(...)` filters short enough for a GET URL. */
export const IN_FILTER_CHUNK = 100;

export function chunkArray<T>(items: T[], size: number): T[][] {
  if (size < 1) {
    throw new Error("chunk size must be at least 1");
  }
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function fetchAllPages<T>(
  loadPage: (from: number, to: number) => Promise<T[]>,
  pageSize = POSTGREST_MAX_ROWS,
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;
  let pages = 0;
  const maxPages = 100;

  for (;;) {
    const page = await loadPage(from, from + pageSize - 1);
    rows.push(...page);
    pages += 1;
    if (page.length < pageSize) break;
    if (pages >= maxPages) {
      throw new Error("Pagination exceeded safety limit");
    }
    from += pageSize;
  }

  return rows;
}
