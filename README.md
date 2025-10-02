# Lumidumi - Handmade Candles E-commerce Website

A beautiful, minimalist e-commerce website for Lumidumi candle business, featuring a custom admin panel and Razorpay payment integration.

## Features

- **Customer-facing Website**
  - Beautiful hero section with elegant design
  - Product catalog with categories
  - Shopping cart functionality
  - Razorpay payment integration (UPI support for India)
  - Custom order requests
  - Contact forms

- **Admin Panel**
  - Product management (CRUD operations)
  - Order management and tracking
  - Customer management
  - Custom order request handling
  - Dashboard with analytics

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Razorpay
- **UI**: Headless UI, Heroicons
- **Deployment**: Vercel (recommended)

## Color Palette

- Primary: `#F7F3E9` (Warm Cream)
- Secondary: `#E8DCC0` (Golden Cream)
- Accent: `#D4AF37` (Elegant Gold)
- Text: `#2C2C2C` (Charcoal)
- Background: `#FEFCF8` (Off-white)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd lumidumi
npm install
```

### 2. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Database Setup

Run the following SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom orders table
CREATE TABLE custom_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  description TEXT NOT NULL,
  budget_range VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled')),
  quote_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table (for persistent cart)
CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_custom_orders_user ON custom_orders(user_id);
CREATE INDEX idx_custom_orders_status ON custom_orders(status);
```

### 4. Insert Sample Data

```sql
-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Scented Candles', 'scented-candles', 'Beautiful scented candles with various fragrances'),
('Decorative Candles', 'decorative-candles', 'Elegant decorative candles for special occasions'),
('Aromatherapy', 'aromatherapy', 'Therapeutic candles for relaxation and wellness');

-- Insert sample products
INSERT INTO products (name, description, price, category_id, stock, is_featured) VALUES
('Vanilla Dreams', 'Warm vanilla with hints of caramel', 899.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 15, true),
('Lavender Bliss', 'Calming lavender for relaxation', 799.00, (SELECT id FROM categories WHERE slug = 'aromatherapy'), 20, true),
('Citrus Burst', 'Fresh citrus energizing blend', 749.00, (SELECT id FROM categories WHERE slug = 'scented-candles'), 18, false),
('Sandalwood Serenity', 'Rich sandalwood with earthy notes', 999.00, (SELECT id FROM categories WHERE slug = 'aromatherapy'), 12, true);
```

### 5. Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);

-- Users can only see their own data
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Admin policies (you'll need to set user role)
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

### 6. Razorpay Setup

1. Create a Razorpay account at https://razorpay.com/
2. Get your API keys from the dashboard
3. Add the keys to your `.env.local` file
4. Test with test keys first, then switch to live keys for production

### 7. Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the website.

Admin panel is available at `http://localhost:3000/admin`.

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   ├── api/             # API routes (Razorpay)
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable components
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── hooks/               # Custom React hooks
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js, such as:
- Netlify
- Railway
- Heroku
- AWS
- Google Cloud Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Lumidumi candle business.

## Support

For support and questions, contact: hello@lumidumi.com