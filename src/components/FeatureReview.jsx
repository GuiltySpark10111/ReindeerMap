import { MARKER_TYPES } from '../lib/geoUtils'

const CONFIDENCE_STYLES = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-red-100 text-red-700',
}

export default function FeatureReview({ features, onUpdateFeature, onSaveAll, onSaveSelected, onDiscard }) {
  if (features.length === 0) return null

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-lg">Review Extracted Features</h2>
        <p className="text-xs text-gray-500">{features.length} feature(s) found</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {features.map((f) => (
          <div key={f._reviewId} className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={f.included}
                onChange={(e) => onUpdateFeature(f._reviewId, { included: e.target.checked })}
                className="min-h-[24px] min-w-[24px]"
              />
              <input
                className="flex-1 border-b border-gray-200 py-1 text-sm"
                value={f.name}
                onChange={(e) => onUpdateFeature(f._reviewId, { name: e.target.value })}
              />
              <span className={`text-xs px-2 py-1 rounded-full ${CONFIDENCE_STYLES[f.confidence] ?? ''}`}>
                {f.confidence}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pl-8">
              <select
                className="border border-gray-200 rounded-lg p-2 text-xs min-h-[36px]"
                value={f.type}
                onChange={(e) => onUpdateFeature(f._reviewId, { type: e.target.value })}
              >
                {Object.entries(MARKER_TYPES).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.0001"
                className="w-28 border border-gray-200 rounded-lg p-2 text-xs min-h-[36px]"
                value={f.lat}
                onChange={(e) => onUpdateFeature(f._reviewId, { lat: Number(e.target.value) })}
              />
              <input
                type="number"
                step="0.0001"
                className="w-28 border border-gray-200 rounded-lg p-2 text-xs min-h-[36px]"
                value={f.lng}
                onChange={(e) => onUpdateFeature(f._reviewId, { lng: Number(e.target.value) })}
              />
            </div>
            {f.notes && <p className="pl-8 text-xs text-gray-500">{f.notes}</p>}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-100 flex gap-2">
        <button onClick={onDiscard} className="min-h-[44px] px-4 rounded-lg border border-gray-300 text-sm">
          Discard
        </button>
        <button
          onClick={onSaveSelected}
          className="flex-1 min-h-[44px] rounded-lg border border-lake text-lake text-sm"
        >
          Save Selected
        </button>
        <button onClick={onSaveAll} className="flex-1 min-h-[44px] rounded-lg bg-lake text-white text-sm">
          Save All
        </button>
      </div>
    </div>
  )
}
