# ReindeerMap

Mobile-first PWA for long-term personal fishing spot mapping on Reindeer Lake, Saskatchewan. Real satellite/topo base maps, cloud-synced waypoints, and Claude Vision feature extraction from map photos/screenshots.

Live: https://guiltyspark10111.github.io/ReindeerMap

See `SPEC_ReindeerMap.md` for the full project spec and `CLAUDE.md` for coding conventions.

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

Apply `supabase/schema.sql` in the Supabase SQL editor before first run.

The Anthropic API key is never a client env var (it would leak into the public
JS bundle). Deploy the vision proxy and set the key server-side instead:

```bash
supabase functions deploy claude-vision
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
