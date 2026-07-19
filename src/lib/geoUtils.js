export const REINDEER_LAKE_CENTER = { lat: 57.3956, lng: -102.1427 }
export const DEFAULT_ZOOM = 10

export const MARKER_TYPES = {
  walleye: { color: '#eab308', symbol: 'fish', label: 'Walleye' },
  pike: { color: '#22c55e', symbol: 'fish', label: 'Pike' },
  reef: { color: '#ef4444', symbol: 'anchor', label: 'Reef' },
  creek_mouth: { color: '#3b82f6', symbol: 'droplet', label: 'Creek Mouth' },
  camp: { color: '#f97316', symbol: 'tent', label: 'Camp' },
  hazard: { color: '#000000', symbol: 'warning', label: 'Hazard' },
  depth: { color: '#a855f7', symbol: 'ruler', label: 'Depth' },
  general: { color: '#6b7280', symbol: 'pin', label: 'General' },
}

export const SPECIES_OPTIONS = ['Walleye', 'Pike', 'Lake Trout', 'Whitefish', 'Grayling', 'Other']

export function feetToMeters(ft) {
  return ft == null ? null : ft * 0.3048
}

export function metersToFeet(m) {
  return m == null ? null : m / 0.3048
}

export function isWithinReindeerLakeBounds(lat, lng) {
  return lat >= 56.0 && lat <= 58.5 && lng >= -104.0 && lng <= -101.0
}
