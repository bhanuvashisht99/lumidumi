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

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching product images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product images' },
      { status: 500 }
    )
  }
}