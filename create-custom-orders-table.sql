-- Create custom_orders table
CREATE TABLE IF NOT EXISTS custom_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    description TEXT NOT NULL,
    requirements TEXT,
    budget_range VARCHAR(100),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'pending',
    quoted_price DECIMAL(10,2),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy for custom orders
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for custom orders
CREATE POLICY "Users can view their own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to create custom orders (for guest users)
CREATE POLICY "Anonymous users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (true);

-- Add updated_at trigger
CREATE TRIGGER update_custom_orders_updated_at BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();