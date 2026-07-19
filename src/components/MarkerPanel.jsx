import { useEffect, useState } from 'react'
import { MARKER_TYPES, SPECIES_OPTIONS, feetToMeters, metersToFeet } from '../lib/geoUtils'

const emptyForm = {
  name: '',
  type: 'general',
  notes: '',
  depth_ft: '',
  species: [],
  trip_date: new Date().toISOString().slice(0, 10),
}

export default function MarkerPanel({ waypoint, position, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState(emptyForm)
  const [depthUnit, setDepthUnit] = useState('ft')

  useEffect(() => {
    if (waypoint) {
      setForm({
        name: waypoint.name ?? '',
        type: waypoint.type ?? 'general',
        notes: waypoint.notes ?? '',
        depth_ft: waypoint.depth_ft ?? '',
        species: waypoint.species ?? [],
        trip_date: waypoint.trip_date ?? new Date().toISOString().slice(0, 10),
      })
    } else {
      setForm(emptyForm)
    }
  }, [waypoint])

  const toggleSpecies = (s) => {
    setForm((f) => ({
      ...f,
      species: f.species.includes(s) ? f.species.filter((x) => x !== s) : [...f.species, s],
    }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const depth_ft = form.depth_ft === '' ? null : Number(form.depth_ft)
    onSave({
      ...form,
      lat: waypoint?.lat ?? position?.lat,
      lng: waypoint?.lng ?? position?.lng,
      depth_ft: depthUnit === 'ft' ? depth_ft : metersToFeet(depth_ft),
      depth_m: depthUnit === 'm' ? depth_ft : feetToMeters(depth_ft),
      source: waypoint?.source ?? 'manual',
    })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300" />
      <div className="p-4 space-y-4">
        <input
          className="w-full text-lg border-b border-gray-200 py-2 focus:outline-none focus:border-lake"
          placeholder="Spot name"
          maxLength={40}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoFocus
        />

        <div>
          <div className="text-sm text-gray-500 mb-1">Type</div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MARKER_TYPES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setForm((f) => ({ ...f, type: key }))}
                className={`min-h-[44px] rounded-lg border-2 text-xs flex flex-col items-center justify-center py-2 ${
                  form.type === key ? 'border-lake bg-blue-50' : 'border-gray-200'
                }`}
              >
                <span style={{ color: meta.color }} className="text-xl leading-none">●</span>
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-lg p-2 text-sm"
          placeholder="Notes"
          maxLength={500}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm min-h-[44px]"
            placeholder={`Depth (${depthUnit})`}
            value={form.depth_ft}
            onChange={(e) => setForm((f) => ({ ...f, depth_ft: e.target.value }))}
          />
          <button
            className="min-h-[44px] px-3 rounded-lg border border-gray-200 text-sm"
            onClick={() => setDepthUnit((u) => (u === 'ft' ? 'm' : 'ft'))}
          >
            {depthUnit}
          </button>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Species</div>
          <div className="flex flex-wrap gap-2">
            {SPECIES_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecies(s)}
                className={`px-3 py-2 rounded-full text-xs border min-h-[44px] ${
                  form.species.includes(s) ? 'bg-lake text-white border-lake' : 'border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <input
          type="date"
          className="w-full border border-gray-200 rounded-lg p-2 text-sm min-h-[44px]"
          value={form.trip_date}
          onChange={(e) => setForm((f) => ({ ...f, trip_date: e.target.value }))}
        />

        <div className="flex gap-2 pt-2">
          {waypoint && (
            <button
              onClick={() => onDelete(waypoint.id)}
              className="min-h-[44px] px-4 rounded-lg border border-red-300 text-red-600 text-sm"
            >
              Delete
            </button>
          )}
          <button onClick={onCancel} className="min-h-[44px] px-4 rounded-lg border border-gray-300 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 min-h-[44px] rounded-lg bg-lake text-white font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
