const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Reindeer Lake bounding box per MAP_Sources.md Source 1 / general clipping rule.
const BBOX = { south: 56.19, west: -103.33, north: 58.18, east: -101.46 }

const QUERY = `[out:json][timeout:60][bbox:${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}];
(
  relation["name"="Reindeer Lake"]["natural"="water"];
  way["name"="Cochrane River"];
  way["name"="Wathaman River"];
  way["name"="Reindeer River"];
);
out geom;`

const CACHE_KEY = 'reindeermap_osm_hydrography'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

function pointsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}

function closeRing(ring) {
  return pointsEqual(ring[0], ring[ring.length - 1]) ? ring : [...ring, ring[0]]
}

// Reindeer Lake's shoreline/islands come back from Overpass as ~120k raw
// points (1300+ islands) — simplify before caching/rendering so the SVG/
// canvas layer and the localStorage cache stay usable on mobile. ~10m
// tolerance at this latitude, well under what's visible at map zoom 10+.
const SIMPLIFY_EPSILON_DEG = 0.0001

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

function simplify(points, epsilon) {
  if (points.length <= 2) return points
  let maxDist = 0
  let index = 0
  const end = points.length - 1
  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end])
    if (dist > maxDist) {
      maxDist = dist
      index = i
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon)
    const right = simplify(points.slice(index), epsilon)
    return left.slice(0, -1).concat(right)
  }
  return [points[0], points[end]]
}

// Relation members arrive as separate way segments in an arbitrary order;
// stitch them end-to-end into closed rings before they can be used as polygons.
function stitchRings(segments) {
  const remaining = segments.map((s) => s.slice())
  const rings = []
  while (remaining.length) {
    let ring = remaining.shift()
    let progress = true
    while (progress && !pointsEqual(ring[0], ring[ring.length - 1])) {
      progress = false
      for (let i = 0; i < remaining.length; i++) {
        const seg = remaining[i]
        const ringEnd = ring[ring.length - 1]
        if (pointsEqual(ringEnd, seg[0])) {
          ring = ring.concat(seg.slice(1))
        } else if (pointsEqual(ringEnd, seg[seg.length - 1])) {
          ring = ring.concat(seg.slice(0, -1).reverse())
        } else {
          continue
        }
        remaining.splice(i, 1)
        progress = true
        break
      }
    }
    rings.push(ring)
  }
  return rings
}

function wayToLineFeature(way) {
  return {
    type: 'Feature',
    properties: { name: way.tags?.name ?? 'Waterway', kind: 'river' },
    geometry: {
      type: 'LineString',
      coordinates: way.geometry.map((pt) => [pt.lon, pt.lat]),
    },
  }
}

// Islands (relation members with role "inner") are rendered as separate
// green-filled polygons on top of the lake fill rather than true polygon
// holes — visually equivalent here and much simpler than nested multipolygons.
function relationToFeatures(relation) {
  const outer = []
  const inner = []
  for (const member of relation.members ?? []) {
    if (member.type !== 'way' || !member.geometry || member.geometry.length < 2) continue
    const coords = member.geometry.map((pt) => [pt.lon, pt.lat])
    ;(member.role === 'inner' ? inner : outer).push(coords)
  }

  const name = relation.tags?.name ?? 'Water body'

  const lake = stitchRings(outer)
    .filter((ring) => ring.length >= 4)
    .map((ring) => ({
      type: 'Feature',
      properties: { name, kind: 'lake' },
      geometry: { type: 'Polygon', coordinates: [simplify(closeRing(ring), SIMPLIFY_EPSILON_DEG)] },
    }))

  const islands = stitchRings(inner)
    .filter((ring) => ring.length >= 4)
    .map((ring, i) => ({
      type: 'Feature',
      properties: { name: `${name} island ${i + 1}`, kind: 'island' },
      geometry: { type: 'Polygon', coordinates: [simplify(closeRing(ring), SIMPLIFY_EPSILON_DEG)] },
    }))

  return { lake, islands }
}

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

export async function fetchOSMHydrography({ force = false } = {}) {
  if (!force) {
    const cached = readCache()
    if (cached) return cached
  }

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(QUERY)}`,
  })
  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status}`)
  }
  const payload = await res.json()

  const lakeFeatures = []
  const islandFeatures = []
  const riverFeatures = []

  for (const el of payload.elements ?? []) {
    if (el.type === 'relation') {
      const { lake, islands } = relationToFeatures(el)
      lakeFeatures.push(...lake)
      islandFeatures.push(...islands)
    } else if (el.type === 'way' && el.geometry?.length > 1) {
      riverFeatures.push(wayToLineFeature(el))
    }
  }

  const geojson = {
    lake: { type: 'FeatureCollection', features: lakeFeatures },
    islands: { type: 'FeatureCollection', features: islandFeatures },
    rivers: { type: 'FeatureCollection', features: riverFeatures },
  }

  writeCache(geojson)
  return geojson
}
