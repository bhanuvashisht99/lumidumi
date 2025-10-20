// Script to fix the original mini-peony-candle with proper colors
const API_BASE = 'http://localhost:3000/api/admin/products';

const colorVariants = [
  {
    color_name: "Rose Pink",
    color_code: "#ff69b4",
    stock_quantity: 20,
    price_modifier: 0,
    is_available: true,
    image_urls: [
      "https://images.unsplash.com/photo-1602726248832-4ab10d4e3ca3?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1602726248832-4ab10d4e3ca3?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=110"
    ]
  },
  {
    color_name: "Sunset Orange",
    color_code: "#ff8c00",
    stock_quantity: 15,
    price_modifier: 50,
    is_available: true,
    image_urls: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=105"
    ]
  },
  {
    color_name: "Vanilla",
    color_code: "#f5deb3",
    stock_quantity: 10,
    price_modifier: -25,
    is_available: true,
    image_urls: [
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=115"
    ]
  }
];

const updatedProductData = {
  name: "Mini Peony Candle",
  description: "A beautiful mini candle with the delicate scent of peonies. Handcrafted with premium wax and natural fragrance oils.",
  price: 899,
  stock_quantity: 50,
  scent_description: "Delicate peony petals with hints of rose and fresh greenery",
  weight: 120,
  burn_time: 25,
  dimensions: "6cm x 6cm x 7cm",
  material: "Soy wax blend",
  slug: "mini-peony-candle",
  is_active: true,
  featured: true
};

const productImages = [
  {
    url: "https://images.unsplash.com/photo-1602726248832-4ab10d4e3ca3?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
    alt_text: "Mini Peony Candle - Rose Pink",
    is_primary: true,
    sort_order: 0
  },
  {
    url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
    alt_text: "Mini Peony Candle - Sunset Orange",
    is_primary: false,
    sort_order: 1
  },
  {
    url: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop&ixlib=rb-4.0.3",
    alt_text: "Mini Peony Candle - Vanilla",
    is_primary: false,
    sort_order: 2
  }
];

async function getProductBySlug(slug) {
  try {
    // Use the database function to get the product
    console.log('🔍 Getting product by slug:', slug);

    // We need to find the product via a different approach since getProductBySlug has issues
    // Let's try using the API to search for products
    const response = await fetch('http://localhost:3000/products', {
      method: 'GET'
    });

    if (!response.ok) {
      console.log('❌ Failed to get products page');
      return null;
    }

    console.log('✅ Got products page, looking for product with slug:', slug);
    return null; // We'll need to use admin panel to find the actual ID

  } catch (error) {
    console.error('❌ Error getting product:', error);
    return null;
  }
}

async function updateOriginalProduct() {
  try {
    console.log('🔄 Attempting to fix the original mini-peony-candle...');

    // Since we can't easily get the product ID, let's try updating via the slug
    // The error shows the API is trying to use ID "1", so there's likely an existing product
    // Let's try to update it directly

    // First, let's see if we can get the product ID via browser console or logs
    console.log('💡 The issue is that getProductBySlug is returning an object with a numeric ID instead of UUID');
    console.log('💡 This suggests the product exists but has ID field as "1" instead of proper UUID');
    console.log('💡 Check your database - the product might have been created with wrong ID type');

    console.log('🔧 To fix this:');
    console.log('1. Check the browser console at http://localhost:3000/products/mini-peony-candle');
    console.log('2. Look for the actual UUID in the console logs');
    console.log('3. Use that UUID to update the product with colors');

    return false;

  } catch (error) {
    console.error('❌ Error fixing original product:', error);
    return false;
  }
}

// Function to add colors to a product by UUID
async function addColorsToProduct(productId) {
  try {
    console.log('🎨 Adding colors to product:', productId);

    // First get existing colors to avoid duplicates
    const existingResponse = await fetch(`${API_BASE}/${productId}/colors`);
    const existingColors = existingResponse.ok ? await existingResponse.json() : [];

    if (existingColors.length > 0) {
      console.log('✅ Product already has colors:', existingColors.length);
      return true;
    }

    // Add colors via direct database insert (this is a workaround)
    console.log('➕ Adding color variants...');

    // We'll need to update the product with colors
    const updateData = {
      productData: { ...updatedProductData, id: productId },
      images: productImages,
      colors: colorVariants
    };

    const response = await fetch(API_BASE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to update product:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Successfully updated product with colors!');
    console.log('🔗 Visit: http://localhost:3000/products/mini-peony-candle');
    return true;

  } catch (error) {
    console.error('❌ Error adding colors:', error);
    return false;
  }
}

// Export the function for manual use
if (typeof module !== 'undefined') {
  module.exports = { updateOriginalProduct, addColorsToProduct, colorVariants };
}

// Run the diagnostic
updateOriginalProduct();