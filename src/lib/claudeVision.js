const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const EXTRACTION_PROMPT = `
You are analyzing a fishing or navigation map image for Reindeer Lake, Saskatchewan, Canada.

Extract every identifiable geographic feature visible in this image and return ONLY a JSON array. No preamble, no explanation, no markdown — pure JSON only.

Each feature object must have:
{
  "name": "feature name or label visible on map",
  "type": "one of: walleye | pike | reef | creek_mouth | camp | hazard | depth | general",
  "lat": estimated decimal latitude (57.0-58.2 range for Reindeer Lake),
  "lng": estimated decimal longitude (-103.5 to -101.5 range for Reindeer Lake),
  "notes": "any additional context visible (depth numbers, species notes, etc.)",
  "confidence": "high | medium | low"
}

If the image has a scale bar or coordinate grid, use it to estimate positions precisely.
If no coordinates are visible, estimate positions relative to known landmarks (Southend at 56.335N 103.246W, Tate Island at 57.40N 102.40W, Brochet at 57.89N 101.68W).
If a feature cannot be reasonably placed, still include it with confidence: "low".
If the image is not a map, return an empty array [].
`

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

function parseFeatureResponse(text) {
  const trimmed = text.trim()
  const jsonStart = trimmed.indexOf('[')
  const jsonEnd = trimmed.lastIndexOf(']')
  if (jsonStart === -1 || jsonEnd === -1) return []
  try {
    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1))
  } catch {
    return []
  }
}

async function extractFeatures({ base64, mediaType }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Claude Vision request failed (${response.status}): ${errBody}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '[]'
  return parseFeatureResponse(text)
}

export async function extractFeaturesFromFile(file) {
  const image = await fileToBase64(file)
  return extractFeatures(image)
}

export async function extractFeaturesFromUrl(url) {
  const image = await urlToBase64(url)
  return extractFeatures(image)
}
