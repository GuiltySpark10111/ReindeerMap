# ReindeerMap

Mobile-first PWA for long-term personal fishing spot mapping on Reindeer Lake, Saskatchewan. Real satellite/topo base maps, cloud-synced waypoints, and Claude Vision feature extraction from map photos/screenshots.

Live: https://guiltyspark10111.github.io/ReindeerMap

See `SPEC_ReindeerMap.md` for the full project spec and `CLAUDE.md` for coding conventions.

## Setup

```bash
npm install
cp .env.example .env   # fill in Supabase + Anthropic keys
npm run dev
```

Apply `supabase/schema.sql` in the Supabase SQL editor before first run.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
