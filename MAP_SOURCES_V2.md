# ReindeerMap — Additional Map Sources V2
## Rivers, Bay Names, Preview Maps & Named Features
**For Claude Code at:** `C:\Users\Dan\projects\ReindeerMap`

---

## Priority 1 — Saskatchewan Government ArcGIS (LIVE API, best source)

This is the highest value new source. Saskatchewan's own GIS server exposes the full Canadian Geographical Names Database (CGNDB) as a live queryable ArcGIS REST service — every named bay, island, point, river, and channel on Reindeer Lake with exact coordinates.

**Service endpoint:**
```
https://gis.saskatchewan.ca/arcgis/rest/services/CanadianGeoNamesWater/MapServer/0/query
```

**Query to fetch all named water features within Reindeer Lake bounding box:**
```
https://gis.saskatchewan.ca/arcgis/rest/services/CanadianGeoNamesWater/MapServer/0/query?where=1%3D1&geometry=%7B%22xmin%22%3A-103.33%2C%22ymin%22%3A56.19%2C%22xmax%22%3A-101.46%2C%22ymax%22%3A58.18%7D&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=GEONAME%2CGENERIC%2CLAT%2CLONG_&returnGeometry=true&f=geojson
```

**Integration task:**
1. Create `src/lib/fetchSaskGeoNames.js` — fetches the above URL and returns GeoJSON
2. Parse `GEONAME` field as the label, `GENERIC` as feature type (BAY, ISLAND, RIVER, POINT, etc.)
3. Add as toggleable layer "Named Features (SK Gov)" in `LayerControl.jsx`
4. Style by feature type:
   - BAY → blue label, no icon
   - ISLAND → green label
   - RIVER/CREEK → blue line label
   - POINT/CAPE → gray triangle
5. Cache in localStorage 30 days — this data changes rarely
6. This single API call gives you all 36 geomemorial named features plus all other official names on Reindeer Lake

---

## Priority 2 — NRCan CGNDB Direct Download (CSV + KML, authoritative)

Full national place name dataset downloadable directly from the Government of Canada. Saskatchewan file covers all named features in the province.

**Direct download URLs (no login required):**

CSV (English):
```
https://ftp.maps.canada.ca/pub/nrcan_rncan/vector/geobase_cgn_toponyme/prov_csv_eng/cgn_sk_csv_eng.zip
```

KML (English):
```
https://ftp.maps.canada.ca/pub/nrcan_rncan/vector/geobase_cgn_toponyme/prov_kml_eng/cgn_sk_kml_eng.zip
```

**Integration task:**
1. Download and unzip `cgn_sk_csv_eng.zip` locally
2. Filter rows where `LATITUDE` is between 56.19 and 58.18, `LONGITUDE` between -103.33 and -101.46
3. Save filtered subset as `src/data/nrcan/reindeer_lake_names.json`
4. Commit this pre-filtered file to the repo — no runtime download needed
5. Load as a layer alongside the live SK GIS API above (they complement each other)

**Fields to use:** `GEOGRAPHICAL_NAME`, `GENERIC_TERM`, `LATITUDE`, `LONGITUDE`, `DECISION_DATE`

---

## Priority 3 — Pre-loaded Named Features (hardcode now, fill gaps)

Based on research, here are all confirmed named bays, islands, rivers, and points on Reindeer Lake with coordinates. Add these to `landmarks.json` immediately — they fill gaps before the API layers are wired in.

### Named Bays
```json
[
  { "name": "Zangeza Bay (SK)", "lat": 58.050, "lng": -102.067, "type": "general", "notes": "Named bay, north end, Saskatchewan side" },
  { "name": "Zangeza Bay (MB)", "lat": 58.086, "lng": -102.000, "type": "general", "notes": "Named bay, north end, Manitoba side" },
  { "name": "Wepusko Bay", "lat": 57.35, "lng": -101.90, "type": "general", "notes": "Named bay, east shore — NTS map 064E02" },
  { "name": "Lawrence Bay", "lat": 56.70, "lng": -102.60, "type": "general", "notes": "Named bay — Lawrence Bay Lodge located here. 40 miles by cruiser from Southend." },
  { "name": "Deep Bay", "lat": 56.50, "lng": -103.17, "type": "depth", "notes": "Meteorite impact crater. 219m deep — deepest point on the lake." }
]
```

### Named Islands (Geomemorial Program)
```json
[
  { "name": "Tate Island", "lat": 57.117, "lng": -102.533, "type": "general", "notes": "Tate Island Lodge. Float plane access. CGNDB ID: HAMZK" },
  { "name": "Findlay Island", "lat": 57.10, "lng": -102.60, "type": "general", "notes": "Named after Robert Henry Findlay. Geomemorial Program." },
  { "name": "Boucher Island", "lat": 57.05, "lng": -102.55, "type": "general", "notes": "Named after Arthur Alfred Boucher. Geomemorial Program." },
  { "name": "McCrea Island", "lat": 56.95, "lng": -102.70, "type": "general", "notes": "Named after Sidney Benjamin McCrea. Geomemorial Program." },
  { "name": "Bedford Island", "lat": 57.55, "lng": -103.20, "type": "general", "notes": "Historic area — Bedford House trading post 1796. NTS map 064E07" },
  { "name": "Beaver Island", "lat": 57.50, "lng": -103.10, "type": "general", "notes": "NTS map 064E08" },
  { "name": "Ballentin Island", "lat": 57.55, "lng": -102.90, "type": "general", "notes": "NTS map 064E09" },
  { "name": "Patterson Island", "lat": 57.60, "lng": -102.75, "type": "general", "notes": "NTS map 064E10" },
  { "name": "Cheesman Island", "lat": 57.25, "lng": -102.10, "type": "general", "notes": "NTS map 064E01 — east side of lake" },
  { "name": "Milton Island", "lat": 56.75, "lng": -102.90, "type": "general", "notes": "NTS map 064D10" },
  { "name": "Amiskit Island", "lat": 56.85, "lng": -103.10, "type": "general", "notes": "NTS map 064D16" },
  { "name": "Reindeer Island (Ecological Reserve)", "lat": 57.20, "lng": -102.80, "type": "general", "notes": "Ecological reserve. Check First Nations land access requirements before fishing nearby." }
]
```

### Named Peninsulas
```json
[
  { "name": "Feaviour Peninsula", "lat": 57.65, "lng": -102.85, "type": "general", "notes": "Named peninsula, north-central lake. NTS map 064E16" }
]
```

### Named Rivers (confirmed with coordinates)
```json
[
  { "name": "Cochrane River (mouth)", "lat": 57.30, "lng": -103.30, "type": "creek_mouth", "notes": "Primary named inflow. Drains from Cochrane Lake to the west." },
  { "name": "Wathaman River (mouth)", "lat": 57.80, "lng": -102.50, "type": "creek_mouth", "notes": "Second major named inflow. Drains from north." },
  { "name": "Reindeer River (outflow)", "lat": 56.338, "lng": -103.225, "type": "creek_mouth", "notes": "Outflow south to Churchill River. 100km long. Flow regulated by Whitesand Dam." },
  { "name": "Whitesand Dam", "lat": 56.236, "lng": -103.149, "type": "hazard", "notes": "Regulates Reindeer River outflow. Coordinates: 56°14'8\"N 103°08'57\"W" }
]
```

### Named Lakes in Area (day-trip targets from Tate Island)
```json
[
  { "name": "Finlayson Lake", "lat": 56.55, "lng": -103.20, "type": "general", "notes": "Named lake in area. NTS map 064D07" },
  { "name": "Bleasdell Lake", "lat": 56.65, "lng": -103.15, "type": "general", "notes": "Named lake in area. NTS map 064D09" },
  { "name": "Ghana Lake", "lat": 56.70, "lng": -103.05, "type": "general", "notes": "Named lake in area. NTS map 064D11" },
  { "name": "Oliver Lake", "lat": 56.90, "lng": -103.20, "type": "general", "notes": "Named lake in area. NTS map 064D14" },
  { "name": "Perry Lake", "lat": 56.95, "lng": -103.10, "type": "general", "notes": "Named lake in area. Perry Lake Ecological Reserve. NTS map 064D15" }
]
```

---

## Priority 4 — NTS Topographic Map Sheets (Free preview images, georeferenced)

National Topographic System (NTS) maps at 1:50,000 scale cover Reindeer Lake in 16 individual sheets. Each sheet is a free downloadable image from the Government of Canada. These are the "preview maps" that can be imported via Image Ingest.

**Sheet numbers covering Reindeer Lake:**

| NTS Sheet | Name | Coverage Area |
|---|---|---|
| 064D06 | Southend | South tip, Southend community |
| 064D07 | Finlayson Lake | SW lake, Finlayson Lake |
| 064D09 | Bleasdell Lake | SW lake area |
| 064D10 | Milton Island | West-central lake |
| 064D11 | Ghana Lake | West-central |
| 064D14 | Oliver Lake | West shore mid |
| 064D15 | Perry Lake | West shore, Perry Lake ER |
| 064D16 | Amiskit Island | West shore north |
| 064E01 | Cheesman Island | East shore south |
| 064E02 | Wepusko Bay | East shore — Wepusko Bay |
| 064E07 | Bedford Island | West-central upper |
| 064E08 | Beaver Island | Central |
| 064E09 | Ballentin Island | Central-north |
| 064E10 | Patterson Island | Central-north |
| 064E16 | Feaviour Peninsula | North-central |
| 064L01 | Zangeza Bay | North end |

**How to get them:**
Base URL for NTS map downloads (GeoTIFF + PDF):
```
https://maps.library.utoronto.ca/datapub/digital/3rdparty/toporama/
```
Or search by sheet number at:
```
https://geogratis.gc.ca/api/en/nrcan-rncan/ess-sst?q=064D06&lang=en
```

**Integration task — two approaches:**

**Approach A (Image Ingest — immediate, no code):**
Dan downloads each sheet PDF → opens Import tab → uploads → Claude Vision extracts named features, rivers, contour labels → saved as "NTS Topo" layer. Best for spot-checking specific areas.

**Approach B (Georeferenced overlay — requires code):**
Each NTS sheet has known corner coordinates. Add a GeoTIFF import handler in `ImageIngest.jsx` that reads the bounding coordinates of an NTS sheet and overlays it at exact position on the Leaflet map. Use `leaflet-geotiff` package:
```
npm install leaflet-geotiff
```
Then user selects NTS sheet number from a dropdown → app fetches and overlays it georeferenced. This is the cleanest solution for combining NTS topo detail with your live base map.

---

## Priority 5 — GeoNames.org API (river tributaries with names)

GeoNames has a free API that returns named features within a bounding box including rivers and streams that feed Reindeer Lake.

**API endpoint (no key required for basic use):**
```
http://api.geonames.org/searchJSON?featureClass=H&north=58.18&south=56.19&east=-101.46&west=-103.33&maxRows=500&username=demo&lang=en
```

Replace `demo` with a free registered username from geonames.org.

Feature class `H` = hydrographic features (rivers, streams, bays, lakes).

**Integration task:**
1. Register free account at geonames.org → get username
2. Store username in `.env` as `REACT_APP_GEONAMES_USER`
3. Create `src/lib/fetchGeoNames.js` — queries the above endpoint
4. Filter results to rivers, streams, and bays only (`fcode: STM, STMI, BAY, BAYS`)
5. Add as layer "Rivers & Streams (GeoNames)" — particularly useful for the unnamed tributaries

---

## Priority 6 — Angler's Atlas Preview Maps

Angler's Atlas has Reindeer Lake-specific fishing data including community-submitted hotspots and some depth data. While their full data requires login, their map preview at the URL below shows labeled bays and structure visible via screenshot → Image Ingest pipeline.

**URL:**
```
https://www.anglersatlas.com/place/162186/reindeer-lake
```

**Integration task (manual, Image Ingest):**
1. Open Angler's Atlas on desktop at full zoom over areas of interest
2. Screenshot each section
3. Upload via Image Ingest → Claude Vision extracts labeled features
4. Saved as "Angler's Atlas" layer

This works for any preview map that can be screenshotted — i-Boating, Navionics, Google Maps, etc.

---

## Priority 7 — Reindeer Lake/Lindbergh Lodge Aerodrome

Named airport on an island in Reindeer Lake — useful as a navigation reference point.

**Add to landmarks.json:**
```json
{ "name": "Lindbergh Lodge Aerodrome", "lat": 57.25, "lng": -102.35, "type": "general", "notes": "Float plane / bush plane aerodrome on island in Reindeer Lake. ICAO: n/a. Reference navigation point." }
```

---

## Summary: What to Build First

| Task | Time | Value |
|---|---|---|
| Add all named features from Priority 3 to `landmarks.json` | 30 min | Immediate — all known bay/island names visible now |
| Wire Priority 1 Saskatchewan GIS ArcGIS API | 2 hrs | Best single source — live, authoritative, queryable |
| Download and filter Priority 2 NRCan CSV | 1 hr | Fills gaps, covers the full province |
| Add Priority 5 GeoNames river API | 1 hr | Tributary stream names |
| NTS georeferenced overlay (Priority 4 Approach B) | 3 hrs | Enables exact overlay of any of the 16 topo sheets |

Start with the landmarks.json additions — zero code, immediate visible improvement, and all names are confirmed with coordinates above. Then wire the SK GIS ArcGIS endpoint for the full authoritative dataset.
