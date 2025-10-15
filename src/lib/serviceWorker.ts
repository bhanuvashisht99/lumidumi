'use client'

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('SW registered: ', registration)

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'AUTH_DATA') {
            // Handle auth data from service worker
            const authData = event.data.payload
            if (authData && authData.refresh_token) {
              // Trigger auth restoration
              window.dispatchEvent(new CustomEvent('sw-auth-restore', {
                detail: authData
              }))
            }
          }
        })

      } catch (error) {
        console.log('SW registration failed: ', error)
      }
    })
  }
}

export function saveAuthToSW(authData: any) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SAVE_AUTH',
      payload: authData
    })
  }
}

export function getAuthFromSW(): Promise<any> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        resolve(event.data.payload)
      }

      navigator.serviceWorker.controller.postMessage({
        type: 'GET_AUTH'
      }, [channel.port2])
    } else {
      resolve(null)
    }
  })
}

export function clearAuthFromSW() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_AUTH'
    })
  }
}