import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const customOrderData = await request.json()

    // Validate required fields
    if (!customOrderData.name || !customOrderData.email || !customOrderData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, description' },
        { status: 400 }
      )
    }

    // Insert custom order using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('custom_orders')
      .insert([customOrderData])
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
    console.error('Error creating custom order:', error)
    return NextResponse.json(
      { error: 'Failed to create custom order' },
      { status: 500 }
    )
  }
}