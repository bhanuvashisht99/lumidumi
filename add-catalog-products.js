const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const products = [
  {
    name: "Soft Whisper",
    description: "Handcrafted from eco-friendly soy wax in cemetery holder, this candle fills your space with a soothing fragrance and warm ambiance",
    price: 499,
    stock_quantity: 50,
    weight: 230,
    burn_time: 9, // Average of 8-10 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Eco-friendly soy wax, natural fragrances",
    care_instructions: "Trim wick to 1/4 inch before lighting. Do not burn for more than 4 hours at a time.",
    featured: true,
    is_active: true,
    slug: "soft-whisper",
    image_url: "/images/products/soft-whisper.jpg" // Placeholder
  },
  {
    name: "Daisy Flower Jar Candle",
    description: "A handcrafted candle made from eco-friendly soy wax, offering a delightful blend of fragrances to create a soothing and inviting ambiance",
    price: 349,
    stock_quantity: 50,
    weight: 250,
    burn_time: 7, // Average of 7-8 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Eco-friendly soy wax, natural fragrances",
    care_instructions: "Trim wick to 1/4 inch before lighting. Do not burn for more than 4 hours at a time.",
    featured: true,
    is_active: true,
    slug: "daisy-flower-jar-candle",
    image_url: "/images/products/daisy-flower-jar.jpg" // Placeholder
  },
  {
    name: "Rose Candle",
    description: "Handcrafted from gel wax, this candle features a real rose inside and fills your space with a soothing fragrance and warm glow",
    price: 399,
    stock_quantity: 30,
    weight: 155,
    burn_time: 5, // Average of 5-6 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Gel wax, real rose, natural fragrances",
    care_instructions: "Handle with care due to gel wax. Trim wick to 1/4 inch before lighting.",
    featured: true,
    is_active: true,
    slug: "rose-candle",
    image_url: "/images/products/rose-candle.jpg" // Placeholder
  },
  {
    name: "Floating Daisy",
    description: "A handcrafted floating candle made from eco-friendly soy wax, featuring a delicate daisy that adds charm and serenity to any water setting",
    price: 85,
    stock_quantity: 100,
    weight: 16,
    burn_time: 4, // Average of 3-5 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Eco-friendly soy wax, natural fragrances, decorative daisy",
    care_instructions: "Use in water bowl. Ensure wick stays dry before lighting.",
    featured: false,
    is_active: true,
    slug: "floating-daisy",
    image_url: "/images/products/floating-daisy.jpg" // Placeholder
  },
  {
    name: "EverGlow Candle",
    description: "Handcrafted from eco-friendly soy wax, this candle fills your space with a soothing fragrance and warm glow, offering an extended, long-lasting burn",
    price: 400,
    stock_quantity: 40,
    weight: 200,
    burn_time: 32, // Average of 30-35 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Eco-friendly soy wax, natural fragrances",
    care_instructions: "Trim wick to 1/4 inch before lighting. Allow wax to pool completely across surface.",
    featured: true,
    is_active: true,
    slug: "everglow-candle",
    image_url: "/images/products/everglow-candle.jpg" // Placeholder
  },
  {
    name: "Mini Glass Candle",
    description: "Hand-poured soy wax in a delicate jar, designed to create a peaceful ambiance and a subtle, inviting scent",
    price: 150,
    stock_quantity: 80,
    weight: 155,
    burn_time: 9, // Average of 8-10 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Soy wax, natural fragrances, glass jar",
    care_instructions: "Trim wick to 1/4 inch before lighting. Handle glass with care.",
    featured: false,
    is_active: true,
    slug: "mini-glass-candle",
    image_url: "/images/products/mini-glass-candle.jpg" // Placeholder
  },
  {
    name: "Minis (Set of 3)",
    description: "Set of 3 handcrafted soy wax mini candles, spreading a gentle glow and soothing fragrance",
    price: 99,
    stock_quantity: 60,
    weight: 45, // 15g each x 3
    burn_time: 3, // Average of 2-4 hours per candle
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Soy wax, natural fragrances",
    care_instructions: "Trim wicks to 1/4 inch before lighting. Use on heat-resistant surface.",
    featured: false,
    is_active: true,
    slug: "minis-set-of-3",
    image_url: "/images/products/minis-set.jpg" // Placeholder
  },
  {
    name: "Mini Glass Gel Candle",
    description: "A handcrafted mini glass gel candle with sparkling glitter, creating a charming glow and a soothing ambiance",
    price: 150,
    stock_quantity: 70,
    weight: 155,
    burn_time: 5, // Average of 4-6 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Gel wax, sparkling glitter, natural fragrances, glass jar",
    care_instructions: "Handle with care due to gel wax. Trim wick to 1/4 inch before lighting.",
    featured: false,
    is_active: true,
    slug: "mini-glass-gel-candle",
    image_url: "/images/products/mini-glass-gel.jpg" // Placeholder
  },
  {
    name: "Mini Peony Candle",
    description: "Mini soy wax candle with a delicate rose, spreading a gentle glow and soothing fragrance",
    price: 75,
    stock_quantity: 90,
    weight: 30,
    burn_time: 5, // Average of 4-6 hours
    scent_description: "Jasmine, Coffee, Rose, Lavender, Sandalwood, French, and more",
    ingredients: "Soy wax, decorative rose, natural fragrances",
    care_instructions: "Handle decorative elements with care. Trim wick to 1/4 inch before lighting.",
    featured: false,
    is_active: true,
    slug: "mini-peony-candle",
    image_url: "/images/products/mini-peony.jpg" // Placeholder
  }
]

async function addProducts() {
  console.log('Adding LumiDumi catalog products...')

  for (const product of products) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()

      if (error) {
        console.error(`Error adding ${product.name}:`, error)
      } else {
        console.log(`✅ Added: ${product.name} - ₹${product.price}`)
      }
    } catch (error) {
      console.error(`Failed to add ${product.name}:`, error)
    }
  }

  console.log('\n🎉 All LumiDumi catalog products have been added!')
  console.log('Next steps:')
  console.log('1. Update product images in the admin panel')
  console.log('2. Create product categories if needed')
  console.log('3. Adjust stock quantities as needed')
}

addProducts()