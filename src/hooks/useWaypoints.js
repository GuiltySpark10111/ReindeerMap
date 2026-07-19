import { useCallback, useEffect, useState } from 'react'
import { supabase, getDeviceId } from '../lib/supabase'

const LOCAL_CACHE_KEY = 'reindeermap_waypoints_cache'
const OFFLINE_QUEUE_KEY = 'reindeermap_offline_queue'

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY)) ?? []
  } catch {
    return []
  }
}

function writeCache(waypoints) {
  localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(waypoints))
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY)) ?? []
  } catch {
    return []
  }
}

function writeQueue(queue) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

export function useWaypoints() {
  const [waypoints, setWaypoints] = useState(readCache)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const deviceId = getDeviceId()

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('waypoints')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError)
    } else {
      setWaypoints(data)
      writeCache(data)
      setError(null)
    }
    setLoading(false)
  }, [deviceId])

  const flushQueue = useCallback(async () => {
    const queue = readQueue()
    if (queue.length === 0) return
    for (const op of queue) {
      if (op.type === 'upsert') {
        await supabase.from('waypoints').upsert(op.payload)
      } else if (op.type === 'delete') {
        await supabase.from('waypoints').delete().eq('id', op.id)
      }
    }
    writeQueue([])
    await refresh()
  }, [refresh])

  useEffect(() => {
    refresh()
    const onOnline = () => flushQueue()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [refresh, flushQueue])

  const addWaypoint = useCallback(
    async (waypoint) => {
      const payload = { ...waypoint, device_id: deviceId }
      const optimistic = [{ ...payload, id: payload.id ?? crypto.randomUUID() }, ...waypoints]
      setWaypoints(optimistic)
      writeCache(optimistic)

      if (!navigator.onLine) {
        writeQueue([...readQueue(), { type: 'upsert', payload: optimistic[0] }])
        return optimistic[0]
      }

      const { data, error: upsertError } = await supabase
        .from('waypoints')
        .insert(payload)
        .select()
        .single()

      if (upsertError) {
        writeQueue([...readQueue(), { type: 'upsert', payload }])
        setError(upsertError)
        return optimistic[0]
      }
      await refresh()
      return data
    },
    [waypoints, deviceId, refresh]
  )

  const updateWaypoint = useCallback(
    async (id, updates) => {
      const payload = { ...updates, id, device_id: deviceId, updated_at: new Date().toISOString() }
      const optimistic = waypoints.map((w) => (w.id === id ? { ...w, ...payload } : w))
      setWaypoints(optimistic)
      writeCache(optimistic)

      if (!navigator.onLine) {
        writeQueue([...readQueue(), { type: 'upsert', payload }])
        return
      }

      const { error: updateError } = await supabase.from('waypoints').update(payload).eq('id', id)
      if (updateError) {
        writeQueue([...readQueue(), { type: 'upsert', payload }])
        setError(updateError)
      } else {
        await refresh()
      }
    },
    [waypoints, deviceId, refresh]
  )

  const deleteWaypoint = useCallback(
    async (id) => {
      const optimistic = waypoints.filter((w) => w.id !== id)
      setWaypoints(optimistic)
      writeCache(optimistic)

      if (!navigator.onLine) {
        writeQueue([...readQueue(), { type: 'delete', id }])
        return
      }

      const { error: deleteError } = await supabase.from('waypoints').delete().eq('id', id)
      if (deleteError) {
        writeQueue([...readQueue(), { type: 'delete', id }])
        setError(deleteError)
      }
    },
    [waypoints]
  )

  return { waypoints, loading, error, addWaypoint, updateWaypoint, deleteWaypoint, refresh }
}
