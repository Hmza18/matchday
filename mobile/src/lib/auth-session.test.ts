import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSessionFromUrl, parseAuthCallbackUrl } from "./auth-session.ts";

describe("parseAuthCallbackUrl", () => {
  it("reads a PKCE code from the query string", () => {
    assert.deepEqual(
      parseAuthCallbackUrl("matchday://auth/callback?code=pkce-code-1"),
      { kind: "code", code: "pkce-code-1" },
    );
  });

  it("prefers a PKCE code over tokens when both are present", () => {
    assert.deepEqual(
      parseAuthCallbackUrl(
        "matchday://auth/callback?code=abc&access_token=tok&refresh_token=ref",
      ),
      { kind: "code", code: "abc" },
    );
  });

  it("reads implicit tokens from the hash fragment", () => {
    assert.deepEqual(
      parseAuthCallbackUrl(
        "matchday://auth/callback#access_token=tok&refresh_token=ref&token_type=bearer",
      ),
      { kind: "tokens", accessToken: "tok", refreshToken: "ref" },
    );
  });

  it("reads implicit tokens from the query string", () => {
    assert.deepEqual(
      parseAuthCallbackUrl(
        "https://example.test/auth/callback?access_token=tok&refresh_token=ref",
      ),
      { kind: "tokens", accessToken: "tok", refreshToken: "ref" },
    );
  });

  it("returns empty when the URL has no credentials", () => {
    assert.deepEqual(parseAuthCallbackUrl("matchday://auth/callback"), {
      kind: "empty",
    });
  });

  it("throws when the provider returned an error", () => {
    assert.throws(
      () => parseAuthCallbackUrl("matchday://auth/callback?error=access_denied"),
      /access_denied/,
    );
  });

  it("throws when an access token arrives without a refresh token", () => {
    assert.throws(
      () => parseAuthCallbackUrl("matchday://auth/callback#access_token=tok"),
      /refresh token/,
    );
  });
});

describe("createSessionFromUrl", () => {
  it("exchanges a PKCE code instead of calling setSession", async () => {
    const calls: string[] = [];
    const supabase = {
      auth: {
        async exchangeCodeForSession(code: string) {
          calls.push(`exchange:${code}`);
          return { error: null };
        },
        async setSession() {
          calls.push("set");
          return { error: null };
        },
      },
    };

    const established = await createSessionFromUrl(
      "matchday://auth/callback?code=pkce-code-1",
      supabase,
    );

    assert.equal(established, true);
    assert.deepEqual(calls, ["exchange:pkce-code-1"]);
  });

  it("sets a session from hash tokens", async () => {
    const calls: string[] = [];
    const supabase = {
      auth: {
        async exchangeCodeForSession() {
          calls.push("exchange");
          return { error: null };
        },
        async setSession(tokens: { access_token: string; refresh_token: string }) {
          calls.push(`set:${tokens.access_token}:${tokens.refresh_token}`);
          return { error: null };
        },
      },
    };

    const established = await createSessionFromUrl(
      "matchday://auth/callback#access_token=tok&refresh_token=ref",
      supabase,
    );

    assert.equal(established, true);
    assert.deepEqual(calls, ["set:tok:ref"]);
  });

  it("returns false when the URL has no session material", async () => {
    const established = await createSessionFromUrl("matchday://auth/callback", {
      auth: {
        async exchangeCodeForSession() {
          return { error: null };
        },
        async setSession() {
          return { error: null };
        },
      },
    });
    assert.equal(established, false);
  });
});
