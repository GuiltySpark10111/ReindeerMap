import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { REINDEER_LAKE_CENTER, DEFAULT_ZOOM, MARKER_TYPES } from '../lib/geoUtils'
import { TILE_LAYERS, OVERLAY_TILE_LAYERS } from '../hooks/useMapLayers'

const LONG_PRESS_MS = 500
const LONG_PRESS_MOVE_TOLERANCE_PX = 12

function markerIcon(type, { outlined = false, dimmed = false } = {}) {
  const meta = MARKER_TYPES[type] ?? MARKER_TYPES.general
  const fill = outlined ? 'transparent' : meta.color
  const border = meta.color
  const opacity = dimmed ? 0.6 : 1
  return L.divIcon({
    className: 'reindeermap-marker',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${fill};border:3px solid ${border};opacity:${opacity};box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  })
}

function LongPressHandler({ onLongPress }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    let timer = null
    let startLatLng = null
    let startPoint = null

    const clear = () => {
      if (timer) clearTimeout(timer)
      timer = null
    }

    const start = (point, latlng) => {
      startPoint = point
      startLatLng = latlng
      clear()
      timer = setTimeout(() => {
        onLongPress(startLatLng)
      }, LONG_PRESS_MS)
    }

    const move = (point) => {
      if (!startPoint) return
      const dx = point.x - startPoint.x
      const dy = point.y - startPoint.y
      if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_MOVE_TOLERANCE_PX) clear()
    }

    const onMouseDown = (e) => {
      if (e.originalEvent.button !== 0) return
      start(e.containerPoint, e.latlng)
    }
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return
      const point = map.mouseEventToContainerPoint(e.touches[0])
      const latlng = map.containerPointToLatLng(point)
      start(point, latlng)
    }

    map.on('mousedown', onMouseDown)
    map.on('mousemove', (e) => move(e.containerPoint))
    map.on('mouseup', clear)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return
      move(map.mouseEventToContainerPoint(e.touches[0]))
    })
    container.addEventListener('touchend', clear)
    container.addEventListener('touchcancel', clear)
    map.on('dragstart', clear)

    return () => {
      clear()
      map.off('mousedown', onMouseDown)
      map.off('dragstart', clear)
    }
  }, [map, onLongPress])

  return null
}

function GpsButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleClick = () => {
    setLocating(true)
    map.locate({ setView: true, maxZoom: 14 })
    map.once('locationfound', () => setLocating(false))
    map.once('locationerror', () => setLocating(false))
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-3 right-3 z-[1000] bg-white rounded-full w-11 h-11 shadow-md flex items-center justify-center active:scale-95"
      aria-label="Go to my location"
    >
      {locating ? '…' : '📍'}
    </button>
  )
}

export default function MapView({
  waypoints,
  landmarks,
  extractedFeatures = [],
  baseLayer,
  overlays,
  typeFilter,
  onLongPress,
  onMarkerClick,
  onOpenLayers,
  mapRef,
}) {
  const internalRef = useRef(null)
  const tile = TILE_LAYERS[baseLayer]

  const visibleWaypoints = overlays.personalSpots
    ? waypoints.filter((w) => !typeFilter || w.type === typeFilter)
    : []

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[REINDEER_LAKE_CENTER.lat, REINDEER_LAKE_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        className="w-full h-full"
        ref={(instance) => {
          internalRef.current = instance
          if (mapRef) mapRef.current = instance
        }}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} />
        {overlays.openSeaMap && (
          <TileLayer
            url={OVERLAY_TILE_LAYERS.openSeaMap.url}
            attribution={OVERLAY_TILE_LAYERS.openSeaMap.attribution}
            opacity={OVERLAY_TILE_LAYERS.openSeaMap.opacity}
          />
        )}
        <LongPressHandler onLongPress={onLongPress} />
        <GpsButton />

        {overlays.landmarks &&
          landmarks.map((lm, i) => (
            <Marker key={`landmark-${i}`} position={[lm.lat, lm.lng]} icon={markerIcon(lm.type, { outlined: true })}>
              <Popup>
                <strong>{lm.name}</strong>
                <br />
                {lm.notes}
              </Popup>
            </Marker>
          ))}

        {visibleWaypoints.map((w) => (
          <Marker
            key={w.id}
            position={[w.lat, w.lng]}
            icon={markerIcon(w.type)}
            eventHandlers={{ click: () => onMarkerClick?.(w) }}
          />
        ))}

        {overlays.extractedFeatures &&
          extractedFeatures
            .filter((f) => f.included)
            .map((f) => (
              <Marker
                key={`extract-${f._reviewId}`}
                position={[f.lat, f.lng]}
                icon={markerIcon(f.type, { dimmed: true })}
              >
                <Popup>
                  <strong>{f.name}</strong>
                  <br />
                  {f.notes}
                  <br />
                  <em>confidence: {f.confidence}</em>
                </Popup>
              </Marker>
            ))}
      </MapContainer>

      <button
        onClick={onOpenLayers}
        className="absolute top-3 right-16 z-[1000] bg-white rounded-full w-11 h-11 shadow-md flex items-center justify-center active:scale-95"
        aria-label="Toggle layers"
      >
        🗂️
      </button>
    </div>
  )
}
