const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupDatabase() {
  console.log('Setting up database...')

  try {
    // Check if custom_orders table exists
    const { data, error } = await supabase
      .from('custom_orders')
      .select('id')
      .limit(1)

    if (error && error.message.includes('does not exist')) {
      console.log('Creating custom_orders table...')

      // Use direct SQL execution
      const { data: result, error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
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

ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anonymous users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_custom_orders_updated_at BEFORE UPDATE ON custom_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `
      })

      if (sqlError) {
        console.error('SQL execution failed:', sqlError)
        console.log('Please run this SQL manually in Supabase:')
        console.log(`
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

ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anonymous users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (true);
        `)
        return
      }

      console.log('Table created successfully!')
    } else {
      console.log('Table already exists!')
    }

    // Test table access
    const { data: testData, error: testError } = await supabase
      .from('custom_orders')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('Table access test failed:', testError)
    } else {
      console.log('Database setup completed successfully!')
    }

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase()