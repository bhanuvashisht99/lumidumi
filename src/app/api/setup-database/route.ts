import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database setup...')

    // Create custom_orders table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (tableError) {
      console.error('Error creating table:', tableError)
      // Try alternative approach - direct SQL execution
      const { error: createError } = await supabase
        .from('custom_orders')
        .select('id')
        .limit(1)

      if (createError && createError.message.includes('does not exist')) {
        // Table doesn't exist, let's create it using a different method
        return NextResponse.json({
          error: 'Table creation failed. Please run the SQL script manually in Supabase dashboard.',
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
          `
        }, { status: 400 })
      }
    }

    // Test if table exists by trying to insert a test record
    const testData = {
      name: 'Test Order',
      email: 'test@example.com',
      description: 'Test description',
      status: 'pending'
    }

    const { data, error: insertError } = await supabase
      .from('custom_orders')
      .insert([testData])
      .select()

    if (insertError) {
      console.error('Insert test failed:', insertError)
      return NextResponse.json({
        error: `Database setup incomplete: ${insertError.message}`,
        details: insertError
      }, { status: 500 })
    }

    // Delete the test record
    if (data && data[0]) {
      await supabase
        .from('custom_orders')
        .delete()
        .eq('id', data[0].id)
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      table_created: 'custom_orders'
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      error: 'Database setup failed',
      details: error
    }, { status: 500 })
  }
}