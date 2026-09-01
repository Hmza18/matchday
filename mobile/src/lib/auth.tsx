import * as QueryParams from "expo-auth-session/build/QueryParams";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/src/lib/supabase/client";

WebBrowser.maybeCompleteAuthSession();

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
};

const GUEST_KEY = "matchday-guest";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  /** Browsing without an account. Picks are kept on device only. */
  guest: boolean;
  continueAsGuest: () => Promise<void>;
  leaveGuest: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate")) {
    return "Too many auth emails were sent. Wait a few minutes or disable Confirm email in Supabase while developing.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Apple Sign In is not enabled in Supabase yet.";
  }
  return message;
}

function mapUser(
  user: User,
  profile?: { full_name: string; initials: string; avatar_url?: string | null } | null,
): AuthUser {
  const metaName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";
  const given =
    typeof user.user_metadata?.given_name === "string" ? user.user_metadata.given_name : "";
  const family =
    typeof user.user_metadata?.family_name === "string" ? user.user_metadata.family_name : "";
  const appleName = [given, family].filter(Boolean).join(" ");
  const name =
    profile?.full_name || metaName || appleName || user.email?.split("@")[0] || "Player";
  return {
    id: user.id,
    email: user.email ?? "",
    name,
    initials: profile?.initials || initialsFromName(name),
    avatarUrl: profile?.avatar_url ?? null,
  };
}

async function createSessionFromUrl(url: string) {
  const supabase = createSupabaseClient();
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) return;
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(false);

  const hydrateUser = useCallback(
    async (authUser: User | null) => {
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, initials, avatar_url")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser(mapUser(authUser, profile));
    },
    [supabase],
  );

  useEffect(() => {
    AsyncStorage.getItem(GUEST_KEY)
      .then((value) => setGuest(value === "true"))
      .catch(() => setGuest(false));
  }, []);

  const continueAsGuest = useCallback(async () => {
    setGuest(true);
    await AsyncStorage.setItem(GUEST_KEY, "true");
  }, []);

  const leaveGuest = useCallback(async () => {
    setGuest(false);
    await AsyncStorage.removeItem(GUEST_KEY);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      hydrateUser(data.user).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateUser, supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        throw new Error("Enter your email and password.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (error) throw new Error(mapAuthError(error.message));
      await leaveGuest();
    },
    [supabase, leaveGuest],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const normalized = email.trim().toLowerCase();

      if (!trimmedName) throw new Error("Enter your name.");
      if (!normalized || !normalized.includes("@")) {
        throw new Error("Enter a valid email.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const redirectTo = makeRedirectUri({ scheme: "matchday", path: "auth/callback" });
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
        options: {
          data: { full_name: trimmedName },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw new Error(mapAuthError(error.message));
      if (!data.session) {
        return "Check your email to confirm your account, then sign in.";
      }
      return null;
    },
    [supabase],
  );

  const signInWithApple = useCallback(async () => {
    const redirectTo = makeRedirectUri({ scheme: "matchday", path: "auth/callback" });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw new Error(mapAuthError(error.message));
    if (!data.url) throw new Error("Could not start Apple Sign In.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === "success") {
      await createSessionFromUrl(result.url);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(mapAuthError(error.message));
    setUser(null);
  }, [supabase]);

  const updateAvatar = useCallback(
    async (uri: string) => {
      if (!user) throw new Error("Sign in to change your photo.");
      const response = await fetch(uri);
      const body = await response.arrayBuffer();
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, body, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (profileError) throw new Error(profileError.message);
      setUser((prev) => (prev ? { ...prev, avatarUrl } : prev));
    },
    [supabase, user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      guest,
      continueAsGuest,
      leaveGuest,
      signIn,
      signUp,
      signInWithApple,
      signOut,
      updateAvatar,
    }),
    [
      user,
      loading,
      guest,
      continueAsGuest,
      leaveGuest,
      signIn,
      signUp,
      signInWithApple,
      signOut,
      updateAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
