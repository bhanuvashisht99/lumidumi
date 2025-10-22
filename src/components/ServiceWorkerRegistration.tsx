'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Temporarily disable service worker to fix auth conflicts
    console.log('Service Worker registration disabled to fix auth issues')

    // Clean up any existing service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          console.log('Unregistering existing service worker')
          registration.unregister()
        })
      })
    }
  }, [])

  return null
}