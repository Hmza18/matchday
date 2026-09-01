# Matchday — mobile

Expo SDK 54 app (Expo Router v6, React Native 0.81, New Architecture) implementing
`Matchday.dc.html`. Runs in Expo Go — no dev client, no prebuild, no native linking.

## Run it

```bash
npm install
npm start
```

`npm start` uses **tunnel** mode, which is the reliable default (see Connectivity).
Scan the QR with Expo Go.

| Script | What it does |
| --- | --- |
| `npm start` | `expo start --tunnel` — works across subnets and through Windows Firewall |
| `npm run lan` | `expo start --lan` — faster bundling, same-subnet only |
| `npm run clear` | Tunnel + cleared Metro cache. Run after any dependency or config change |
| `npm run web` | Browser preview |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run doctor` | `npx expo-doctor` |

## Connectivity

The dev PC is on wired Ethernet and the phone is on WiFi. These are often
different subnets, and Expo's LAN mode then hangs at "Downloading JavaScript
bundle" or never connects at all.

- **Default to `npm start` (tunnel).** It crosses subnets and gets through
  Windows Firewall.
- Tunnel bundles more slowly. If the PC and phone are confirmed on the same
  subnet, `npm run lan` is faster.
- **If LAN fails:** check that the PC's Ethernet adapter and the phone's WiFi
  share the first three octets of their IP (e.g. both `192.168.1.x`). If they do
  not, tunnel is the only option short of bridging the networks.
- Windows Firewall must allow Node.js on **Private** networks for LAN mode.
- Run `npm run clear` after changing dependencies or config.

Every network call has a 10-second `AbortController` timeout and falls back to
bundled data rather than hanging — a tunnelled app that hangs on a fetch is
indistinguishable from a broken one.

## Environment

Copy `.env.example` to `.env`. Only `EXPO_PUBLIC_`-prefixed variables are
readable on device.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL. Blank = auth disabled, app still runs |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_API_BASE_URL` | Soccer API base. Defaults to `https://worldcup26.ir` |
| `EXPO_PUBLIC_API_KEY` | Optional, sent as `x-api-key` |
| `EXPO_PUBLIC_MOCK_MODE` | `true` serves bundled fixture data and makes no network calls |

### Running with no backend

With `EXPO_PUBLIC_MOCK_MODE=true` and everything else blank, every screen renders
from `src/lib/football/mock.ts` — the clubs, scorelines, pick distributions and
match events from the design file. Useful for UI work and for a first run after
cloning.

## Architecture

```
app/                     Expo Router routes
  (tabs)/                Picks · Live · Pools · Insights · You
  sign-in, sign-up       Email + password auth
src/
  components/            Screen bodies and shared UI
  lib/
    config.ts            EXPO_PUBLIC_* env access
    theme.ts             Design tokens from Matchday.dc.html
    store.tsx            App state, picks, leagues, chat
    auth.tsx             Supabase auth + guest mode
    football/            API client, normalizers, mock data
    supabase/            Client
```

### Notes

- **Session storage is AsyncStorage, not SecureStore.** SecureStore rejects
  values over 2048 bytes and a Supabase JWT session exceeds that, which shows up
  as an intermittent silent logout rather than an error.
- **Picks autosave locally** on every change and rehydrate on boot, so a pick
  survives a force-quit, a dropped connection, or being made before sign-in.
- **Guest mode** ("Look around first") enters the tabs without an account. Picks
  are kept on device until sign-in.
