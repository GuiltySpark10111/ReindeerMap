import { useCallback, useState } from 'react'
import { extractFeaturesFromFile, extractFeaturesFromUrl } from '../lib/claudeVision'

export function useImageIngest() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ingestFile = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const extracted = await extractFeaturesFromFile(file)
      setFeatures(extracted.map((f, i) => ({ ...f, _reviewId: i, included: true })))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const ingestUrl = useCallback(async (url) => {
    setLoading(true)
    setError(null)
    try {
      const extracted = await extractFeaturesFromUrl(url)
      setFeatures(extracted.map((f, i) => ({ ...f, _reviewId: i, included: true })))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateFeature = useCallback((reviewId, updates) => {
    setFeatures((prev) => prev.map((f) => (f._reviewId === reviewId ? { ...f, ...updates } : f)))
  }, [])

  const clear = useCallback(() => {
    setFeatures([])
    setError(null)
  }, [])

  return { features, loading, error, ingestFile, ingestUrl, updateFeature, clear }
}
