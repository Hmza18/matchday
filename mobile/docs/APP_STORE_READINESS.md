# App Store readiness — Matchday

Assessment as of the latest release prep. The mobile app (`mobile/`) is the App Store candidate.

## Ready

| Item | Status |
| --- | --- |
| App identity | Name, slug, version `1.0.0`, bundle ID `com.matchday.app` |
| Icon | 1024×1024 at `assets/images/icon.png` |
| Splash screen | Configured via `expo-splash-screen` plugin |
| Core flows | Onboarding, auth, picks, live, pools, chat, profile |
| Photo permission | Purpose string in `app.config.ts` |
| Account deletion | In-app flow in Settings → Delete account |
| Privacy & Terms | In-app screens + hosted web pages |
| Chat reporting | Long-press a message → Report |
| EAS profiles | `development`, `preview`, `production` in `eas.json` |
| Export compliance | `ITSAppUsesNonExemptEncryption: false` in iOS config |

## Still required before submission

### Apple Developer & EAS

1. **Apple Developer account** — App ID for `com.matchday.app`, certificates, provisioning profiles.
2. **Link EAS project** — run `eas init` and add `extra.eas.projectId` to `app.config.ts`.
3. **First production build** — `eas build --platform ios --profile production`.
4. **Configure `eas.json` submit** — fill in `appleId`, `ascAppId`, `appleTeamId` under `submit.production`.
5. **Set hosted legal URLs** — update `EXPO_PUBLIC_PRIVACY_URL` and `EXPO_PUBLIC_TERMS_URL` to your production domain.

### Supabase (production)

6. Apply all migrations in `supabase/migrations/`, including `profiles` and `delete_user_account`.
7. Enable **Apple** auth provider and add redirect URL `matchday://auth/callback`.
8. Set production `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in EAS secrets.

### App Store Connect

9. **Screenshots** — 6.7", 6.5", 5.5" iPhone sizes.
10. **Metadata** — description, subtitle, keywords, support URL, marketing URL.
11. **Privacy questionnaire** — declare email, name, picks, chat messages, profile photos.
12. **Age rating** — fantasy score prediction; no real-money gambling.

### Product decisions

13. **Insights Premium** — currently marked "Coming soon" (no fake IAP). Implement StoreKit before enabling paid unlock.
14. **Chat UGC** — reporting is in place; consider moderation policy in Terms.
15. **Insights data** — wired to live fixture distributions; expand with real H2H API when available.

## Build commands

```bash
cd mobile
npm install
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

## Checklist before hitting Submit

- [ ] Production Supabase project wired and migrations applied
- [ ] Apple Sign In tested on a real device build (not Expo Go)
- [ ] Account creation, deletion, and sign-out tested
- [ ] Privacy Policy and Terms URLs live and linked in App Store Connect
- [ ] No placeholder copy or fake payment flows
- [ ] `npm run typecheck` passes
- [ ] `npm run doctor` passes
