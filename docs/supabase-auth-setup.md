# Matchday Supabase Auth setup

## Fix “email rate limit exceeded”

Free projects only send a couple of auth emails per hour. Confirmation emails hit that limit fast.

1. Open [Authentication → Providers → Email](https://supabase.com/dashboard/project/uomqkoabgujgolgyqccr/auth/providers)
2. Turn **Confirm email** **OFF**
3. Save

Also set these under [Authentication → URL Configuration](https://supabase.com/dashboard/project/uomqkoabgujgolgyqccr/auth/url-configuration):

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://127.0.0.1:3000/auth/callback`

After that, email/password signup signs you in immediately (no confirmation email).

## Enable Sign in with Apple

Apple Sign In needs an [Apple Developer](https://developer.apple.com) account.

1. In Apple Developer → Identifiers, create an **App ID** with Sign in with Apple
2. Create a **Services ID** (e.g. `com.matchday.app.web`) and configure:
   - Domains: `uomqkoabgujgolgyqccr.supabase.co`
   - Return URL: `https://uomqkoabgujgolgyqccr.supabase.co/auth/v1/callback`
3. Create a **Sign in with Apple Key** (`.p8`), note Key ID + Team ID
4. In Supabase → [Authentication → Providers → Apple](https://supabase.com/dashboard/project/uomqkoabgujgolgyqccr/auth/providers):
   - Enable Apple
   - Client IDs: your Services ID first (required for web OAuth)
   - Secret: generate from Team ID / Key ID / `.p8` (rotate every 6 months)

The Matchday UI already has **Continue with Apple** on `/sign-in` and `/sign-up`.

## Picks table

Score picks are stored in Supabase when a signed-in user changes a stepper on **Picks**.

### Schema

`public.picks`:

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | `uuid` | FK → `auth.users`, owner |
| `fixture_id` | `text` | worldcup26 event id, e.g. `401879301` |
| `home_score` | `smallint` | 0–9 |
| `away_score` | `smallint` | 0–9 |
| `gameweek` | `smallint` | 1–38, derived from fixture round |
| `created_at` / `updated_at` | `timestamptz` | auto |

Primary key: `(user_id, fixture_id)`.

### RLS

RLS is enabled. Authenticated users can **select**, **insert**, and **update** only their own rows (`user_id = auth.uid()`).

### App API

- `GET /api/picks` — load all picks for the signed-in user (optional `?gw=N` filter)
- `POST /api/picks` — upsert one pick; server rejects writes after kickoff

Local migration: on first sign-in, any picks still in browser `localStorage` are uploaded once, then removed from local storage.

Migration file: [`supabase/migrations/20260831120000_picks.sql`](../supabase/migrations/20260831120000_picks.sql)

## Leagues, leaderboards, and chat

Private leagues live in Supabase. The mobile app talks to these tables directly.

| Table | Purpose |
|-------|---------|
| `leagues` | Name, invite code, owner |
| `league_members` | Who is in which league |
| `league_messages` | Banter chat (Realtime enabled) |

RPCs (authenticated only):

- `create_league(p_name)` — creates a league, generates a 6-character invite code, adds the caller as a member
- `join_league(p_code)` — looks up the code and adds the caller

Fellow members can read each other's `picks` so the Pools tab can rank the table on device from finished Premier League results.

First sign-in auto-joins **Matchday Global**, a public league every account is added to. Private leagues are created from Pools → Join or create.

Migrations:

- [`supabase/migrations/20260831140000_leagues_chat.sql`](../supabase/migrations/20260831140000_leagues_chat.sql)
- [`supabase/migrations/20260831150000_league_rls_rpc.sql`](../supabase/migrations/20260831150000_league_rls_rpc.sql)
- [`supabase/migrations/20260831160000_global_league_avatars.sql`](../supabase/migrations/20260831160000_global_league_avatars.sql)
