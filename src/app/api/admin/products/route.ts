import { NextRequest, NextResponse } from 'next/server'
import { validateAdminAuth } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabase'

// Use service role key for admin operations
const supabase = supabaseAdmin

export async function POST(request: NextRequest) {
  // Validate admin authentication
  const authResult = await validateAdminAuth(request)
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.error?.includes('permissions') ? 403 : 401 }
    )
  }
  try {
    const { productData, images = [], colors = [] } = await request.json()

    console.log('🔥 API: Received product creation request')
    console.log('Product data:', productData)
    console.log('Images count:', images.length)
    console.log('Images:', images)
    console.log('Colors count:', colors.length)

    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.stock_quantity) {
      console.error('❌ API: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, stock_quantity' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let baseSlug = productData.slug || productData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    let uniqueSlug = baseSlug
    let counter = 1

    // Check for existing slug and make it unique
    while (true) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle()

      if (!existingProduct) {
        break // Slug is unique
      }

      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Clean productData to only include valid columns
    const cleanProductData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock_quantity: productData.stock_quantity,
      category_id: productData.category_id || null,
      weight: productData.weight || null,
      burn_time: productData.burn_time || null,
      scent_description: productData.scent_description || null,
      ingredients: productData.ingredients || null,
      care_instructions: productData.care_instructions || null,
      sku: productData.sku || null,
      tags: productData.tags || '[]',
      dimensions: productData.dimensions || null,
      material: productData.material || null,
      is_active: productData.is_active !== false,
      featured: productData.featured === true,
      slug: uniqueSlug
    }

    // Start transaction
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([cleanProductData])
      .select()
      .single()

    if (productError) {
      console.error('Product creation error:', productError)
      return NextResponse.json(
        { error: `Database error: ${productError.message}` },
        { status: 500 }
      )
    }

    // Insert images if provided
    if (images.length > 0) {
      console.log('🖼️ API: Inserting images for product:', product.id)
      const imageInserts = images.map((img: any, index: number) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || `${productData.name} - Image ${index + 1}`,
        is_primary: img.is_primary || index === 0,
        sort_order: img.sort_order || index,
        optimized_url: img.optimized_url,
        thumbnail_url: img.thumbnail_url
      }))

      console.log('Image inserts:', imageInserts)

      const { data: insertedImages, error: imagesError } = await supabase
        .from('product_images')
        .insert(imageInserts)
        .select()

      if (imagesError) {
        console.error('❌ API: Images creation error:', imagesError)
        // Don't fail the whole operation, just log the error
      } else {
        console.log('✅ API: Images inserted successfully:', insertedImages)
      }
    } else {
      console.log('ℹ️ API: No images to insert')
    }

    // Insert colors if provided
    if (colors.length > 0) {
      const colorInserts = colors.map((color: any) => {
        // Base color data that always exists
        const baseColor: any = {
          product_id: product.id,
          color_name: color.color_name,
          color_code: color.color_code,
          stock_quantity: color.stock_quantity || 0,
          price_modifier: color.price_modifier || 0,
          is_available: color.is_available !== false
        }

        // Try to add image fields - will fail silently if columns don't exist
        try {
          if (color.image_urls) {
            baseColor.image_urls = JSON.stringify(color.image_urls || [])
          }
          if (color.primary_image) {
            baseColor.primary_image = color.primary_image || null
          }
        } catch (error) {
          // Ignore if columns don't exist yet
          console.log('Image columns not available yet, skipping image data')
        }

        return baseColor
      })

      const { error: colorsError } = await supabase
        .from('product_colors')
        .insert(colorInserts)

      if (colorsError) {
        console.error('Colors creation error:', colorsError)
        // Don't fail the whole operation, just log the error
      }
    }

    const response = NextResponse.json({ data: product })
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Validate admin authentication
  const authResult = await validateAdminAuth(request)
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.error?.includes('permissions') ? 403 : 401 }
    )
  }

  try {
    const { productData, images = [], colors = [] } = await request.json()
    const { id, ...updateData } = productData

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!updateData.name || !updateData.description || !updateData.price || !updateData.stock_quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, stock_quantity' },
        { status: 400 }
      )
    }

    // Generate unique slug for updates
    let baseSlug = updateData.slug || updateData.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    let uniqueSlug = baseSlug
    let counter = 1

    // Check for existing slug (excluding current product)
    while (true) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', uniqueSlug)
        .neq('id', id)
        .maybeSingle()

      if (!existingProduct) {
        break // Slug is unique
      }

      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Clean updateData to only include valid columns
    const cleanUpdateData = {
      name: updateData.name,
      description: updateData.description,
      price: updateData.price,
      stock_quantity: updateData.stock_quantity,
      category_id: updateData.category_id || null,
      weight: updateData.weight || null,
      burn_time: updateData.burn_time || null,
      scent_description: updateData.scent_description || null,
      ingredients: updateData.ingredients || null,
      care_instructions: updateData.care_instructions || null,
      sku: updateData.sku || null,
      tags: updateData.tags || '[]',
      dimensions: updateData.dimensions || null,
      material: updateData.material || null,
      is_active: updateData.is_active !== false,
      featured: updateData.featured === true,
      slug: uniqueSlug
    }

    // Update product using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('products')
      .update(cleanUpdateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    // Update images - delete existing and insert new ones
    if (images.length >= 0) {
      // Delete existing images
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id)

      // Insert new images if any
      if (images.length > 0) {
        const imageInserts = images.map((img: any, index: number) => ({
          product_id: id,
          url: img.url,
          alt_text: img.alt_text || `${updateData.name} - Image ${index + 1}`,
          is_primary: img.is_primary || index === 0,
          sort_order: img.sort_order || index,
          optimized_url: img.optimized_url,
          thumbnail_url: img.thumbnail_url
        }))

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts)

        if (imagesError) {
          console.error('Images update error:', imagesError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    // Update colors - delete existing and insert new ones
    if (colors.length >= 0) {
      // Delete existing colors
      await supabase
        .from('product_colors')
        .delete()
        .eq('product_id', id)

      // Insert new colors if any
      if (colors.length > 0) {
        const colorInserts = colors.map((color: any) => {
          // Base color data that always exists
          const baseColor: any = {
            product_id: id,
            color_name: color.color_name,
            color_code: color.color_code,
            stock_quantity: color.stock_quantity || 0,
            price_modifier: color.price_modifier || 0,
            is_available: color.is_available !== false
          }

          // Try to add image fields - will fail silently if columns don't exist
          try {
            if (color.image_urls) {
              baseColor.image_urls = JSON.stringify(color.image_urls || [])
            }
            if (color.primary_image) {
              baseColor.primary_image = color.primary_image || null
            }
          } catch (error) {
            // Ignore if columns don't exist yet
            console.log('Image columns not available yet, skipping image data')
          }

          return baseColor
        })

        const { error: colorsError } = await supabase
          .from('product_colors')
          .insert(colorInserts)

        if (colorsError) {
          console.error('Colors update error:', colorsError)
          // Don't fail the whole operation, just log the error
        }
      }
    }

    const response = NextResponse.json({ data })
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Delete product using service role (bypasses RLS)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ success: true })
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    return response
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}