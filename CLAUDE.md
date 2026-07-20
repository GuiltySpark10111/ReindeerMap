# ReindeerMap — Claude Code Instructions

## Project
Mobile-first React PWA for fishing spot mapping on Reindeer Lake SK.
Live at: https://guiltyspark10111.github.io/ReindeerMap

## Working Directory
C:\Users\deder\projects\ReindeerMap

## Stack
- React 18, Vite, Leaflet.js, React-Leaflet, Supabase, Tailwind CSS
- Deployed via GitHub Actions to GitHub Pages
- Build tool is Vite, not Create React App (CRA is deprecated/unmaintained) —
  env vars use the `VITE_*` prefix and `import.meta.env`, not `process.env.REACT_APP_*`.

## Key Rules
1. Always mobile-first. Test all UI at 390px width (iPhone 14 viewport).
2. Map must fill full screen height minus bottom tab bar (use CSS calc / flex).
3. All tap targets minimum 44x44px per Apple HIG.
4. Supabase calls go through useWaypoints.js hook only — never call Supabase directly from components.
5. Claude Vision calls go through claudeVision.js only, which calls the
   `claude-vision` Supabase Edge Function — never call Anthropic directly
   from client code. The Anthropic API key must never be a VITE_* var; it
   gets inlined into the public JS bundle and GitHub push-protection will
   (correctly) block the deploy.
6. Never hardcode API keys — always use import.meta.env.VITE_* variables.
7. landmarks.json is read-only reference data — never write to it.
8. Keep components small — if a component exceeds 200 lines, split it.

## Environment Variables Needed
Client (`.env`, GitHub Secrets for the build):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Server-side only (Supabase Edge Function secret, never a client env var):
- ANTHROPIC_API_KEY — `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`

## Build & Deploy
- npm run dev → local dev at localhost:5173
- npm run build → outputs to dist/
- Push to main → GitHub Actions auto-deploys to GitHub Pages
- Secrets must be set in GitHub repo Settings → Secrets
- supabase functions deploy claude-vision → deploys/updates the vision proxy

## Map Center
Reindeer Lake: lat 57.3956, lng -102.1427, zoom 10

## Feature Priority Order
1. Map renders with satellite tiles
2. Tap-hold to drop waypoint
3. Waypoints save to Supabase
4. Waypoints load on app open
5. Layer toggles
6. Image ingest (Claude Vision)
7. PWA manifest + offline caching
