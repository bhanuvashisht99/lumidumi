const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// List of old sample products to remove
const oldProductSlugs = [
  'vanilla-dreams',
  'lavender-bliss',
  'citrus-burst',
  'sandalwood-serenity',
  'rose-garden',
  'ocean-breeze'
]

async function removeOldProducts() {
  console.log('Removing old sample products...')

  try {
    // First, let's see what products exist
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching products:', fetchError)
      return
    }

    console.log('\nCurrent products in database:')
    allProducts.forEach(product => {
      console.log(`- ${product.name} (${product.slug})`)
    })

    // Remove old sample products
    const { data: deletedProducts, error: deleteError } = await supabase
      .from('products')
      .delete()
      .in('slug', oldProductSlugs)
      .select()

    if (deleteError) {
      console.error('Error deleting old products:', deleteError)
      return
    }

    if (deletedProducts && deletedProducts.length > 0) {
      console.log('\n✅ Removed old sample products:')
      deletedProducts.forEach(product => {
        console.log(`- ${product.name}`)
      })
    } else {
      console.log('\n✅ No old sample products found to remove')
    }

    // Show remaining products
    const { data: remainingProducts, error: remainingError } = await supabase
      .from('products')
      .select('id, name, slug, price')
      .order('created_at', { ascending: true })

    if (remainingError) {
      console.error('Error fetching remaining products:', remainingError)
      return
    }

    console.log('\n🎉 Current LumiDumi catalog products:')
    remainingProducts.forEach(product => {
      console.log(`- ${product.name} - ₹${product.price}`)
    })

    console.log(`\nTotal products: ${remainingProducts.length}`)

  } catch (error) {
    console.error('Failed to remove old products:', error)
  }
}

removeOldProducts()