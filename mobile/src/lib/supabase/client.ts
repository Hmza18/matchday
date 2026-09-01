// react-native-url-polyfill must be imported before createClient: supabase-js
// builds request URLs with the WHATWG URL API, which React Native lacks.
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/src/lib/config";

export { isSupabaseConfigured };

let client: SupabaseClient | null = null;
let appStateBound = false;

/**
 * Returns the shared Supabase client.
 *
 * Sessions are stored in AsyncStorage rather than expo-secure-store: SecureStore
 * rejects values over 2048 bytes, and a Supabase JWT session routinely exceeds
 * that, which shows up as an intermittent silent logout rather than an error.
 *
 * When no project is configured the client is still constructed against a
 * placeholder so imports never throw — auth calls fail, but every screen renders.
 */
export function createSupabaseClient() {
  if (client) return client;

  client = createClient(
    SUPABASE_URL || "http://localhost",
    SUPABASE_ANON_KEY || "public-anon-key",
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Mandatory on native: there is no URL bar to read a session back from.
        detectSessionInUrl: false,
      },
    },
  );

  if (!appStateBound && isSupabaseConfigured) {
    appStateBound = true;
    // Refresh tokens only while the app is actually in front.
    AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void client?.auth.startAutoRefresh();
      } else {
        void client?.auth.stopAutoRefresh();
      }
    });
  }

  return client;
}
