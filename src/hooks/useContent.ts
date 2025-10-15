'use client'

import { useState, useEffect, useCallback } from 'react'
import { ContentData } from '@/lib/content'

// Client-side hook for admin panel and dynamic updates
export function useContentSection(section: string) {
  const [content, setContent] = useState<ContentData>({})
  const [loading, setLoading] = useState(false)

  const loadContent = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/content?section=${section}`)
      if (response.ok) {
        const { data } = await response.json()
        if (data?.additional_data) {
          setContent(data.additional_data)
        }
      }
    } catch (error) {
      console.error(`Error loading ${section} content:`, error)
    } finally {
      setLoading(false)
    }
  }, [section])

  useEffect(() => {
    loadContent()

    // Listen for admin panel updates
    const handleContentUpdate = (event: MessageEvent) => {
      if (event.data.type === 'CONTENT_UPDATED' && event.data.section === section) {
        loadContent()
      }
    }

    window.addEventListener('message', handleContentUpdate)
    return () => window.removeEventListener('message', handleContentUpdate)
  }, [loadContent, section])

  return { content, loading, refresh: loadContent }
}