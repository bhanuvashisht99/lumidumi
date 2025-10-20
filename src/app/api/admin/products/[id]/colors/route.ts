import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateAdminAuth } from '@/lib/adminAuth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .eq('product_id', id)
      .order('color_name')

    if (error) {
      console.error('Error fetching product colors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product colors' },
        { status: 500 }
      )
    }

    // Parse JSON fields
    const parsedData = (data || []).map(color => {
      let imageUrls = []
      try {
        if (color.image_urls) {
          // Handle both string and array formats
          if (typeof color.image_urls === 'string') {
            imageUrls = JSON.parse(color.image_urls)
          } else if (Array.isArray(color.image_urls)) {
            imageUrls = color.image_urls
          }
        }
      } catch (error) {
        console.error('Error parsing image_urls for color:', color.id, error)
        imageUrls = []
      }

      // Filter out problematic URLs from image_urls
      const filteredImageUrls = imageUrls.filter((url: any) => {
        if (!url || typeof url !== 'string') return false
        if (url.includes('blob:')) {
          console.log('API: Filtering out blob URL from color:', url)
          return false
        }
        // Temporarily allow HEIC files for display (they may not load in all browsers)
        // if (url.toLowerCase().includes('.heic') || url.toLowerCase().includes('.heif')) {
        //   console.log('API: Filtering out HEIC file from color:', url)
        //   return false
        // }
        return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')
      })

      return {
        ...color,
        image_urls: filteredImageUrls
      }
    })

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error fetching product colors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product colors' },
      { status: 500 }
    )
  }
}