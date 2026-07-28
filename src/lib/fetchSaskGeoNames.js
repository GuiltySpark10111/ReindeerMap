const SERVICE_URL =
  'https://gis.saskatchewan.ca/arcgis/rest/services/CanadianGeoNamesWater/MapServer/0/query'

// Reindeer Lake bounding box per MAP_Sources.md / MAP_SOURCES_V2.md clipping rule.
const BBOX = { xmin: -103.33, ymin: 56.19, xmax: -101.46, ymax: 58.18 }

const CACHE_KEY = 'reindeermap_sk_geonames'
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedAt, data } = JSON.parse(raw)
    if (!savedAt || Date.now() - savedAt > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // best-effort cache; ignore quota/availability errors
  }
}

export async function fetchSaskGeoNames({ force = false } = {}) {
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  // NOTE: the envelope must be a comma-separated "xmin,ymin,xmax,ymax" string —
  // the JSON-object envelope form (as documented in some ArcGIS examples)
  // returns a 400 "Failed to execute query" from this particular service.
  const params = new URLSearchParams({
    where: '1=1',
    geometry: `${BBOX.xmin},${BBOX.ymin},${BBOX.xmax},${BBOX.ymax}`,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'GEONAME,GENERIC,CATEGORY',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson',
  })

  const res = await fetch(`${SERVICE_URL}?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`SK GIS API error: ${res.status}`)
  }
  const geojson = await res.json()
  if (geojson.error) {
    throw new Error(`SK GIS API error: ${geojson.error.message}`)
  }

  writeCache(geojson)
  return geojson
}
