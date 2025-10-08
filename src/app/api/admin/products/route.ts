import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.stock_quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, stock_quantity' },
        { status: 400 }
      )
    }

    // Insert product using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}