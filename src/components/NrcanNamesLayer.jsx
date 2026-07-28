import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import nrcanNames from '../data/nrcan/reindeer_lake_names.json'

const CATEGORY_COLORS = {
  'Water Feature': '#06b6d4',
  'Terrain Feature': '#22c55e',
  'Populated Place': '#f97316',
  'Administrative Area': '#a855f7',
  'Constructed Feature': '#6b7280',
}
const DEFAULT_COLOR = '#6b7280'

function nameIcon(color) {
  return L.divIcon({
    className: 'reindeermap-marker',
    html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,0.5);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -5],
  })
}

// Pre-filtered from NRCan's cgn_sk_csv_eng.csv (Priority 2) — committed as
// static JSON per MAP_SOURCES_V2.md, no runtime download needed.
export default function NrcanNamesLayer({ enabled }) {
  if (!enabled) return null

  return (
    <>
      {nrcanNames.map((f) => (
        <Marker
          key={f.id}
          position={[f.lat, f.lng]}
          icon={nameIcon(CATEGORY_COLORS[f.category] ?? DEFAULT_COLOR)}
        >
          <Popup>
            <strong>{f.name}</strong>
            <br />
            {f.generic}
            <br />
            <em>{f.category}</em>
          </Popup>
        </Marker>
      ))}
    </>
  )
}
