# Web + Mobile: Same Backend, Same Codebase

## Does the backend work for both web and mobile?

**Yes.** The Supabase backend works the same way for:

- **Web** (browser) – your React app deployed to Vercel, Netlify, etc.
- **Mobile** (iOS) – the same React app bundled by Capacitor into the native app.

### How it works

1. **Single codebase**  
   You have one React app. It uses the Supabase client (`@supabase/supabase-js`) for auth, game state, and stats.

2. **Web**  
   `npm run build` → `dist/` → you deploy that to your web host. The app runs in the browser and talks to Supabase.

3. **iOS**  
   Capacitor uses the same `dist/` as `webDir`. The iOS app is a native shell that loads your React app in a WebView. It runs the **exact same** JavaScript, including all Supabase calls.

4. **One Supabase project**  
   Both web and iOS use the same:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`  
   So they share the same database, auth, and backend. No separate “mobile backend.”

### Summary

| Platform | Build / Deploy | Backend |
|----------|----------------|---------|
| Web      | Deploy `dist/` from your host | Same Supabase project |
| iOS      | `npm run ios:sync` → Xcode → device/store | Same Supabase project |

Same plan, same backend, for both.

---

## Branch strategy: `ios-app` vs `main`

You’re on `ios-app`. The backend (Supabase integration, services, schema) lives there. For web **and** mobile to both use it:

### You **do** need to merge into `main` (or your “production” branch)

- **Web** is usually deployed from `main` (or whatever branch your host uses).
- **iOS** can be built from any branch, but you want one canonical branch for both.

If the backend stays only on `ios-app`:

- iOS (built from `ios-app`) ✅ has backend.
- Web (deployed from `main`) ❌ does not, until that code is merged.

So: **merge `ios-app` into `main`** (or make `main` the branch you use for both web and iOS). Then:

- Deploy **web** from `main` → web gets backend.
- Build **iOS** from `main` → iOS gets backend.
- One branch, one source of truth, same behavior on both platforms.

### Suggested workflow

1. Merge `ios-app` → `main` (include backend, Capacitor, iOS project, and any other enhancements).
2. Deploy web from `main`.
3. Build and ship iOS from `main` too.
4. Do future work (features, fixes) on `main` or a short‑lived branch, then merge back to `main`.

### Summary

- **Backend**: Works for both web and mobile; same Supabase project, same code.
- **Branches**: Merge `ios-app` into `main` so both web and mobile use the same codebase and backend. No need to keep them separate for “backend to work across web and mobile.”
