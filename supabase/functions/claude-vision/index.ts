// Supabase Edge Function: proxies Claude Vision image analysis so the
// Anthropic API key stays server-side (never shipped to the browser bundle).
// Deploy: supabase functions deploy claude-vision
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { base64, mediaType } = await req.json()
    if (!base64 || !mediaType) {
      return new Response(JSON.stringify({ error: 'base64 and mediaType are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
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

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text()
      return new Response(JSON.stringify({ error: `Claude Vision request failed: ${errBody}` }), {
        status: anthropicResponse.status,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }

    const data = await anthropicResponse.json()
    const text = data.content?.[0]?.text ?? '[]'
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']')
    const features = jsonStart === -1 || jsonEnd === -1 ? [] : JSON.parse(text.slice(jsonStart, jsonEnd + 1))

    return new Response(JSON.stringify({ features }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
