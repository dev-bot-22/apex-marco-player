## Goal
Full admin control panel for Marco Premium Stream Player with maintenance mode, proxy detection & blocking, and a new branded homepage.

## Storage
Enable **Lovable Cloud** (managed backend) to persist:
- `admin_settings` — single-row config: `maintenance_on`, `maintenance_message`, `proxy_protection_on`, `proxy_message`
- `blocked_domains` — list of hostnames admin has blocked
- `request_log` — recent referrer/origin hostnames that hit the player (for the "domains using my site" view)

Without persistent storage the toggles would reset on every worker restart and blocked domains wouldn't stick — so Cloud is required.

## Admin panel — `/admin`
- Login form (hardcoded creds: `official_marco_22` / `marco@22`, session stored in httpOnly cookie signed with SESSION_SECRET)
- After login: dashboard with
  1. **Maintenance Mode** toggle + editable custom message textarea
  2. **Proxy Protection Mode** toggle + editable "unauthorized access" message
  3. **Domains using site** — table of hostnames (from request_log) with per-row **Block** button
  4. **Blocked domains** — list with unblock button + manual "Add domain" input
  5. Logout

## Enforcement (in `src/server.ts` / proxy layer)
On every incoming request:
1. Log the `Referer`/`Origin` hostname (if external) to `request_log` (dedup by hostname, keep last seen).
2. If **maintenance_on** → serve custom maintenance HTML page (except `/admin/*` routes).
3. If request came from a `blocked_domains` host OR (proxy_protection_on AND referrer host ≠ our own host) → for **player pages** (`/play.php`, `/play2.php`) serve the "Unauthorized access" HTML with Connect Now → `t.me/official_marco_22`. For other pages behave normally unless maintenance is on.

## Homepage `/`
Replace the studyratna proxy on `/` with a new branded landing page:
- Big title **"Marco Premium Stream Player"**
- Subtitle: "Agar kisi ko hamara Player use karna hai to contact us on Telegram"
- **Connect Now** button → `https://t.me/official_marco_22`
- Clean dark themed design
- (Existing batches/proxy pages remain accessible via other routes/hashes for existing users, but `/` no longer redirects to studyratna content.)

## Files to add/change
- Enable Lovable Cloud (migration for 3 tables + RLS/grants; admin routes use service role via server functions)
- `src/lib/admin.functions.ts` — login, get/update settings, list/block/unblock domains, list request log
- `src/lib/admin.server.ts` — cookie session verify helper
- `src/lib/enforcement.server.ts` — maintenance + proxy-protection checker used by proxy & player routes
- `src/routes/admin.tsx` — login + dashboard UI
- `src/routes/index.tsx` — replace with new Marco Premium landing page
- `src/routes/play[.]php.tsx`, `src/routes/play2[.]php.tsx` — call enforcement, serve unauthorized page if blocked
- `src/lib/proxy.server.ts` — log referrer, run maintenance check
- `SESSION_SECRET` env secret (auto-generated)

## Technical notes (non-user)
- Sessions via `useSession` from `@tanstack/react-start/server` (httpOnly encrypted cookie, 7 days)
- All admin mutations behind `requireAdmin` middleware that reads the session cookie
- Blocked/unauthorized responses set `Cache-Control: no-store` so toggles are instant
- Request log uses upsert-on-hostname with `last_seen_at` update to keep table small

Confirm and I'll implement.