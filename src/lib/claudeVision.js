// Claude Vision calls are proxied through a Supabase Edge Function
// (supabase/functions/claude-vision) so the Anthropic API key never
// reaches the browser bundle. See that function for the extraction prompt.

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-vision`

async function urlToBase64(url) {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ base64: reader.result.split(',')[1], mediaType: blob.type })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ base64: reader.result.split(',')[1], mediaType: file.type })
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function extractFeatures({ base64, mediaType }) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ base64, mediaType }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? `Claude Vision request failed (${response.status})`)
  }
  return data.features ?? []
}

export async function extractFeaturesFromFile(file) {
  const image = await fileToBase64(file)
  return extractFeatures(image)
}

export async function extractFeaturesFromUrl(url) {
  const image = await urlToBase64(url)
  return extractFeatures(image)
}
