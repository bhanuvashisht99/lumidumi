const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Example image URLs - you can replace these with your actual Supabase Storage URLs
const imageUpdates = {
  'soft-whisper': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/soft-whisper.jpg',
  'daisy-flower-jar-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/daisy-flower-jar.jpg',
  'rose-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/rose-candle.jpg',
  'floating-daisy': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/floating-daisy.jpg',
  'everglow-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/everglow-candle.jpg',
  'mini-glass-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/mini-glass-candle.jpg',
  'minis-set-of-3': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/minis-set.jpg',
  'mini-glass-gel-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/mini-glass-gel.jpg',
  'mini-peony-candle': 'https://krhzruqeoubnvuvbazmo.supabase.co/storage/v1/object/public/product-images/mini-peony.jpg'
}

async function updateProductImages() {
  console.log('Updating product images...')

  try {
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, image_url')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    console.log(`\nFound ${products.length} products to update:`)

    for (const product of products) {
      const newImageUrl = imageUpdates[product.slug]

      if (newImageUrl && newImageUrl !== product.image_url) {
        // Update the product with new image URL
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: newImageUrl })
          .eq('id', product.id)

        if (updateError) {
          console.error(`❌ Error updating ${product.name}:`, updateError)
        } else {
          console.log(`✅ Updated ${product.name} image`)
        }
      } else {
        console.log(`⏭️  Skipped ${product.name} (no new image or already up to date)`)
      }
    }

    console.log('\n🎉 Image update process complete!')
    console.log('\n💡 To use this script:')
    console.log('1. Upload your images to Supabase Storage')
    console.log('2. Copy the public URLs')
    console.log('3. Update the imageUpdates object in this script')
    console.log('4. Run: node update-product-images.js')

  } catch (error) {
    console.error('Update failed:', error)
  }
}

// Show current products and their image status
async function showProductStatus() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('name, slug, image_url')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    console.log('\n📋 Current LumiDumi Products:')
    console.log('=' .repeat(60))

    products.forEach((product, index) => {
      const hasImage = product.image_url && product.image_url !== '/images/products/' + product.slug + '.jpg'
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Image: ${hasImage ? '✅ Has custom image' : '❌ Using placeholder'}`)
      if (product.image_url) {
        console.log(`   URL: ${product.image_url}`)
      }
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the status check by default
showProductStatus()

// Uncomment the line below to actually update images
// updateProductImages()