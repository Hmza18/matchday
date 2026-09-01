"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate")) {
    return "Too many auth emails were sent. Wait a few minutes, or use Sign in with Apple. Tip: turn off Confirm email in the Supabase Auth settings to avoid this while developing.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Apple Sign In is not enabled yet. Add your Apple credentials in the Supabase dashboard (Authentication → Providers → Apple).";
  }
  return message;
}

function mapUser(user: User, profile?: { full_name: string; initials: string } | null): AuthUser {
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
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => (isSupabaseConfigured() ? createClient() : null), []);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = useCallback(
    async (authUser: User | null) => {
      if (!authUser || !supabase) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, initials")
        .eq("id", authUser.id)
        .maybeSingle();

      setUser(mapUser(authUser, profile));
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

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
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add your project URL and anon key to .env.local.",
        );
      }
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        throw new Error("Enter your email and password.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });

      if (error) throw new Error(mapAuthError(error.message));
    },
    [supabase],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add your project URL and anon key to .env.local.",
        );
      }
      const trimmedName = name.trim();
      const normalized = email.trim().toLowerCase();

      if (!trimmedName) throw new Error("Enter your name.");
      if (!normalized || !normalized.includes("@")) {
        throw new Error("Enter a valid email.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: normalized,
        password,
        options: {
          data: { full_name: trimmedName },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw new Error(mapAuthError(error.message));

      // No session means email confirmation is required.
      if (!data.session) {
        return "Check your email to confirm your account, then sign in. If you hit rate limits, disable Confirm email in Supabase Auth settings.";
      }

      return null;
    },
    [supabase],
  );

  const signInWithApple = useCallback(async () => {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Add your project URL and anon key to .env.local.",
      );
    }
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw new Error(mapAuthError(error.message));
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(mapAuthError(error.message));
    setUser(null);
  }, [supabase]);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signInWithApple, signOut }),
    [user, loading, signIn, signUp, signInWithApple, signOut],
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
