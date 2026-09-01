/**
 * Parse a Supabase auth redirect (deep link or https) into the credentials
 * needed to establish a session.
 *
 * supabase-js defaults to PKCE, so the callback is usually `?code=…`.
 * Implicit/hash redirects still send `access_token` + `refresh_token`.
 */
export type AuthCallbackCredentials =
  | { kind: "code"; code: string }
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "empty" };

export function parseAuthCallbackUrl(url: string): AuthCallbackCredentials {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);
  const query = parsed.searchParams;

  const param = (name: string) => {
    const value = query.get(name) || hash.get(name);
    return value && value.length > 0 ? value : undefined;
  };

  const error = param("error_code") || param("error") || param("error_description");
  if (error) {
    throw new Error(error);
  }

  const code = param("code");
  if (code) {
    return { kind: "code", code };
  }

  const accessToken = param("access_token");
  const refreshToken = param("refresh_token");
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  if (accessToken && !refreshToken) {
    throw new Error("Auth callback is missing a refresh token.");
  }

  return { kind: "empty" };
}

export async function createSessionFromUrl(
  url: string,
  supabase: {
    auth: {
      exchangeCodeForSession: (code: string) => Promise<{ error: { message: string } | null }>;
      setSession: (tokens: {
        access_token: string;
        refresh_token: string;
      }) => Promise<{ error: { message: string } | null }>;
    };
  },
): Promise<boolean> {
  const credentials = parseAuthCallbackUrl(url);

  switch (credentials.kind) {
    case "code": {
      const { error } = await supabase.auth.exchangeCodeForSession(credentials.code);
      if (error) throw new Error(error.message);
      return true;
    }
    case "tokens": {
      const { error } = await supabase.auth.setSession({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
      });
      if (error) throw new Error(error.message);
      return true;
    }
    case "empty":
      return false;
    default: {
      const _exhaustive: never = credentials;
      throw new Error(`Unhandled auth callback: ${String(_exhaustive)}`);
    }
  }
}
