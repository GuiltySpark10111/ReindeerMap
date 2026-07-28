import { useEffect, useState } from 'react'
import { fetchOSMHydrography } from '../data/fetchOSMHydrography'

export function useOSMHydrography(enabled) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || data) return
    let cancelled = false

    setLoading(true)
    setError(null)
    fetchOSMHydrography()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, data])

  return { data, loading, error }
}
