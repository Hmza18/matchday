"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

type Mode = "sign-in" | "sign-up";

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.42 2.2-1.2 3.02-.9.94-2.2 1.56-3.3 1.45-.12-1.1.42-2.26 1.2-3.1.9-.96 2.34-1.62 3.3-1.37zm3.4 16.2c-.66 1.5-1.44 2.92-2.64 2.94-1.14.03-1.5-.72-2.82-.72s-1.74.7-2.82.74c-1.14.04-2.02-1.56-2.7-3.04-1.34-2.94-.34-7.28 1.9-7.3.96-.02 1.68.68 2.82.68 1.14 0 1.74-.7 2.82-.68 1.18.02 2.04 1.66 2.68 3.18-2.34 1.28-1.96 4.58.76 5.2zm-3.2-13.7c.54-.66.9-1.56.8-2.46-.78.04-1.74.52-2.3 1.18-.5.58-.96 1.5-.84 2.38.9.06 1.8-.46 2.34-1.1z"
      />
    </svg>
  );
}

export function AuthShell({ mode }: { mode: Mode }) {
  const { signIn, signUp, signInWithApple } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const isSignUp = mode === "sign-up";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        const message = await signUp(name, email, password);
        if (message) {
          setInfo(message);
          return;
        }
      } else {
        await signIn(email, password);
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const onApple = async () => {
    setError(null);
    setInfo(null);
    setAppleLoading(true);
    try {
      await signInWithApple();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apple Sign In failed.");
      setAppleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh justify-center overflow-hidden bg-md-canvas px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(25,135,84,.22), transparent 55%),radial-gradient(ellipse 60% 40% at 100% 100%, rgba(20,108,67,.12), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[400px] flex-col justify-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="grid size-14 place-items-center rounded-[16px] font-headline text-[28px] font-bold text-[#f8f8f8] shadow-[0_12px_28px_rgba(20,108,67,.28)]"
            style={{ background: "linear-gradient(160deg,#198754,#146C43)" }}
          >
            M
          </div>
          <h1 className="mt-4 font-headline text-[34px] font-semibold tracking-[0.04em] text-md-ink">
            MATCHDAY
          </h1>
          <p className="mt-2 max-w-[280px] text-[14px] leading-relaxed text-md-muted">
            {isSignUp
              ? "Create your account to lock in picks and climb the table."
              : "Sign in to lock your picks and join the banter."}
          </p>
        </div>

        <div className="rounded-[20px] border border-md-line bg-md-paper p-5 shadow-[0_18px_40px_rgba(31,41,55,.08)]">
          <h2 className="font-headline text-[22px] font-semibold tracking-[0.02em]">
            {isSignUp ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-1 mb-5 text-[13px] text-md-muted">
            {isSignUp ? "Takes less than a minute." : "Enter your email and password."}
          </p>

          <button
            type="button"
            onClick={() => {
              void onApple();
            }}
            disabled={appleLoading || submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-md-line bg-[#1a1a1a] text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#2a2a2a] disabled:opacity-60"
          >
            <AppleIcon />
            {appleLoading ? "Redirecting to Apple…" : "Continue with Apple"}
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-md-line" />
            <span className="text-[11px] font-semibold tracking-[0.08em] text-md-muted uppercase">
              or
            </span>
            <div className="h-px flex-1 bg-md-line" />
          </div>

          <form onSubmit={onSubmit}>
            {isSignUp ? (
              <label className="mb-3 block">
                <span className="mb-1.5 block text-[12px] font-semibold text-md-muted">
                  Full name
                </span>
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Sam Boyd"
                  className="h-11 w-full rounded-full border border-md-line bg-md-page px-4 text-[14px] text-md-ink placeholder:text-md-muted/70"
                />
              </label>
            ) : null}

            <label className="mb-3 block">
              <span className="mb-1.5 block text-[12px] font-semibold text-md-muted">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                className="h-11 w-full rounded-full border border-md-line bg-md-page px-4 text-[14px] text-md-ink placeholder:text-md-muted/70"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-[12px] font-semibold text-md-muted">
                Password
              </span>
              <input
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                className="h-11 w-full rounded-full border border-md-line bg-md-page px-4 text-[14px] text-md-ink placeholder:text-md-muted/70"
              />
            </label>

          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-[12px] border border-md-danger/20 bg-md-danger/8 px-3.5 py-3 text-[13px] text-md-danger"
            >
              <p>{error}</p>
              {error.toLowerCase().includes("rate") ||
              error.toLowerCase().includes("confirm email") ? (
                <a
                  href="https://supabase.com/dashboard/project/uomqkoabgujgolgyqccr/auth/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex h-9 items-center rounded-full bg-md-green px-3 text-[12px] font-semibold text-[#f8f8f8] hover:bg-md-green-deep"
                >
                  Open Email settings → turn Confirm email OFF
                </a>
              ) : null}
            </div>
          ) : null}

            {info ? (
              <div
                role="status"
                className="mb-4 rounded-[12px] border border-md-green/25 bg-md-mint-soft px-3.5 py-2.5 text-[13px] text-md-green-deep"
              >
                {info}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || appleLoading}
              className="h-11 w-full rounded-full bg-md-green text-sm font-semibold text-[#f8f8f8] transition hover:bg-md-green-deep disabled:opacity-60"
            >
              {submitting
                ? isSignUp
                  ? "Creating account…"
                  : "Signing in…"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[13px] text-md-muted">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="font-semibold">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/sign-up" className="font-semibold">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
