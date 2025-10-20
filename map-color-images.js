// Script to properly map colors to their specific images for mini-peony-candle
const API_BASE = 'http://localhost:3000/api/admin/products';

// From your console logs, I can see the product images are stored in Supabase storage
// We need to map each color to the correct image from the 3 available images

async function findAndMapColorImages() {
  try {
    console.log('🔍 Finding mini-peony-candle product...');

    // From the browser console, we can see the product is loading correctly
    // We need to identify the correct product UUID and map the colors properly

    // From the logs, we know there are 3 product images:
    // 1. mini-peony-candle-1760017799233.jpeg (likely the main/primary)
    // 2. 1760794742718_m72qircsvuk.HEIC (second image)
    // 3. 1760807503263_1gw85c221k.HEIC (third image)

    console.log('📸 Detected 3 product images from console logs');
    console.log('🎨 Need to map these to Rose Pink, Sunset Orange, and Vanilla');

    // Based on the browser visit, let's check if we can get the current product data
    return null; // We'll need the actual UUID from the browser
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Function to update color mappings for a specific product UUID
async function mapColorsToImages(productUUID) {
  try {
    console.log('🎯 Mapping colors to images for product:', productUUID);

    // Step 1: Get current product images
    const imagesResponse = await fetch(`${API_BASE}/${productUUID}/images`);
    if (!imagesResponse.ok) {
      throw new Error(`Failed to get images: ${imagesResponse.status}`);
    }
    const images = await imagesResponse.json();
    console.log('📸 Current product images:', images);

    // Step 2: Get current colors
    const colorsResponse = await fetch(`${API_BASE}/${productUUID}/colors`);
    if (!colorsResponse.ok) {
      throw new Error(`Failed to get colors: ${colorsResponse.status}`);
    }
    const colors = await colorsResponse.json();
    console.log('🎨 Current colors:', colors);

    // Step 3: Map each color to a specific image
    const imageUrls = images.map(img => img.url);
    console.log('🔗 Available image URLs:', imageUrls);

    // Map colors to specific images (assuming 3 images for 3 colors)
    const updatedColors = colors.map((color, index) => {
      let specificImageUrls = [];

      // Assign each color to a specific image
      if (imageUrls[index]) {
        specificImageUrls = [imageUrls[index]];
      }

      // Special mapping based on color names if we want more control
      switch(color.color_name) {
        case 'Rose Pink':
          // Use first image (or most pink-looking one)
          specificImageUrls = imageUrls[0] ? [imageUrls[0]] : [];
          break;
        case 'Sunset Orange':
          // Use second image (or most orange-looking one)
          specificImageUrls = imageUrls[1] ? [imageUrls[1]] : [];
          break;
        case 'Vanilla':
          // Use third image (or most vanilla-looking one)
          specificImageUrls = imageUrls[2] ? [imageUrls[2]] : [];
          break;
        default:
          // Fallback to index-based mapping
          specificImageUrls = imageUrls[index] ? [imageUrls[index]] : [];
      }

      return {
        ...color,
        image_urls: specificImageUrls
      };
    });

    console.log('🔄 Updated color mappings:', updatedColors);

    // Step 4: Update the product with the new color mappings
    const updateResponse = await fetch(API_BASE, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productData: { id: productUUID },
        colors: updatedColors,
        images: images // Keep existing images
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${errorText}`);
    }

    const result = await updateResponse.json();
    console.log('✅ Successfully mapped colors to images!');
    console.log('🔗 Test the color selection at: http://localhost:3000/products/mini-peony-candle');

    return result;

  } catch (error) {
    console.error('❌ Error mapping colors to images:', error);
    return null;
  }
}

// Function to be called manually with the correct UUID
async function fixColorImageMapping(uuid) {
  console.log('🛠️ Fixing color-image mapping for UUID:', uuid);

  if (!uuid) {
    console.log('❓ To use this function:');
    console.log('1. Visit http://localhost:3000/products/mini-peony-candle');
    console.log('2. Open browser console and look for API calls like:');
    console.log('   GET /api/admin/products/[UUID]/colors');
    console.log('3. Copy that UUID and call: fixColorImageMapping("your-uuid-here")');
    return;
  }

  return await mapColorsToImages(uuid);
}

// Export for manual use
if (typeof module !== 'undefined') {
  module.exports = { fixColorImageMapping, mapColorsToImages };
}

// Instructions
console.log('🎯 COLOR-IMAGE MAPPING FIXER');
console.log('═══════════════════════════════');
console.log('');
console.log('PROBLEM: Colors are not switching to specific images');
console.log('SOLUTION: Map each color variant to its corresponding image');
console.log('');
console.log('STEPS:');
console.log('1. Visit your product page in browser');
console.log('2. Check Network tab or console for the product UUID');
console.log('3. Run: fixColorImageMapping("uuid-from-step-2")');
console.log('');
console.log('This will map:');
console.log('• Rose Pink → First image');
console.log('• Sunset Orange → Second image');
console.log('• Vanilla → Third image');

// Try to help identify the correct product
findAndMapColorImages();