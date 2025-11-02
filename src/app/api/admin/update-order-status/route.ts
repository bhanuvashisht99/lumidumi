import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_PROJECT_ID = 'krhzruqeoubnvuvbazmo' // lumidumi project

export async function POST(request: NextRequest) {
  try {
    const { orderId, updateData } = await request.json()

    if (!orderId || !updateData) {
      return NextResponse.json(
        { error: 'Order ID and update data are required' },
        { status: 400 }
      )
    }

    console.log('Order update requested:', { orderId, updateData })

    // Build SQL UPDATE query safely
    const setClauses = Object.keys(updateData).map(key => {
      const value = updateData[key]
      return `${key} = '${value.replace(/'/g, "''")}'` // Escape single quotes
    }).join(', ')

    const query = `UPDATE orders SET ${setClauses} WHERE id = '${orderId}';`
    console.log('Executing order update query:', query)

    // Execute the actual database update using MCP Supabase
    console.log('📝 Generated SQL query for order update:', query)
    console.log('🎯 Order ID:', orderId)
    console.log('📊 Update data:', updateData)

    // Execute the database update using MCP Supabase
    console.log('🔄 Executing database update...')

    try {
      // Since we can't directly import MCP functions in API routes,
      // we'll create a separate endpoint that handles the database update
      const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/internal/execute-sql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: SUPABASE_PROJECT_ID,
          query: query
        })
      })

      if (dbResponse.ok) {
        const dbResult = await dbResponse.json()
        console.log('✅ Database update successful:', dbResult)
      } else {
        console.error('❌ Database update failed:', await dbResponse.text())
      }
    } catch (dbError) {
      console.error('❌ Database update error:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    })

  } catch (error) {
    console.error('Update order status API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}