-- Add missing columns for color-image linking functionality
-- Run this in your Supabase SQL Editor

-- Add image_urls and primary_image columns to product_colors table
ALTER TABLE product_colors
ADD COLUMN IF NOT EXISTS image_urls TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS primary_image TEXT DEFAULT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_colors_primary_image ON product_colors(primary_image);

-- Update existing data to have empty arrays for image_urls
UPDATE product_colors
SET image_urls = '[]'
WHERE image_urls IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN product_colors.image_urls IS 'JSON array of image URLs assigned to this color variant';
COMMENT ON COLUMN product_colors.primary_image IS 'Primary image URL for this color variant';