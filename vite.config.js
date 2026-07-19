import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ReindeerMap/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'ReindeerMap',
        short_name: 'ReindeerMap',
        description: 'Personal fishing map for Reindeer Lake SK',
        start_url: '/ReindeerMap/',
        display: 'standalone',
        background_color: '#0d4f8c',
        theme_color: '#0d4f8c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(server\.arcgisonline\.com|tile\.opentopomap\.org|tile\.openstreetmap\.org|\{s\}\.tile\.openstreetmap\.org)\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
