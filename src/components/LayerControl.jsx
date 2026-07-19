import { TILE_LAYERS } from '../hooks/useMapLayers'
import { MARKER_TYPES } from '../lib/geoUtils'

export default function LayerControl({
  open,
  onClose,
  baseLayer,
  setBaseLayer,
  overlays,
  toggleOverlay,
  typeFilter,
  setTypeFilter,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2000] bg-black/30" onClick={onClose}>
      <div
        className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Layers</h2>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] text-xl">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Base map</div>
          {Object.entries(TILE_LAYERS).map(([key, meta]) => (
            <label key={key} className="flex items-center gap-2 py-2 min-h-[44px]">
              <input
                type="radio"
                name="baseLayer"
                checked={baseLayer === key}
                onChange={() => setBaseLayer(key)}
              />
              {meta.label}
            </label>
          ))}
        </div>

        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">Overlays</div>
          <label className="flex items-center justify-between py-2 min-h-[44px]">
            <span>Personal Spots</span>
            <input
              type="checkbox"
              checked={overlays.personalSpots}
              onChange={() => toggleOverlay('personalSpots')}
            />
          </label>
          <label className="flex items-center justify-between py-2 min-h-[44px]">
            <span>Landmarks</span>
            <input type="checkbox" checked={overlays.landmarks} onChange={() => toggleOverlay('landmarks')} />
          </label>
          <label className="flex items-center justify-between py-2 min-h-[44px]">
            <span>Extracted Features</span>
            <input
              type="checkbox"
              checked={overlays.extractedFeatures}
              onChange={() => toggleOverlay('extractedFeatures')}
            />
          </label>
        </div>

        {overlays.personalSpots && (
          <div>
            <div className="text-sm text-gray-500 mb-2">Filter Personal Spots by type</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter(null)}
                className={`px-3 py-2 rounded-full text-xs border min-h-[44px] ${
                  !typeFilter ? 'bg-lake text-white border-lake' : 'border-gray-300'
                }`}
              >
                All
              </button>
              {Object.entries(MARKER_TYPES).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-2 rounded-full text-xs border min-h-[44px] ${
                    typeFilter === key ? 'bg-lake text-white border-lake' : 'border-gray-300'
                  }`}
                >
                  <span style={{ color: meta.color }}>●</span> {meta.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
