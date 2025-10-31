# Deployment Guide

## Overview
This guide provides comprehensive deployment procedures for the Lumidumi e-commerce platform, covering development, staging, and production environments.

## Environment Strategy

### Environment Hierarchy
```
Development (Local) → Staging (Vercel Preview) → Production (Vercel)
      ↓                        ↓                      ↓
  Local Database         Test Database         Production Database
  Development Keys       Test API Keys         Production API Keys
  Debug Mode On          Debug Mode On         Debug Mode Off
```

## Prerequisites

### Required Accounts & Services
1. **Vercel Account** - For hosting and deployment
2. **Supabase Account** - For database and authentication
3. **Razorpay Account** - For payment processing
4. **GitHub Account** - For source code management
5. **Domain Provider** - For custom domain (optional)

### Required Tools
```bash
# Node.js (LTS version)
node --version  # Should be 18.x or higher

# npm or yarn
npm --version

# Git
git --version

# Vercel CLI (for advanced deployment)
npm install -g vercel
```

## Database Setup

### Supabase Project Creation
1. **Create New Project**
   ```
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization
   - Enter project name: "lumidumi-prod" or "lumidumi-staging"
   - Choose region (closest to your users)
   - Create project
   ```

2. **Database Schema Migration**
   ```sql
   -- Run this in Supabase SQL Editor
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

   -- Users table
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

   -- Cart items table
   CREATE TABLE cart_items (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     product_id UUID REFERENCES products(id),
     quantity INTEGER NOT NULL DEFAULT 1,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, product_id)
   );

   -- Create indexes
   CREATE INDEX idx_products_category ON products(category_id);
   CREATE INDEX idx_products_featured ON products(is_featured);
   CREATE INDEX idx_orders_user ON orders(user_id);
   CREATE INDEX idx_orders_status ON orders(status);
   CREATE INDEX idx_order_items_order ON order_items(order_id);
   CREATE INDEX idx_custom_orders_user ON custom_orders(user_id);
   CREATE INDEX idx_custom_orders_status ON custom_orders(status);
   ```

3. **Row Level Security (RLS) Setup**
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

   -- Admin policies for products and categories
   CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );
   CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );

   -- User-specific policies
   CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
     EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
   );

   CREATE POLICY "Users can view own custom orders" ON custom_orders FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create custom orders" ON custom_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

   -- Admin policies for orders and custom orders
   CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );
   CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );
   CREATE POLICY "Admins can manage all custom orders" ON custom_orders FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );
   ```

## Environment Variables

### Required Environment Variables
Create environment variables for each environment:

#### Development (.env.local)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_dev_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key

# Razorpay Configuration (Test Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Email Configuration (Development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_dev_email@gmail.com
SMTP_PASS=your_app_password

# Security
NEXTAUTH_SECRET=your_nextauth_secret_dev
NEXTAUTH_URL=http://localhost:3000
```

#### Staging Environment
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# Razorpay Configuration (Test Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-staging-url.vercel.app
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_staging_email@gmail.com
SMTP_PASS=your_app_password

# Security
NEXTAUTH_SECRET=your_nextauth_secret_staging
NEXTAUTH_URL=https://your-staging-url.vercel.app
```

#### Production Environment
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

# Razorpay Configuration (Live Keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://lumidumi.com
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@lumidumi.com
SMTP_PASS=your_app_password

# Security
NEXTAUTH_SECRET=your_strong_nextauth_secret_production
NEXTAUTH_URL=https://lumidumi.com

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## Vercel Deployment

### Initial Setup

1. **Connect Repository**
   ```bash
   # Push code to GitHub first
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import Project to Vercel**
   ```
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings
   ```

3. **Environment Variables Setup**
   ```
   In Vercel Dashboard:
   - Go to Project Settings
   - Navigate to Environment Variables
   - Add all required environment variables
   - Create separate sets for Preview and Production
   ```

### Automated Deployment with GitHub

#### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

### Manual Deployment with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   ```
   - Go to Project Settings in Vercel
   - Navigate to Domains
   - Add your custom domain (e.g., lumidumi.com)
   ```

2. **DNS Configuration**
   ```
   Add these DNS records in your domain provider:

   Type: A
   Name: @
   Value: 76.76.19.61

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working after DNS propagation

## Database Migrations

### Migration Strategy

1. **Development to Staging**
   ```sql
   -- Export schema from development
   pg_dump --schema-only development_db > schema.sql

   -- Apply to staging
   psql staging_db < schema.sql
   ```

2. **Staging to Production**
   ```sql
   -- Create migration files
   -- migrations/001_initial_schema.sql
   -- migrations/002_add_indexes.sql

   -- Apply migrations in order
   ```

### Backup Strategy

```bash
# Daily automated backups (Supabase handles this)
# Manual backup before major deployments
pg_dump your_database_url > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Monitoring and Logging

### Performance Monitoring

1. **Vercel Analytics**
   ```typescript
   // Add to layout.tsx
   import { Analytics } from '@vercel/analytics/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

2. **Error Tracking**
   ```typescript
   // lib/monitoring.ts
   export function logError(error: Error, context?: string) {
     console.error(`[${context}] Error:`, error);

     // In production, send to monitoring service
     if (process.env.NODE_ENV === 'production') {
       // Send to Sentry, LogRocket, etc.
     }
   }
   ```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) throw error;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
```

## Security Configuration

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### API Security

```typescript
// lib/rate-limit.ts
const rateLimit = new Map();

export function checkRateLimit(identifier: string, limit = 10) {
  const now = Date.now();
  const userRequests = rateLimit.get(identifier) || [];

  // Remove requests older than 1 minute
  const validRequests = userRequests.filter(
    (timestamp) => now - timestamp < 60000
  );

  if (validRequests.length >= limit) {
    return false;
  }

  validRequests.push(now);
  rateLimit.set(identifier, validRequests);
  return true;
}
```

## Performance Optimization

### Build Optimization

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
    };
    return config;
  },
};
```

### Caching Strategy

```typescript
// lib/cache.ts
const cache = new Map();

export function getCachedData(key: string, ttl = 300000) { // 5 minutes
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
}

export function setCachedData(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}
```

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Database Rollback

```sql
-- Restore from backup
pg_restore --clean --if-exists -d your_database backup_file.sql

-- Or use Supabase point-in-time recovery
-- Available in Supabase dashboard for Pro plans
```

## Maintenance Procedures

### Scheduled Maintenance

1. **Database Optimization**
   ```sql
   -- Run weekly
   VACUUM ANALYZE;
   REINDEX DATABASE your_database;
   ```

2. **Log Cleanup**
   ```bash
   # Clean old logs (if using file-based logging)
   find /var/log -type f -mtime +30 -delete
   ```

3. **Dependency Updates**
   ```bash
   # Monthly security updates
   npm audit fix
   npm update
   ```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify variables are set
   vercel env ls

   # Update variables
   vercel env add VARIABLE_NAME
   ```

3. **Database Connection Issues**
   ```typescript
   // Check database connectivity
   const { data, error } = await supabase
     .from('products')
     .select('id')
     .limit(1);

   if (error) {
     console.error('Database connection failed:', error);
   }
   ```

### Emergency Procedures

1. **Site Down**
   ```bash
   # Immediate rollback
   vercel rollback

   # Check health endpoint
   curl https://your-domain.com/api/health
   ```

2. **Database Issues**
   ```bash
   # Switch to read-only mode
   # Update environment variable
   MAINTENANCE_MODE=true
   ```

## Deployment Checklist

### Pre-deployment
- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] Database migrations ready

### Deployment
- [ ] Backup current database
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify health endpoints
- [ ] Monitor error rates

### Post-deployment
- [ ] Verify all features working
- [ ] Check payment processing
- [ ] Monitor performance metrics
- [ ] Update documentation
- [ ] Notify stakeholders