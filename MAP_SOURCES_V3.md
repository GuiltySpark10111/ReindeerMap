# ReindeerMap — Additional Map Sources V3
## Bathymetry, Preview Maps, Tile Layers & New APIs
**For Claude Code at:** `C:\Users\Dan\projects\ReindeerMap`

---

## Source A — Saskatchewan Bathymetric ArcGIS Service (LIVE API — depth data)

This is the biggest new find. The Saskatchewan Ministry of Environment maintains a live ArcGIS bathymetric service with depth soundings collected since the 1950s. In some cases scanned paper maps were georeferenced, digitized and modeled in 3D.

**ArcGIS MapServer:**
```
https://gis.saskatchewan.ca/arcgis/rest/services/Bathymetric/MapServer
```

**ArcGIS FeatureServer (queryable point data):**
```
https://gis.saskatchewan.ca/arcgis/rest/services/Bathymetric/FeatureServer
```

**Interactive viewer (screenshot-able for Image Ingest):**
```
https://gisappl.saskatchewan.ca/Html5Ext/?viewer=bathy
```

**Integration task — two approaches:**

**Approach A (Tile overlay — easiest):**
Add the MapServer as a dynamic tile layer in `LayerControl.jsx`:
```javascript
L.tileLayer.wms("https://gis.saskatchewan.ca/arcgis/rest/services/Bathymetric/MapServer/export", {
  layers: '0',
  format: 'image/png',
  transparent: true,
  opacity: 0.6
})
```
Label: "Depth Soundings (SK Gov)" — default OFF.

**Approach B (Point data — richer):**
Query the FeatureServer for depth points within Reindeer Lake bounding box:
```
https://gis.saskatchewan.ca/arcgis/rest/services/Bathymetric/FeatureServer/0/query?where=1%3D1&geometry=%7B%22xmin%22%3A-103.33%2C%22ymin%22%3A56.19%2C%22xmax%22%3A-101.46%2C%22ymax%22%3A58.18%7D&geometryType=esriGeometryEnvelope&inSR=4326&outFields=*&f=geojson
```
Render depth points as small labeled circles sized by depth value. This is the depth contour data you've been looking for.

**Screenshot approach (no code, immediate):**
Open `https://gisappl.saskatchewan.ca/Html5Ext/?viewer=bathy` → navigate to Reindeer Lake → screenshot sections → upload via Image Ingest. Claude Vision extracts depth values and places them as `depth` type markers.

---

## Source B — NRCan Toporama GeoTIFF (FREE, georeferenced topo tiles)

Toporama is NRCan's complete 1:50,000 georeferenced topo coverage of all Canada — the same data as the NTS sheets but pre-packaged as downloadable GeoTIFF files, already georeferenced. This is the best free source for overlaying precise topo data.

**Direct download base URL (GeoTIFF, geographic coordinates):**
```
https://ftp.maps.canada.ca/pub/nrcan_rncan/raster/toporama/50k_geo_tif/
```

**Index file (KMZ — drag into Google Earth to find your sheet numbers):**
```
https://ftp.maps.canada.ca/pub/nrcan_rncan/raster/toporama/index/toporama_index.kmz
```

**Sheets covering Reindeer Lake** — download these specific GeoTIFFs:
```
064D06.tif  — Southend (south tip)
064D07.tif  — Finlayson Lake (SW)
064D09.tif  — Bleasdell Lake (SW)
064D10.tif  — Milton Island (west-central)
064D11.tif  — Ghana Lake (west-central)
064D14.tif  — Oliver Lake (west shore)
064D15.tif  — Perry Lake (west shore)
064D16.tif  — Amiskit Island (west-north)
064E01.tif  — Cheesman Island (east shore)
064E02.tif  — Wepusko Bay (east shore)
064E07.tif  — Bedford Island (upper west)
064E08.tif  — Beaver Island (central)
064E09.tif  — Ballentin Island (central-north)
064E10.tif  — Patterson Island (central-north)
064E16.tif  — Feaviour Peninsula (north-central)
064L01.tif  — Zangeza Bay (north end)
```

**Integration task:**
1. Install `npm install georaster georaster-layer-for-leaflet`
2. Create `src/components/ToporamaLayer.jsx` — loads a GeoTIFF by sheet number and renders it as a georeferenced overlay on the Leaflet map
3. Add a sheet selector panel — user picks which NTS sheet to overlay
4. Dan downloads desired .tif files from the FTP URL above and uploads via a file input
5. Or: app fetches directly from the NRCan FTP if CORS allows

This gives you pixel-perfect topo overlay sitting at exact coordinates on top of your satellite/OSM base map — rivers, contours, named features all aligned correctly.

---

## Source C — NRCan Atlas of Canada WMS Tile Layer (FREE, live tiles)

The Atlas of Canada exposes a live WMS service with topographic map tiles covering all of Canada including Reindeer Lake. This streams the topo data directly as map tiles — no download needed.

**WMS endpoint:**
```
https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT_CBCT_GEOM_3978/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
```

**Simpler XYZ tile URL (CanVec base map):**
```
https://maps.geogratis.gc.ca/wms/canvec_en?service=WMS&version=1.3.0&request=GetMap&layers=canvec&bbox={bbox-epsg-3857}&width=256&height=256&crs=EPSG:3857&format=image/png
```

**Integration task:**
Add as base layer option "Atlas of Canada (CanVec)" in `LayerControl.jsx` alongside existing satellite/topo/OSM options. This layer shows rivers, waterways, and named features from the official Canadian national base map — better labeling than OSM for remote northern SK.

---

## Source D — Zoom Earth Satellite Preview (screenshot for Image Ingest)

Zoom Earth provides live and historical NASA satellite imagery of Reindeer Lake at high resolution — useful for recent imagery that shows ice conditions, water clarity, and shoreline detail.

**Direct URL to Reindeer Lake:**
```
https://zoom.earth/places/canada/reindeer-lake/
```

**Use case:**
- Open on desktop at maximum zoom over areas of interest
- Screenshot and upload via Image Ingest
- Claude Vision identifies shoreline features, island shapes, tributary mouths visible in the satellite image
- Good for finding creek mouths and inflow staining (tannin-colored water shows tributary entry points)

---

## Source E — IAGLR Lake Profile (interactive map + data)

The International Association for Great Lakes Research maintains a profile page for Reindeer Lake with interactive map and lake data.

**URL:**
```
https://iaglr.org/lakes/profile/reindeer/
```

**Use case:** Screenshot the interactive map view for Image Ingest. May show bathymetric or structural data not available elsewhere.

---

## Source F — GPS Nautical Charts Static Map (scrape-able preview)

The GPS Nautical Charts page for Reindeer Lake renders a static nautical chart image that includes depth contours and named features — more detail than the interactive app.

**URL:**
```
https://www.gpsnauticalcharts.com/main/nautical-chart/ca_sk_reindeer_lake_sk-reindeer-lake-nautical-chart.html
```

**Integration task (Image Ingest — immediate):**
Screenshot this page at maximum zoom over sections of the lake → upload via Image Ingest → Claude Vision extracts depth contour labels and named features. Work through the lake systematically in overlapping sections.

**Integration task (tile layer — advanced):**
Inspect the page's network requests to find the XYZ tile URL the map uses. If it follows standard `{z}/{x}/{y}` format, add it as a "Nautical Depth" tile layer in `LayerControl.jsx`.

---

## Source G — Lakepedia (lake facts + map preview)

Lakepedia has a Reindeer Lake entry with a map preview and basic lake data.

**URL:**
```
https://www.lakepedia.com/lake/reindeer.html
```

**Use case:** Screenshot for Image Ingest. Secondary source — useful if it shows any named features not in other sources.

---

## Source H — Canada Topo Maps App (Saskatchewan Orthophotos)

The Canada Topo Maps app on Android/iOS includes Saskatchewan Orthophotos as a layer — aerial photography that shows the lake surface, island shapes, and tributary mouths in detail. While the app itself can't be integrated, its data source can be:

**Saskatchewan Orthophoto WMS:**
```
https://navigator.point.gis.sk.ca/arcgis/services/Imagery/SaskOrthophoto/ImageServer/WMSServer
```

**Integration task:**
Add as a tile layer "SK Aerial Photos" in `LayerControl.jsx`. This is government aerial photography, higher resolution than commercial satellite tiles for the Reindeer Lake area, and it's free.

---

## Source I — Avenza Maps (two products available)

Two separate Avenza map products exist for Reindeer Lake — both are paid but usable via the Image Ingest pipeline:

**Product 1 — Fish Canada Map (fishing-specific):**
```
https://store.avenza.com/products/reindeer-lake-saskatchewan-fish-canada-map-the-xperience-map
```
Fishing-focused, likely shows hotspots, structure, and species locations.

**Product 2 — Backroad Mapbooks Topo (recreation topo):**
```
https://store.avenza.com/products/map118-reindeer-lake-saskatchewan-backroad-mapbooks-map
```
Full recreation topo with logging roads, trails, campgrounds, paddling routes.

**Both are georeferenced PDFs** — usable in Avenza Maps app with GPS overlay OR screenshot into ReindeerMap Image Ingest. The Backroad Mapbooks version (Map118) is the digital version of the paper map we've referenced throughout — same content, but usable on phone immediately without waiting for shipping.

---

## Source J — Southend Community & Norvil Olson Recreation Site

Southend has a NASA satellite map on its Wikipedia page showing the full south portion of Reindeer Lake with island detail. Also: Norvil Olson Campground is 2km east of Nordic Lodge — add to landmarks.

**Add to landmarks.json:**
```json
{ "name": "Norvil Olson Campground", "lat": 56.345, "lng": -103.205, "type": "camp", "notes": "Provincial recreation site at south end of lake. 2km west of Nordic Lodge." },
{ "name": "Big Island (Southend)", "lat": 56.330, "lng": -103.243, "type": "general", "notes": "Southend community is situated on Big Island at the southern tip of Reindeer Lake." }
```

---

## Implementation Order for V3

| Task | Time | Value |
|---|---|---|
| SK Bathymetric WMS tile overlay (Source A, Approach A) | 1 hr | First depth data on the map |
| Atlas of Canada CanVec WMS tile (Source C) | 30 min | Best river/creek labeling |
| SK Orthophoto WMS tile (Source H) | 30 min | High-res aerial imagery |
| Screenshot GPS Nautical Charts → Image Ingest (Source F) | 30 min/section | Depth contours extracted immediately |
| Screenshot SK Bathy viewer → Image Ingest (Source A screenshot) | 30 min | Depth sounding values |
| Toporama GeoTIFF overlay (Source B) | 3 hrs | Best topo overlay if CORS allows |
| Avenza Backroad Mapbooks purchase → Image Ingest (Source I) | 30 min after purchase | Comprehensive topo immediately |
| landmarks.json additions from Source J | 15 min | Southend detail |

**Fastest depth data today:** Screenshot `https://gisappl.saskatchewan.ca/Html5Ext/?viewer=bathy` over Reindeer Lake, upload via Image Ingest. Claude Vision will extract the depth sounding numbers and plot them as depth markers. No code needed.

**Best code addition:** Source C (Atlas of Canada WMS) — one tile URL gives you the official Canadian national base map with rivers, named features, and waterways already labeled in English, overlaid at exact coordinates.
