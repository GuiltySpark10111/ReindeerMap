import { useEffect, useState } from 'react'

export const TILE_LAYERS = {
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  topo: {
    label: 'Topo',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
  },
  esriTopo: {
    label: 'Esri Topo',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  street: {
    label: 'Street/OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

// Toggleable tile overlays that sit on top of the base layer (not mutually exclusive with it).
export const OVERLAY_TILE_LAYERS = {
  openSeaMap: {
    label: 'Nautical Markers',
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    attribution: '&copy; OpenSeaMap contributors',
    opacity: 0.85,
  },
}

const STORAGE_KEY = 'reindeermap_layer_prefs'
const DEFAULT_OVERLAYS = {
  personalSpots: true,
  landmarks: true,
  extractedFeatures: true,
  openSeaMap: false,
  hydrography: false,
  placeNames: false,
  skGeoNames: false,
  nrcanNames: false,
}

function readPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return {
      baseLayer: stored?.baseLayer ?? 'satellite',
      overlays: { ...DEFAULT_OVERLAYS, ...(stored?.overlays ?? {}) },
    }
  } catch {
    return { baseLayer: 'satellite', overlays: DEFAULT_OVERLAYS }
  }
}

export function useMapLayers() {
  const initial = readPrefs()
  const [baseLayer, setBaseLayer] = useState(initial.baseLayer)
  const [overlays, setOverlays] = useState(initial.overlays)
  const [typeFilter, setTypeFilter] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseLayer, overlays }))
  }, [baseLayer, overlays])

  const toggleOverlay = (key) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return { baseLayer, setBaseLayer, overlays, toggleOverlay, typeFilter, setTypeFilter }
}
