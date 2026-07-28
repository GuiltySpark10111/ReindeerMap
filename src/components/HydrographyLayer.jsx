import { GeoJSON } from 'react-leaflet'
import { useOSMHydrography } from '../hooks/useOSMHydrography'

const LAKE_STYLE = { color: '#3b82f6', weight: 1, fillColor: '#3b82f6', fillOpacity: 0.15 }
const ISLAND_STYLE = { color: '#16a34a', weight: 1, fillColor: '#22c55e', fillOpacity: 0.3 }
const RIVER_STYLE = { color: '#3b82f6', weight: 2 }

export default function HydrographyLayer({ enabled }) {
  const { data, loading, error } = useOSMHydrography(enabled)

  if (!enabled) return null

  return (
    <>
      {loading && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-3 py-1 text-xs shadow-md">
          Loading waterways…
        </div>
      )}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] bg-red-50 text-red-700 rounded-full px-3 py-1 text-xs shadow-md">
          Failed to load waterways
        </div>
      )}
      {data && (
        <>
          <GeoJSON data={data.lake} style={LAKE_STYLE} />
          <GeoJSON data={data.islands} style={ISLAND_STYLE} />
          <GeoJSON data={data.rivers} style={RIVER_STYLE} />
        </>
      )}
    </>
  )
}
