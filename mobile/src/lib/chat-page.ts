/**
 * League chat is a newest-last transcript with a cap so the Pools query stays
 * cheap. PostgREST applies LIMIT after ORDER, so `created_at.asc` + limit
 * returns the *oldest* rows. Past that cap, refresh hides every new message.
 */

export const LEAGUE_CHAT_PAGE_SIZE = 80;

export type ChatPageQuery = {
  ascending: boolean;
  limit: number;
};

/** Fetch newest-first so the page is the latest messages, then reverse for UI. */
export function leagueChatPageQuery(): ChatPageQuery {
  return { ascending: false, limit: LEAGUE_CHAT_PAGE_SIZE };
}

export function transcriptChronological<T>(newestFirst: T[]): T[] {
  return newestFirst.slice().reverse();
}
