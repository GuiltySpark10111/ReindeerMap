import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { useSaskGeoNames } from '../hooks/useSaskGeoNames'

// MAP_SOURCES_V2.md's Priority 1 styling scheme (BAY/ISLAND/RIVER/POINT/CAPE)
// was written before checking the live service's actual field values — this
// "Water" layer only ever returns GENERIC of Lake/River/Channel/Rapids, so the
// color mapping below is based on what the API actually sends.
const GENERIC_COLORS = {
  Lake: '#06b6d4',
  River: '#3b82f6',
  Channel: '#3b82f6',
  Rapids: '#f97316',
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

export default function SaskGeoNamesLayer({ enabled }) {
  const { data, loading, error } = useSaskGeoNames(enabled)

  if (!enabled) return null

  return (
    <>
      {loading && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-3 py-1 text-xs shadow-md">
          Loading named features…
        </div>
      )}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs shadow-md">
          Failed to load named features
        </div>
      )}
      {data?.features.map((f, i) => {
        const [lng, lat] = f.geometry.coordinates
        const color = GENERIC_COLORS[f.properties.GENERIC] ?? DEFAULT_COLOR
        return (
          <Marker key={`skgn-${i}`} position={[lat, lng]} icon={nameIcon(color)}>
            <Popup>
              <strong>{f.properties.GEONAME}</strong>
              <br />
              {f.properties.GENERIC}
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
