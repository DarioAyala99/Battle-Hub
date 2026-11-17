import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve el sitio en https://<usuario>.github.io/<repo>/
// por eso el "base" tiene que ser "/<repo>/". En el workflow de deploy se setea
// VITE_BASE con el nombre del repo; en desarrollo local queda en "/".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE || '/'

  return {
    base,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'fallback.svg'],
        manifest: {
          name: 'Battle Hub - Torneos de juegos de pelea',
          short_name: 'Battle Hub',
          description: 'Gestor de torneos locales de juegos de pelea',
          theme_color: '#0f0f14',
          background_color: '#0f0f14',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          // Los datos de Supabase NO se cachean: siempre se piden a la red.
          // Las imágenes externas (logos / arte de los juegos) sí, para verlas offline.
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'imagenes',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.js']
    }
  }
})
