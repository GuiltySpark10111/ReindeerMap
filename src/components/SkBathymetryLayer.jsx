import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { dynamicMapLayer } from 'esri-leaflet'

const SERVICE_URL = 'https://gis.saskatchewan.ca/arcgis/rest/services/Bathymetric/MapServer'

// MAP_SOURCES_V3.md Source A suggests L.tileLayer.wms() against this
// service's /export endpoint, but it has no WMS interface (WMSServer 400s)
// — it's a plain Esri REST MapServer, so esri-leaflet's dynamicMapLayer
// (which speaks that REST export protocol) is used instead.
export default function SkBathymetryLayer({ enabled }) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return

    const layer = dynamicMapLayer({ url: SERVICE_URL, opacity: 0.6 }).addTo(map)
    return () => {
      map.removeLayer(layer)
    }
  }, [enabled, map])

  return null
}
