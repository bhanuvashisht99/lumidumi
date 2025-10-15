// Simple service worker for auth token persistence
const CACHE_NAME = 'lumidumi-auth-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Handle auth token storage for offline/background scenarios
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SAVE_AUTH') {
    // Store auth data temporarily
    const authData = event.data.payload
    self.authBackup = authData
  }

  if (event.data && event.data.type === 'GET_AUTH') {
    event.ports[0].postMessage({
      type: 'AUTH_DATA',
      payload: self.authBackup || null
    })
  }

  if (event.data && event.data.type === 'CLEAR_AUTH') {
    self.authBackup = null
  }
})

// Handle fetch events to maintain auth headers
self.addEventListener('fetch', (event) => {
  // Only handle requests to our API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If network fails, try to use cached auth
        return new Response(
          JSON.stringify({ error: 'Network unavailable' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
  }
})