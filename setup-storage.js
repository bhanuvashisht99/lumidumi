const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupStorage() {
  console.log('Setting up Supabase Storage for product images...')

  try {
    // Create a public bucket for product images
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
        fileSizeLimit: 5242880 // 5MB limit
      })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "product-images" already exists')
      } else {
        console.error('Error creating bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Created bucket "product-images"')
    }

    // List existing buckets to verify
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
    } else {
      console.log('\n📁 Available storage buckets:')
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      })
    }

    console.log('\n🎉 Storage setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Go to your Supabase Dashboard → Storage')
    console.log('2. Open the "product-images" bucket')
    console.log('3. Upload your candle images')
    console.log('4. Copy the public URLs to update your products')

    // Generate example URL format
    const exampleUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/soft-whisper.jpg`
    console.log('\n🔗 Image URLs will look like:')
    console.log(exampleUrl)

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupStorage()