import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

      return {
        ...color,
        image_urls: imageUrls
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