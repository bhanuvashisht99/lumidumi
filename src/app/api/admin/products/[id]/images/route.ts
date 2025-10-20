import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order')

    if (error) {
      console.error('Error fetching product images:', error)
      return NextResponse.json(
        { error: 'Failed to fetch product images' },
        { status: 500 }
      )
    }

    // Filter out problematic URLs before sending to frontend
    const filteredData = (data || []).filter(image => {
      if (!image.url || typeof image.url !== 'string') return false
      if (image.url.includes('blob:')) {
        console.log('API: Filtering out blob URL:', image.url)
        return false
      }
      // Temporarily allow HEIC files for display (they may not load in all browsers)
      // if (image.url.toLowerCase().includes('.heic') || image.url.toLowerCase().includes('.heif')) {
      //   console.log('API: Filtering out HEIC file:', image.url)
      //   return false
      // }
      return image.url.startsWith('http') || image.url.startsWith('/') || image.url.startsWith('data:')
    })

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}