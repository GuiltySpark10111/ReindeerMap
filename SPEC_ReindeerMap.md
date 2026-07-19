# ReindeerMap — Project Specification
**Version:** 1.0  
**Author:** Dan Eder  
**Date:** July 2026  
**Repo:** `GuiltySpark10111/ReindeerMap`  
**Live URL:** `https://guiltyspark10111.github.io/ReindeerMap`

---

## 1. Project Overview

ReindeerMap is a mobile-first Progressive Web App (PWA) for long-term personal fishing spot mapping on Reindeer Lake, Saskatchewan. It combines real satellite/topo base maps, personal waypoint management, and AI-powered feature extraction from uploaded images or URLs. All data persists in the cloud so the map is accessible and editable from any device — phone on the water or desktop at home.

---

## 2. Core Goals

- Drop and save named fishing waypoints from a phone while on the lake
- Build a persistent, cumulative map across multiple trips
- Extract geographic features from photos of paper maps, app screenshots, or map image URLs using Claude Vision
- Overlay multiple data layers (personal spots, hydrology, extracted features, named landmarks)
- Work reliably on mobile with no app install required (PWA)

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 18 | Same as Unbound |
| Map Library | Leaflet.js + React-Leaflet | Real tile rendering, mobile touch support |
| Base Tiles | OpenStreetMap / Esri Satellite | Free, no API key required |
| AI Vision | Anthropic Claude API (claude-sonnet-4-6) | Image → GeoJSON feature extraction |
| Database | Supabase (free tier) | Cloud waypoint storage, syncs all devices |
| Hosting | GitHub Pages | Auto-deploy via GitHub Actions |
| PWA | Workbox / CRA PWA template | Offline tile caching, installable on phone |
| Styling | Tailwind CSS | Mobile-first, utility classes |

---

## 4. Repository Structure

```
ReindeerMap/
├── public/
│   ├── index.html
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons for phone home screen
├── src/
│   ├── App.jsx                # Root component, tab routing
│   ├── components/
│   │   ├── MapView.jsx        # Main Leaflet map, marker rendering
│   │   ├── MarkerPanel.jsx    # Add/edit waypoint drawer (mobile slide-up)
│   │   ├── LayerControl.jsx   # Toggle overlay layers on/off
│   │   ├── ImageIngest.jsx    # Upload photo or paste URL → Claude Vision
│   │   ├── FeatureReview.jsx  # Review extracted features before saving
│   │   └── WaypointList.jsx   # Scrollable list of all saved spots
│   ├── hooks/
│   │   ├── useWaypoints.js    # CRUD operations against Supabase
│   │   ├── useImageIngest.js  # Claude Vision API call + response parsing
│   │   └── useMapLayers.js    # Layer state management
│   ├── lib/
│   │   ├── supabase.js        # Supabase client init
│   │   ├── claudeVision.js    # Anthropic API wrapper for image analysis
│   │   └── geoUtils.js        # Coordinate helpers, GeoJSON utilities
│   ├── data/
│   │   └── landmarks.json     # Pre-loaded named features (see Section 8)
│   └── index.js
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions → GitHub Pages
├── CLAUDE.md                  # Claude Code instructions (this file's companion)
├── package.json
└── .env.example               # Environment variable template
```

---

## 5. Map View — Core Feature

### 5.1 Base Map
- Default view: Reindeer Lake centered at `57.3956°N, 102.1427°W`, zoom level 10
- Three tile layer options (toggle in layer control):
  - **Satellite** (Esri World Imagery — free, no key): best for identifying structure and shoreline
  - **Topo** (OpenTopoMap): shows elevation, rivers, named features
  - **Street/OSM** (OpenStreetMap): shows community names, roads, waterways

### 5.2 Map Interactions — Mobile First
- **Tap and hold** on map (500ms) → opens Add Waypoint drawer for that location
- **Tap existing marker** → opens view/edit panel for that waypoint
- **Pinch to zoom** — standard Leaflet touch behavior
- **Two-finger pan** — standard Leaflet
- Current GPS location button (top right) → centers map on device location

### 5.3 Map Controls Layout (mobile)
```
[GPS]  [Layers]                    ← top right floating buttons
                                    
        [ MAP ]                    ← full screen
                                    
[+ Add Spot]  [List]  [Import]     ← bottom tab bar
```

---

## 6. Waypoint System

### 6.1 Marker Types
Each waypoint has a type that determines its icon color and symbol:

| Type | Icon Color | Symbol | Use Case |
|---|---|---|---|
| `walleye` | Yellow | Fish | Walleye hotspot |
| `pike` | Green | Fish | Pike hotspot |
| `reef` | Red | Anchor | Underwater reef or rock structure |
| `creek_mouth` | Blue | Droplet | River or creek inflow point |
| `camp` | Orange | Tent | Camp or lodge location |
| `hazard` | Black | Warning | Shallow rock, hazard, obstacle |
| `depth` | Purple | Ruler | Depth sounding / noted depth |
| `general` | Gray | Pin | General point of interest |

### 6.2 Waypoint Data Model

```javascript
{
  id: uuid,
  created_at: timestamp,
  updated_at: timestamp,
  user_id: string,           // ties to Supabase auth (or local device ID if no auth)
  lat: float,                // decimal degrees
  lng: float,                // decimal degrees
  type: enum,                // see 6.1
  name: string,              // short label shown on map (max 40 chars)
  notes: string,             // freeform notes (max 500 chars)
  depth_ft: float,           // optional depth in feet
  depth_m: float,            // optional depth in meters
  species: string[],         // species caught/observed
  source: enum,              // 'manual' | 'image_extract' | 'landmark'
  trip_date: date,           // optional: date this spot was noted
  image_url: string,         // optional: photo of the spot
  layer_id: string           // which layer this belongs to (see 7.1)
}
```

### 6.3 Add Waypoint Flow (mobile)
1. Tap and hold on map → pin drops at tapped location
2. Bottom drawer slides up with form:
   - Name field (required)
   - Type selector (icon grid, large tap targets)
   - Notes (optional)
   - Depth (optional, ft or m toggle)
   - Species (multi-select chips: Walleye, Pike, Lake Trout, Whitefish, Grayling, Other)
   - Trip date (optional, defaults today)
3. Save → marker appears immediately, syncs to Supabase in background
4. Cancel → pin removed

### 6.4 Edit / Delete
- Tap marker → popup shows name, type, notes, depth
- Popup has Edit and Delete buttons
- Edit reopens the drawer pre-populated
- Delete requires confirmation tap

---

## 7. Layer System

### 7.1 Layer Types

| Layer | Source | Toggleable | Description |
|---|---|---|---|
| Personal Spots | Supabase | Yes | User's own waypoints |
| Landmarks | landmarks.json | Yes | Pre-loaded named features (see Section 8) |
| Extracted Features | Supabase | Yes | Features imported via image/URL ingest |
| Rivers & Hydrology | OpenStreetMap tiles | Via base map | Shown on Topo tile layer |
| Depth Contours | Future: GeoJSON import | Yes | Optional bathymetric data if available |

### 7.2 Layer Control UI
- Floating button top-right opens layer panel
- Each layer has a toggle switch and color indicator
- "Personal Spots" can be filtered by type (show only walleye spots, etc.)

---

## 8. Pre-loaded Landmarks (landmarks.json)

Pre-populate the map with the following named features on first load. These are read-only reference markers (source: `landmark`) shown in a distinct style (outlined, not filled).

```json
[
  { "name": "Southend SK", "lat": 56.335, "lng": -103.246, "type": "camp", "notes": "Community, Hwy 102 terminus" },
  { "name": "Kinoosao SK", "lat": 57.08, "lng": -102.02, "type": "camp", "notes": "Community, Hwy 994" },
  { "name": "Brochet MB", "lat": 57.89, "lng": -101.68, "type": "camp", "notes": "Community, north end of lake, Manitoba" },
  { "name": "Tate Island Lodge", "lat": 57.40, "lng": -102.40, "type": "camp", "notes": "Fishing lodge, mid-lake" },
  { "name": "Lawrence Bay Lodge", "lat": 56.70, "lng": -102.60, "type": "camp", "notes": "Fishing lodge, NE of Southend" },
  { "name": "Nordic Lodge", "lat": 56.38, "lng": -103.22, "type": "camp", "notes": "Fishing lodge, west of Southend" },
  { "name": "Deep Bay", "lat": 56.50, "lng": -103.17, "type": "depth", "notes": "Meteorite impact crater, 219m deep — deepest point in lake" },
  { "name": "Cochrane River Mouth", "lat": 57.30, "lng": -103.30, "type": "creek_mouth", "notes": "Primary named inflow, west shore" },
  { "name": "Reindeer River Outflow", "lat": 56.34, "lng": -103.24, "type": "creek_mouth", "notes": "Outflow south to Churchill River via Whitesand Dam" },
  { "name": "Bedford House (Historic)", "lat": 57.50, "lng": -103.30, "type": "general", "notes": "Historic Hudson Bay Company trading post, est. 1796" },
  { "name": "SK / MB Provincial Border", "lat": 57.50, "lng": -102.00, "type": "general", "notes": "Saskatchewan / Manitoba border crosses lake approx here" }
]
```

---

## 9. Image Ingest — Claude Vision Pipeline

This is the AI-powered feature extraction system. It lets the user photograph a paper map, screenshot another app, or paste a URL and automatically extract geographic features as map markers.

### 9.1 Entry Points
- **Camera/Upload:** Tap "Import" tab → "Upload Image" → select from camera roll or take photo
- **URL:** Tap "Import" tab → "Paste URL" → enter any publicly accessible image URL
- **Paste:** On desktop, paste an image directly into the import area

### 9.2 Processing Pipeline

```
Input (image file or URL)
        ↓
claudeVision.js — sends to Anthropic API with structured prompt
        ↓
Claude returns structured JSON (feature list)
        ↓
FeatureReview.jsx — user sees extracted features on map overlay
        ↓
User approves/edits/removes individual features
        ↓
Approved features saved to Supabase as waypoints (source: 'image_extract')
```

### 9.3 Claude Vision Prompt (claudeVision.js)

```javascript
const EXTRACTION_PROMPT = `
You are analyzing a fishing or navigation map image for Reindeer Lake, Saskatchewan, Canada.

Extract every identifiable geographic feature visible in this image and return ONLY a JSON array. No preamble, no explanation, no markdown — pure JSON only.

Each feature object must have:
{
  "name": "feature name or label visible on map",
  "type": "one of: walleye | pike | reef | creek_mouth | camp | hazard | depth | general",
  "lat": estimated decimal latitude (57.0-58.2 range for Reindeer Lake),
  "lng": estimated decimal longitude (-103.5 to -101.5 range for Reindeer Lake),
  "notes": "any additional context visible (depth numbers, species notes, etc.)",
  "confidence": "high | medium | low"
}

If the image has a scale bar or coordinate grid, use it to estimate positions precisely.
If no coordinates are visible, estimate positions relative to known landmarks (Southend at 56.335N 103.246W, Tate Island at 57.40N 102.40W, Brochet at 57.89N 101.68W).
If a feature cannot be reasonably placed, still include it with confidence: "low".
If the image is not a map, return an empty array [].
`;
```

### 9.4 Feature Review UI
- Extracted features shown as semi-transparent markers on the map
- List below map shows each feature with:
  - Name (editable)
  - Type (editable via icon picker)
  - Confidence indicator (high/medium/low badge)
  - Lat/lng (editable for manual correction)
  - Toggle to include/exclude
- "Save All" → saves all included features
- "Save Selected" → saves only checked features
- "Discard" → removes all, returns to map

### 9.5 Supported Image Sources
- JPEG, PNG, WEBP from camera roll
- Screenshots from Navionics, i-Boating, Angler's Atlas, Google Maps
- Photos of paper topo maps (GoTrekkers, Backroad Mapbooks)
- Any publicly accessible image URL

---

## 10. Waypoint List View

- Accessible via "List" tab at bottom
- Shows all saved waypoints sorted by most recent
- Filter bar: All / by type / by trip date
- Search by name
- Tap any entry → flies map to that location and opens marker popup
- Swipe left on entry → delete with confirmation

---

## 11. PWA Configuration

### 11.1 manifest.json
```json
{
  "name": "ReindeerMap",
  "short_name": "ReindeerMap",
  "description": "Personal fishing map for Reindeer Lake SK",
  "start_url": "/ReindeerMap/",
  "display": "standalone",
  "background_color": "#0d4f8c",
  "theme_color": "#0d4f8c",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 11.2 Offline Support
- Leaflet tile layers cached via service worker on first load
- Supabase writes queued locally if offline, sync on reconnect
- Last known waypoint set cached in localStorage as fallback

---

## 12. Supabase Schema

### 12.1 Table: `waypoints`
```sql
create table waypoints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  device_id text not null,        -- anonymous device fingerprint (no login required for v1)
  lat float8 not null,
  lng float8 not null,
  type text not null default 'general',
  name text not null,
  notes text,
  depth_ft float4,
  depth_m float4,
  species text[],
  source text default 'manual',
  trip_date date,
  image_url text,
  layer_id text default 'personal'
);

-- Enable Row Level Security (open read/write for v1, device_id scoped)
alter table waypoints enable row level security;
create policy "device owns waypoints" on waypoints
  using (device_id = current_setting('app.device_id', true));
```

### 12.2 Auth Strategy (v1)
- No login required for v1
- `device_id` generated on first app load, stored in localStorage
- Same device = same spots
- Future v2: add Supabase Auth for cross-device login

---

## 13. Environment Variables

```bash
# .env (never commit — add to GitHub Secrets for Actions)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_ANTHROPIC_API_KEY=your-anthropic-api-key
```

> ⚠️ The Anthropic API key is used client-side in v1 for simplicity. For production, proxy through a Supabase Edge Function to keep the key server-side.

---

## 14. GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy ReindeerMap to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
        env:
          CI: false
          PUBLIC_URL: /ReindeerMap
          REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
          REACT_APP_ANTHROPIC_API_KEY: ${{ secrets.REACT_APP_ANTHROPIC_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

---

## 15. package.json

```json
{
  "name": "reindeer-map",
  "version": "1.0.0",
  "homepage": "https://guiltyspark10111.github.io/ReindeerMap",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "@supabase/supabase-js": "^2.39.0",
    "tailwindcss": "^3.4.0",
    "uuid": "^9.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version"]
  }
}
```

---

## 16. CLAUDE.md (Instructions for Claude Code)

```markdown
# ReindeerMap — Claude Code Instructions

## Project
Mobile-first React PWA for fishing spot mapping on Reindeer Lake SK.
Live at: https://guiltyspark10111.github.io/ReindeerMap

## Working Directory
C:\Users\Dan\projects\ReindeerMap

## Stack
- React 18, Leaflet.js, React-Leaflet, Supabase, Tailwind CSS
- Deployed via GitHub Actions to GitHub Pages

## Key Rules
1. Always mobile-first. Test all UI at 390px width (iPhone 14 viewport).
2. Map must fill full screen height minus bottom tab bar (use CSS calc).
3. All tap targets minimum 44x44px per Apple HIG.
4. Supabase calls go through useWaypoints.js hook only — never call Supabase directly from components.
5. Claude Vision calls go through claudeVision.js only.
6. Never hardcode API keys — always use process.env.REACT_APP_* variables.
7. landmarks.json is read-only reference data — never write to it.
8. Keep components small — if a component exceeds 200 lines, split it.

## Environment Variables Needed
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_ANTHROPIC_API_KEY

## Build & Deploy
- npm start → local dev at localhost:3000
- Push to main → GitHub Actions auto-deploys to GitHub Pages
- Secrets must be set in GitHub repo Settings → Secrets

## Map Center
Reindeer Lake: lat 57.3956, lng -102.1427, zoom 10

## Feature Priority Order
1. Map renders with satellite tiles ✓
2. Tap-hold to drop waypoint ✓
3. Waypoints save to Supabase ✓
4. Waypoints load on app open ✓
5. Layer toggles ✓
6. Image ingest (Claude Vision) ✓
7. PWA manifest + offline caching ✓
```

---

## 17. Build Phases

### Phase 1 — Core Map (build first, validate on phone)
- [ ] React app scaffolded, deployed to GitHub Pages
- [ ] Leaflet map renders centered on Reindeer Lake
- [ ] Satellite / Topo / OSM tile toggle
- [ ] Pre-loaded landmarks.json markers visible
- [ ] GPS "go to my location" button

### Phase 2 — Waypoint CRUD
- [ ] Supabase project created, schema applied
- [ ] Tap-hold to add waypoint
- [ ] Marker type selector
- [ ] Notes, depth, species fields
- [ ] Edit and delete
- [ ] Waypoint list view

### Phase 3 — Image Ingest
- [ ] Image upload UI
- [ ] URL paste UI
- [ ] Claude Vision API integration
- [ ] Feature review and approve flow
- [ ] Extracted features saved as waypoints

### Phase 4 — PWA Polish
- [ ] manifest.json and icons
- [ ] Service worker / offline tile caching
- [ ] Offline write queue for waypoints
- [ ] "Add to Home Screen" prompt on mobile

---

## 18. Pre-requisites Before Starting Claude Code Session

1. **Create GitHub repo:** `GuiltySpark10111/ReindeerMap` (public)
2. **Create Supabase project** at supabase.com (free tier) → copy URL and anon key
3. **Add GitHub Secrets** in repo Settings → Secrets:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_ANTHROPIC_API_KEY`
4. **Enable GitHub Pages** in repo Settings → Pages → Source: `gh-pages` branch
5. **Run Supabase SQL** from Section 12.1 in Supabase SQL editor

---

*Spec complete. Hand to Claude Code at `C:\Users\Dan\projects\ReindeerMap` to begin Phase 1.*
