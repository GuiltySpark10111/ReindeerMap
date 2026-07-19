import { useCallback, useRef, useState } from 'react'
import MapView from './components/MapView'
import MarkerPanel from './components/MarkerPanel'
import LayerControl from './components/LayerControl'
import WaypointList from './components/WaypointList'
import ImageIngest from './components/ImageIngest'
import FeatureReview from './components/FeatureReview'
import { useWaypoints } from './hooks/useWaypoints'
import { useImageIngest } from './hooks/useImageIngest'
import { useMapLayers } from './hooks/useMapLayers'
import landmarks from './data/landmarks.json'

const TABS = { MAP: 'map', LIST: 'list', IMPORT: 'import' }

export default function App() {
  const [tab, setTab] = useState(TABS.MAP)
  const [panelState, setPanelState] = useState(null) // { waypoint } | { position } | null
  const mapRef = useRef(null)
  const [layersOpen, setLayersOpen] = useState(false)

  const { waypoints, addWaypoint, updateWaypoint, deleteWaypoint } = useWaypoints()
  const mapLayers = useMapLayers()
  const ingest = useImageIngest()

  const flyTo = useCallback((waypoint) => {
    setTab(TABS.MAP)
    setTimeout(() => {
      mapRef.current?.flyTo([waypoint.lat, waypoint.lng], 14)
      setPanelState({ waypoint })
    }, 50)
  }, [])

  const handleSave = async (data) => {
    if (panelState?.waypoint) {
      await updateWaypoint(panelState.waypoint.id, data)
    } else {
      await addWaypoint(data)
    }
    setPanelState(null)
  }

  const handleDelete = async (id) => {
    await deleteWaypoint(id)
    setPanelState(null)
  }

  const handleSaveFeatures = async (selectedOnly) => {
    const toSave = ingest.features.filter((f) => (selectedOnly ? f.included : true))
    for (const f of toSave) {
      await addWaypoint({
        name: f.name,
        type: f.type,
        lat: f.lat,
        lng: f.lng,
        notes: f.notes,
        species: [],
        trip_date: null,
        source: 'image_extract',
      })
    }
    ingest.clear()
    setTab(TABS.MAP)
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        {tab === TABS.MAP && (
          <MapView
            mapRef={mapRef}
            waypoints={waypoints}
            landmarks={landmarks}
            extractedFeatures={ingest.features}
            baseLayer={mapLayers.baseLayer}
            overlays={mapLayers.overlays}
            typeFilter={mapLayers.typeFilter}
            onLongPress={(latlng) => setPanelState({ position: { lat: latlng.lat, lng: latlng.lng } })}
            onMarkerClick={(w) => setPanelState({ waypoint: w })}
            onOpenLayers={() => setLayersOpen(true)}
          />
        )}

        {tab === TABS.LIST && (
          <WaypointList waypoints={waypoints} onSelect={flyTo} onDelete={deleteWaypoint} />
        )}

        {tab === TABS.IMPORT && (
          <>
            {ingest.features.length > 0 ? (
              <FeatureReview
                features={ingest.features}
                onUpdateFeature={ingest.updateFeature}
                onSaveAll={() => handleSaveFeatures(false)}
                onSaveSelected={() => handleSaveFeatures(true)}
                onDiscard={ingest.clear}
              />
            ) : (
              <ImageIngest
                loading={ingest.loading}
                error={ingest.error}
                onFileSelected={ingest.ingestFile}
                onUrlSubmit={ingest.ingestUrl}
              />
            )}
          </>
        )}

        {panelState && (
          <MarkerPanel
            waypoint={panelState.waypoint}
            position={panelState.position}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setPanelState(null)}
          />
        )}

        <LayerControl open={layersOpen} onClose={() => setLayersOpen(false)} {...mapLayers} />
      </div>

      <nav className="flex border-t border-gray-200 bg-white">
        <button
          className={`flex-1 min-h-[56px] text-sm font-medium ${tab === TABS.MAP ? 'text-lake' : 'text-gray-400'}`}
          onClick={() => setTab(TABS.MAP)}
        >
          + Add Spot
        </button>
        <button
          className={`flex-1 min-h-[56px] text-sm font-medium ${tab === TABS.LIST ? 'text-lake' : 'text-gray-400'}`}
          onClick={() => setTab(TABS.LIST)}
        >
          List
        </button>
        <button
          className={`flex-1 min-h-[56px] text-sm font-medium ${tab === TABS.IMPORT ? 'text-lake' : 'text-gray-400'}`}
          onClick={() => setTab(TABS.IMPORT)}
        >
          Import
        </button>
      </nav>
    </div>
  )
}
