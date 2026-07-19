import { useMemo, useState } from 'react'
import { MARKER_TYPES } from '../lib/geoUtils'

const SWIPE_DELETE_THRESHOLD_PX = 80

function WaypointRow({ waypoint, onSelect, onDelete }) {
  const [dragX, setDragX] = useState(0)
  const [startX, setStartX] = useState(null)
  const meta = MARKER_TYPES[waypoint.type] ?? MARKER_TYPES.general

  const onTouchStart = (e) => setStartX(e.touches[0].clientX)
  const onTouchMove = (e) => {
    if (startX == null) return
    const dx = e.touches[0].clientX - startX
    if (dx < 0) setDragX(dx)
  }
  const onTouchEnd = () => {
    if (dragX < -SWIPE_DELETE_THRESHOLD_PX) {
      if (window.confirm(`Delete "${waypoint.name}"?`)) {
        onDelete(waypoint.id)
      }
    }
    setDragX(0)
    setStartX(null)
  }

  return (
    <div className="relative overflow-hidden border-b border-gray-100">
      <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center text-white text-sm">
        Delete
      </div>
      <button
        className="relative w-full text-left bg-white p-3 flex items-center gap-3 min-h-[44px]"
        style={{ transform: `translateX(${dragX}px)`, transition: startX ? 'none' : 'transform 0.2s' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => onSelect(waypoint)}
      >
        <span style={{ color: meta.color }} className="text-xl">●</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{waypoint.name}</div>
          <div className="text-xs text-gray-500 truncate">
            {meta.label}
            {waypoint.trip_date ? ` · ${waypoint.trip_date}` : ''}
          </div>
        </div>
      </button>
    </div>
  )
}

export default function WaypointList({ waypoints, onSelect, onDelete }) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState(null)

  const filtered = useMemo(() => {
    return waypoints
      .filter((w) => !filterType || w.type === filterType)
      .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [waypoints, filterType, search])

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-3 border-b border-gray-100 space-y-2">
        <input
          className="w-full border border-gray-200 rounded-lg p-2 text-sm min-h-[44px]"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterType(null)}
            className={`px-3 py-2 rounded-full text-xs border whitespace-nowrap min-h-[44px] ${
              !filterType ? 'bg-lake text-white border-lake' : 'border-gray-300'
            }`}
          >
            All
          </button>
          {Object.entries(MARKER_TYPES).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-2 rounded-full text-xs border whitespace-nowrap min-h-[44px] ${
                filterType === key ? 'bg-lake text-white border-lake' : 'border-gray-300'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 text-sm p-8">No waypoints yet</div>
        )}
        {filtered.map((w) => (
          <WaypointRow key={w.id} waypoint={w} onSelect={onSelect} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
