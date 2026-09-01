/**
 * Runtime configuration, read from EXPO_PUBLIC_* env vars.
 *
 * Only EXPO_PUBLIC_-prefixed variables are inlined into the bundle by Expo,
 * so every value here must carry that prefix to be readable on device.
 */

function flag(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return value === "true" || value === "1";
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Serve bundled fixture data instead of calling the network. */
export const MOCK_MODE = flag(process.env.EXPO_PUBLIC_MOCK_MODE, false);

/** Base URL for the soccer API. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://worldcup26.ir";

/** Optional API key, sent as x-api-key when present. */
export const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

/** How long any single request may run before it is aborted. */
export const REQUEST_TIMEOUT_MS = 10_000;

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

/**
 * Whether a real Supabase project is wired up. When false the app still runs
 * end to end: auth is unavailable but every screen renders from local data.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
