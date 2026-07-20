# ReindeerMap — Map Data Sources & Ingestion Instructions
**For Claude Code at:** `C:\Users\Dan\projects\ReindeerMap`

---

## Overview

This file describes all available map data sources for Reindeer Lake SK and how to ingest each one into the ReindeerMap app. Sources are ranked by data quality and ease of integration. Work through them in order.

---

## Source 1 — OpenStreetMap Hydrography (FREE, GeoJSON, highest priority)

**What it contains:** Actual lake shoreline polygon, islands, rivers, creeks, named water bodies — all as real vector geometry. This is the most accurate freely available shoreline data for Reindeer Lake.

**How to get it:**
Use the Overpass Turbo API to extract Reindeer Lake and surrounding hydrography. Fetch this URL in the app or download manually:

```
https://overpass-api.de/api/interpreter?data=[out:json][timeout:60];
(
  relation["name"="Reindeer Lake"]["natural"="water"];
  way["name"="Cochrane River"];
  way["name"="Wathaman River"];
  way["name"="Reindeer River"];
);
out geom;
```

**Integration task:**
1. Create `src/data/fetchOSMHydrography.js` — a utility that fetches the above Overpass query on app load (or on demand) and converts the response to GeoJSON
2. Add the result as a toggleable GeoJSON overlay layer called "Waterways (OSM)" in `LayerControl.jsx`
3. Style: rivers = blue lines weight 2, lake outline = blue fill opacity 0.15, islands = green fill opacity 0.3
4. Cache the result in localStorage with a 7-day TTL so it doesn't re-fetch every load

---

## Source 2 — Natural Resources Canada (NRCan) Open Data (FREE, authoritative)

**What it contains:** Official Government of Canada hydrographic data for Reindeer Lake area including bathymetry, waterways, and named geographic features.

**Dataset pages (NRCan Open Science Platform):**
- Reindeer Lake general: `https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-305613`
- Reindeer Lake Saskatchewan-Manitoba: `https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-107177`
- Reindeer Lake area SK and MB: `https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-107168`
- Geology South Reindeer Lake: `https://osdp-psdo.canada.ca/dp/en/search/metadata/NRCAN-GEOSCAN-1-214414`

**Integration task:**
1. Visit each metadata page above and check for downloadable GeoJSON, Shapefile, or KML links
2. If Shapefile format: convert to GeoJSON using `mapshaper` npm package (`npm install mapshaper`)
3. Place converted files in `src/data/nrcan/`
4. Add as a toggleable layer "NRCan Hydrography" in `LayerControl.jsx`
5. These are authoritative — give them higher visual weight than OSM layer

---

## Source 3 — Canadian National Hydro Network (NHN) (FREE, best river/creek data)

**What it contains:** Every named and unnamed river, creek, and stream draining into Reindeer Lake. Reindeer Lake has 94 tributaries — this dataset captures them all including the Cochrane River, Wathaman River, and dozens of unnamed streams.

**Download URL:**
```
https://open.canada.ca/data/en/dataset/a4b190fe-e090-4e6d-881e-b87956c07977
```
Select: Saskatchewan → Hydrographic features → Download GeoJSON or Shapefile

**Integration task:**
1. Download the NHN dataset for Saskatchewan Division 18 (the division covering Reindeer Lake)
2. Filter to bounding box: `56.19N, 103.33W` to `58.18N, 101.46W`
3. Place filtered GeoJSON in `src/data/nhn/reindeer_tributaries.geojson`
4. Add as toggleable layer "Rivers & Creeks (NHN)" — this is the key layer for finding creek mouths to fish
5. Style: major rivers (Cochrane, Wathaman, Reindeer) = blue weight 2.5; minor tributaries = blue weight 1, opacity 0.7

---

## Source 4 — GPS Nautical Charts / i-Boating Tile Layer (FREE tiles)

**What it contains:** Nautical chart tiles with depth contours for Reindeer Lake. Not downloadable as GeoJSON but available as XYZ tile layer.

**Tile URL:**
```
https://fishing-app.gpsnauticalcharts.com/i-boating-fishing-web-app/fishing-marine-charts-navigation.html?title=Reindeer+Lake+boating+app#10.17/57.3956/-102.1427
```

**Integration task:**
Add as a base tile layer option in `LayerControl.jsx` alongside existing satellite/topo/OSM options. Label it "Nautical Charts". Note: verify tile URL format from the app's network requests — the XYZ tile endpoint may be at a subdomain like `tiles.gpsnauticalcharts.com/{z}/{x}/{y}.png`.

---

## Source 5 — OpenSeaMap Overlay (FREE, nautical markers)

**What it contains:** Nautical hazard markers, depth soundings, buoys, and navigation aids overlaid on any base map. Sparse for remote lakes but captures any logged hazards.

**Tile URL:**
```
https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png
```

**Integration task:**
1. Add to `LayerControl.jsx` as a toggleable overlay (not a base layer — sits on top)
2. Default: OFF
3. Opacity: 0.85
4. Attribution: "© OpenSeaMap contributors"
5. Label: "Nautical Markers"

---

## Source 6 — Topographic Map tiles (FREE)

**What it contains:** Topographic contours, elevation shading, named features, roads, waterways for the entire Reindeer Lake area.

**Two options — add both as base layer choices:**

**OpenTopoMap:**
```
https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
```
Attribution: "© OpenTopoMap contributors"

**ESRI World Topo:**
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}
```
Attribution: "© Esri"

**Integration task:**
Both should already be in `LayerControl.jsx` from original spec. If not, add them now.

---

## Source 7 — Backroad Mapbooks TOPO PDF (PAID, manual import)

**What it contains:** Detailed recreation topo map covering Reindeer Lake area including logging roads, fishing lakes, rivers, campgrounds, paddling routes. Map code: SKSK118.

**Purchase URL:** `https://www.backroadmapbooks.com/brmb-products/sksk118-topo-reindeer-lake.html`

**Integration task (manual — requires Dan to purchase and photograph/scan):**
1. Dan purchases and downloads the PDF
2. Dan uploads the PDF image to ReindeerMap via the Image Ingest tab
3. Claude Vision extracts named features, trails, campgrounds, fishing spots
4. Extracted features saved as "Backroad Mapbook" layer in Supabase
5. No code changes needed — this uses the existing Image Ingest pipeline

---

## Source 8 — GoTrekkers Paper Topo Map (PAID, manual import)

**What it contains:** 40x29" paper topo map at 1:100,000 scale with shaded relief, portages, campsites, lodges, and forest fire burn areas. Best physical reference map available.

**Purchase URL:** `https://gotrekkers.com/reindeer-lake-south-map/`

**Integration task (manual — requires Dan to purchase and photograph):**
1. Dan purchases the paper map
2. Dan photographs it in sections with phone camera (4-6 overlapping photos for full coverage)
3. Each photo uploaded via Image Ingest tab
4. Claude Vision extracts features from each section
5. Dan reviews and approves extracted features
6. Saved as "GoTrekkers Topo" layer
7. No code changes needed — existing pipeline handles this

---

## Source 9 — Avenza Maps / Fish Canada (PAID, georeferenced PDF)

**What it contains:** Georeferenced fishing map for Reindeer Lake SK — can be used in the Avenza Maps app with GPS overlay.

**Purchase URL:** `https://store.avenza.com/products/reindeer-lake-saskatchewan-fish-canada-map-the-xperience-map`

**Integration task:**
1. Dan purchases and downloads the georeferenced PDF
2. Avenza georeferenced PDFs contain embedded coordinate data
3. Add a GeoTIFF/GeoPDF import handler in `ImageIngest.jsx` that reads embedded coordinate data for precise placement
4. This is a code addition — create `src/lib/geoPdfParser.js` using the `geotiff` npm package
5. Result: imported features placed at exact real-world coordinates, not estimated

---

## Source 10 — Canadian Geographical Names Database (FREE, place names)

**What it contains:** Official Government of Canada place name registry — every named island, bay, point, river, and geographic feature on Reindeer Lake with exact coordinates.

**API endpoint:**
```
https://geogratis.gc.ca/api/en/geonames.json?q=reindeer+lake&province=47&num=100
```
Province code 47 = Saskatchewan

**Integration task:**
1. Create `src/lib/fetchPlaceNames.js` — fetches the above API and returns named features as GeoJSON points
2. Run on first app load, cache in Supabase table `place_names` with 30-day TTL
3. Add as toggleable overlay "Place Names (Canada)" in `LayerControl.jsx`
4. Style: text labels only, no icons, font-size scales with zoom level
5. This gives you the official name of every island, bay, and point on the lake

---

## Implementation Order

Build in this sequence — each layer adds value independently:

1. **Source 5** — OpenSeaMap overlay (30 min, one tile URL)
2. **Source 6** — Topo tile layers (30 min if not already done)
3. **Source 1** — OSM hydrography GeoJSON (2 hrs, most impactful for shoreline accuracy)
4. **Source 10** — Canadian place names API (1 hr, gives all island/bay names)
5. **Source 3** — NHN river/creek data (2 hrs, critical for tributary fishing)
6. **Source 2** — NRCan open data (1-2 hrs depending on format)
7. **Source 4** — Nautical chart tiles (1 hr, verify tile URL format first)
8. **Sources 7-9** — Manual import via Image Ingest (Dan does these, no code needed)
9. **Source 9 GeoPDF** — Only if Dan purchases Avenza map (3 hrs code)

---

## Notes for Claude Code

- All GeoJSON layers must be clipped to the Reindeer Lake bounding box before rendering: `56.19N, 103.33W` to `58.18N, 101.46W`
- Large GeoJSON files (NHN, NRCan) must be loaded asynchronously and show a loading indicator
- All external tile layers need proper attribution strings per their license terms
- Layer state (on/off) should persist in localStorage so user's preferred layer combination is remembered between sessions
- Each new layer needs a toggle in `LayerControl.jsx` and a color-coded legend entry
