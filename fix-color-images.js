// Script to add proper color-specific images to the Mini Peony Candle
const API_BASE = 'http://localhost:3000/api/admin/products';

// First, let's get the actual product ID from the logs
// The console shows the product is working, so we need to find its UUID

async function getProductUUID() {
  try {
    // We can see from the console that images are coming from Supabase storage
    // The actual product exists and has a proper UUID, we just need to find it

    // From the logs, we can see the API calls are successful for certain calls
    // Let's check if we can find the product ID by looking at recent server logs

    console.log('🔍 Based on the console logs, the product exists and is working.');
    console.log('🔍 Only "Sunset Orange" has color-specific images, others have empty arrays.');
    console.log('🔍 We need to update the color variants to add proper image URLs.');

    return null; // We'll need to get this from the browser or database
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Function to update color images for a specific product
async function updateColorImages(productId) {
  try {
    console.log('🎨 Updating color images for product:', productId);

    // Get current colors
    const colorsResponse = await fetch(`${API_BASE}/${productId}/colors`);
    if (!colorsResponse.ok) {
      throw new Error(`Failed to fetch colors: ${colorsResponse.status}`);
    }

    const currentColors = await colorsResponse.json();
    console.log('📋 Current colors:', currentColors);

    // Update colors with proper image URLs
    const updatedColors = currentColors.map(color => {
      let imageUrls = [];

      switch(color.color_name) {
        case 'Rose Pink':
          imageUrls = [
            'https://images.unsplash.com/photo-1602726248832-4ab10d4e3ca3?w=500&h=500&fit=crop&ixlib=rb-4.0.3',
            'https://images.unsplash.com/photo-1602726248832-4ab10d4e3ca3?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=110'
          ];
          break;
        case 'Sunset Orange':
          // Keep existing image if it has one, or add new ones
          imageUrls = color.image_urls && color.image_urls.length > 0
            ? color.image_urls
            : [
                'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&ixlib=rb-4.0.3',
                'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=105'
              ];
          break;
        case 'Vanilla':
          imageUrls = [
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop&ixlib=rb-4.0.3',
            'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=500&fit=crop&ixlib=rb-4.0.3&brightness=115'
          ];
          break;
        default:
          imageUrls = color.image_urls || [];
      }

      return {
        ...color,
        image_urls: imageUrls
      };
    });

    console.log('🔄 Updated colors with images:', updatedColors);

    // Update the product with new color data
    const updateResponse = await fetch(API_BASE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: { id: productId },
        colors: updatedColors,
        images: [] // Keep existing images
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update: ${errorText}`);
    }

    console.log('✅ Successfully updated color images!');
    console.log('🔗 Test at: http://localhost:3000/products/mini-peony-candle');

    return true;
  } catch (error) {
    console.error('❌ Error updating color images:', error);
    return false;
  }
}

// Manual function to update a specific product UUID
async function updateColorsForProduct(uuid) {
  console.log('🎯 Updating colors for UUID:', uuid);
  return await updateColorImages(uuid);
}

// Instructions for manual use
console.log('📝 To fix the color images:');
console.log('1. Open browser console at http://localhost:3000/products/mini-peony-candle');
console.log('2. Look for the actual product UUID in the API calls');
console.log('3. Use: updateColorsForProduct("your-uuid-here")');
console.log('');
console.log('💡 From the logs, we know:');
console.log('   - Rose Pink has empty image_urls: []');
console.log('   - Sunset Orange has 1 image');
console.log('   - Vanilla has empty image_urls: []');

if (typeof module !== 'undefined') {
  module.exports = { updateColorsForProduct, updateColorImages };
}

// Try to help identify the UUID
console.log('🔍 Check the Network tab or console for API calls like:');
console.log('   GET /api/admin/products/[UUID]/colors');
console.log('   Use that UUID with updateColorsForProduct()');