import { useState } from 'react'

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
  street: {
    label: 'Street/OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

export function useMapLayers() {
  const [baseLayer, setBaseLayer] = useState('satellite')
  const [overlays, setOverlays] = useState({
    personalSpots: true,
    landmarks: true,
    extractedFeatures: true,
  })
  const [typeFilter, setTypeFilter] = useState(null)

  const toggleOverlay = (key) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return { baseLayer, setBaseLayer, overlays, toggleOverlay, typeFilter, setTypeFilter }
}
