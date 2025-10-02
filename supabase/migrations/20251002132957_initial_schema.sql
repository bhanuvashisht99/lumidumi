-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES categories(id),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    weight DECIMAL(8,2),
    burn_time INTEGER,
    scent_description TEXT,
    ingredients TEXT,
    care_instructions TEXT,
    slug VARCHAR(200) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content management table for hero and about sections
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200),
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    button_text VARCHAR(100),
    button_url VARCHAR(200),
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON site_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to products and categories
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Site content policies
CREATE POLICY "Anyone can view site content" ON site_content FOR SELECT USING (true);

-- Insert sample categories
INSERT INTO categories (name, description, slug) VALUES
    ('Scented Candles', 'Premium scented candles with natural fragrances', 'scented-candles'),
    ('Pillar Candles', 'Classic pillar candles for decoration and ambiance', 'pillar-candles'),
    ('Tea Light Candles', 'Small tea light candles perfect for intimate settings', 'tea-light-candles'),
    ('Custom Candles', 'Personalized candles made to order', 'custom-candles')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, stock_quantity, featured, burn_time, scent_description, slug) VALUES
    ('Vanilla Dreams', 'Handcrafted vanilla candle with hints of caramel and warm spices. Perfect for creating a cozy atmosphere.', 899.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 15, true, 24, 'Warm vanilla with hints of caramel', 'vanilla-dreams'),
    ('Lavender Bliss', 'Calming lavender candle infused with natural lavender essential oils for relaxation and stress relief.', 799.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 20, true, 22, 'Calming lavender for relaxation', 'lavender-bliss'),
    ('Citrus Burst', 'Energizing citrus blend with notes of orange, lemon, and grapefruit to brighten any space.', 749.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 18, true, 20, 'Fresh citrus energizing blend', 'citrus-burst'),
    ('Sandalwood Serenity', 'Rich sandalwood candle with earthy undertones, perfect for meditation and peaceful moments.', 999.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 12, true, 26, 'Rich sandalwood with earthy notes', 'sandalwood-serenity'),
    ('Rose Garden', 'Elegant rose-scented candle with a delicate floral fragrance, ideal for romantic settings.', 899.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 14, false, 23, 'Elegant rose with floral notes', 'rose-garden'),
    ('Ocean Breeze', 'Fresh ocean-inspired candle with marine and aquatic notes for a refreshing ambiance.', 849.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 16, false, 21, 'Fresh ocean and marine scents', 'ocean-breeze')
ON CONFLICT (slug) DO NOTHING;

-- Insert default content for hero and about sections
INSERT INTO site_content (section, title, subtitle, description, additional_data) VALUES
    ('hero', 'Lumidumi', 'Handcrafted candles that illuminate your space with warmth and elegance.', 'Each candle is lovingly made with premium wax and carefully selected fragrances.', '{"stats": [{"value": "100%", "label": "Natural Wax"}, {"value": "50+", "label": "Unique Scents"}, {"value": "24h", "label": "Burn Time"}]}'),
    ('about', 'Crafted with Love', 'At Lumidumi, every candle tells a story.', 'We believe in the power of handcrafted beauty and the warmth that comes from creating something special with your own hands.', '{"features": [{"icon": "<?", "title": "Natural Ingredients", "description": "We use only premium natural wax and carefully sourced fragrances"}, {"icon": "=P", "title": "Handmade Process", "description": "Each candle is individually crafted with attention to every detail"}, {"icon": "<�", "title": "Custom Designs", "description": "Personalized candles for your special moments and occasions"}]}')
ON CONFLICT (section) DO NOTHING;