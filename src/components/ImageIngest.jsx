import { useRef, useState } from 'react'

export default function ImageIngest({ loading, error, onFileSelected, onUrlSubmit }) {
  const fileInputRef = useRef(null)
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState('upload')

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  const handlePaste = (e) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'))
    if (item) onFileSelected(item.getAsFile())
  }

  return (
    <div className="h-full flex flex-col bg-white p-4 space-y-4" onPaste={handlePaste}>
      <h2 className="font-semibold text-lg">Import Map Features</h2>

      <div className="flex gap-2">
        <button
          className={`flex-1 min-h-[44px] rounded-lg border ${mode === 'upload' ? 'bg-lake text-white border-lake' : 'border-gray-300'}`}
          onClick={() => setMode('upload')}
        >
          Upload Image
        </button>
        <button
          className={`flex-1 min-h-[44px] rounded-lg border ${mode === 'url' ? 'bg-lake text-white border-lake' : 'border-gray-300'}`}
          onClick={() => setMode('url')}
        >
          Paste URL
        </button>
      </div>

      {mode === 'upload' && (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg gap-3">
          <p className="text-sm text-gray-500 px-6 text-center">
            Take a photo, choose from camera roll, or paste an image (desktop)
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-6 rounded-lg bg-lake text-white"
          >
            Choose Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {mode === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            className="w-full border border-gray-200 rounded-lg p-2 text-sm min-h-[44px]"
            placeholder="https://example.com/map.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={() => url && onUrlSubmit(url)}
            className="w-full min-h-[44px] rounded-lg bg-lake text-white"
          >
            Extract Features
          </button>
        </div>
      )}

      {loading && <p className="text-center text-sm text-gray-500">Analyzing image with Claude Vision…</p>}
      {error && <p className="text-center text-sm text-red-600">{error.message}</p>}
    </div>
  )
}
