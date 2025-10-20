// Script to create a sample Mini Peony Candle with color variants for testing
const API_BASE = 'http://localhost:3000/api/admin/products';

const sampleProduct = {
  productData: {
    name: "Mini Peony Candle Demo",
    description: "A beautiful mini candle with the delicate scent of peonies. Handcrafted with premium wax and natural fragrance oils.",
    price: 899,
    stock_quantity: 50,
    scent_description: "Delicate peony petals with hints of rose and fresh greenery",
    weight: 120,
    burn_time: 25,
    dimensions: "6cm x 6cm x 7cm",
    material: "Soy wax blend",
    slug: "mini-peony-candle-demo",
    is_active: true,
    featured: true
  },
  images: [
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
  ],
  colors: [
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
  ]
};

async function createSampleProduct() {
  try {
    console.log('Creating sample Mini Peony Candle...');

    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleProduct)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Sample product created successfully!');
    console.log('Product ID:', result.data.id);
    console.log('Visit: http://localhost:3000/products/mini-peony-candle-demo');

    return result.data;
  } catch (error) {
    console.error('❌ Error creating sample product:', error);
  }
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  createSampleProduct();
}

module.exports = { createSampleProduct, sampleProduct };