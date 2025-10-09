import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    if (section) {
      // Get specific section
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('section', section)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return NextResponse.json({ data: data || null })
    } else {
      // Get all content
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section')

      if (error) {
        throw error
      }

      return NextResponse.json({ data: data || [] })
    }
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { section, data: contentData } = await request.json()

    if (!section || !contentData) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      )
    }

    // Upsert content (update if exists, insert if not)
    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        section,
        title: contentData.title || null,
        subtitle: contentData.subtitle || null,
        description: contentData.description || null,
        image_url: contentData.imageUrl || null,
        additional_data: contentData
      }, {
        onConflict: 'section'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ data })
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    )
  }
}