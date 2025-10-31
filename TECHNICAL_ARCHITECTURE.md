# Technical Architecture Documentation

## System Overview

### Architecture Pattern
**Pattern**: Jamstack with Server-Side Rendering (SSR)
**Approach**: Component-based architecture with separation of concerns
**Data Flow**: Unidirectional data flow with centralized state management

### Core Principles
1. **Single Responsibility**: Each component has one clear purpose
2. **Separation of Concerns**: Clear boundaries between UI, logic, and data
3. **DRY (Don't Repeat Yourself)**: Reusable components and utilities
4. **SOLID Principles**: Maintainable and extensible code structure
5. **Security by Design**: Security considerations at every layer

## Technology Stack Architecture

### Frontend Layer
```
┌─────────────────────────────────────────┐
│               Next.js 14+               │
├─────────────────────────────────────────┤
│   App Router | TypeScript | React 18    │
├─────────────────────────────────────────┤
│        Tailwind CSS | Headless UI       │
├─────────────────────────────────────────┤
│    Component Library | Custom Hooks     │
└─────────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────────┐
│            Supabase Platform            │
├─────────────────────────────────────────┤
│  PostgreSQL | Auth | Storage | Edge Fn  │
├─────────────────────────────────────────┤
│         Row Level Security (RLS)        │
├─────────────────────────────────────────┤
│            API Routes Layer             │
└─────────────────────────────────────────┘
```

### Integration Layer
```
┌─────────────────────────────────────────┐
│    Razorpay Payment Gateway (India)     │
├─────────────────────────────────────────┤
│        Nodemailer Email Service         │
├─────────────────────────────────────────┤
│         Vercel Deployment Platform      │
└─────────────────────────────────────────┘
```

## Application Architecture

### Directory Structure
```
lumidumi/
├── docs/                          # Project documentation
│   ├── PROJECT_SPECIFICATION.md   # Requirements and specifications
│   ├── DEVELOPMENT_TEAM_STRUCTURE.md # Team roles and processes
│   ├── TECHNICAL_ARCHITECTURE.md  # This document
│   ├── CODING_STANDARDS.md        # Development standards
│   └── DEPLOYMENT_GUIDE.md        # Deployment procedures
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Auth route group
│   │   ├── (customer)/           # Customer route group
│   │   ├── admin/                # Admin panel routes
│   │   ├── api/                  # API routes
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   └── features/             # Feature-specific components
│   ├── lib/                      # Utility libraries
│   │   ├── supabase.ts           # Supabase client configuration
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── utils.ts              # General utilities
│   │   └── validations.ts        # Form validations
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useCart.ts            # Shopping cart hook
│   │   └── useLocalStorage.ts    # Local storage hook
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx       # Authentication context
│   │   ├── CartContext.tsx       # Shopping cart context
│   │   └── ThemeContext.tsx      # Theme context
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Main type exports
│   │   ├── database.ts           # Database types
│   │   └── api.ts                # API types
│   └── styles/                   # Style-related files
│       ├── globals.css           # Global CSS
│       └── components.css        # Component-specific CSS
├── public/                       # Static assets
├── migrations/                   # Database migrations
├── tests/                        # Test files
└── config files                  # Configuration files
```

## Data Architecture

### Database Schema Design

#### Entity Relationship Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Categories  │    │  Products   │    │    Users    │
│             │◄───┤             │    │             │
│ - id (PK)   │    │ - id (PK)   │    │ - id (PK)   │
│ - name      │    │ - name      │    │ - email     │
│ - slug      │    │ - price     │    │ - role      │
└─────────────┘    │ - category  │    └─────────────┘
                   └─────────────┘           │
                          │                  │
                          │                  │
                   ┌─────────────┐    ┌─────────────┐
                   │   Orders    │◄───┤  Cart Items │
                   │             │    │             │
                   │ - id (PK)   │    │ - user_id   │
                   │ - user_id   │    │ - product_id│
                   │ - total     │    │ - quantity  │
                   └─────────────┘    └─────────────┘
                          │
                          │
                   ┌─────────────┐
                   │ Order Items │
                   │             │
                   │ - order_id  │
                   │ - product_id│
                   │ - quantity  │
                   └─────────────┘
```

#### Table Specifications

**Categories Table**
- Primary Key: UUID
- Indexes: slug (unique)
- RLS: Public read access

**Products Table**
- Primary Key: UUID
- Foreign Keys: category_id
- Indexes: category_id, is_featured
- RLS: Public read, admin write

**Users Table**
- Primary Key: UUID (references auth.users)
- Unique: email
- RLS: Users see own data, admins see all

**Orders Table**
- Primary Key: UUID
- Foreign Keys: user_id
- Indexes: user_id, status, created_at
- RLS: Users see own orders, admins see all

## Component Architecture

### Component Hierarchy
```
App Layout
├── Navigation
│   ├── Header
│   ├── MobileMenu
│   └── Footer
├── Pages
│   ├── CustomerPages
│   │   ├── HomePage
│   │   ├── ProductCatalog
│   │   ├── ProductDetail
│   │   ├── ShoppingCart
│   │   └── Checkout
│   └── AdminPages
│       ├── Dashboard
│       ├── ProductManagement
│       ├── OrderManagement
│       └── CustomerManagement
└── Shared Components
    ├── UI Components
    ├── Form Components
    └── Layout Components
```

### Component Design Patterns

#### Container/Presentational Pattern
```typescript
// Container Component (Data Logic)
export function ProductListContainer() {
  const { products, loading, error } = useProducts();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ProductList products={products} />;
}

// Presentational Component (UI Logic)
export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

#### Custom Hook Pattern
```typescript
// Custom Hook for Data Logic
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
```

## Security Architecture

### Authentication Flow
```
User Login Request
        ↓
   Supabase Auth
        ↓
   JWT Token Generation
        ↓
   Client-side Storage
        ↓
   API Request Headers
        ↓
   Server-side Validation
        ↓
   Resource Access
```

### Authorization Layers

1. **Route-level Protection**
   - Protected routes with authentication checks
   - Role-based access control (RBAC)
   - Redirect to login for unauthorized access

2. **API-level Security**
   - JWT token validation
   - Rate limiting
   - Input validation and sanitization

3. **Database-level Security**
   - Row Level Security (RLS) policies
   - Secure database connections
   - Encrypted data storage

### Security Policies

#### Row Level Security (RLS) Policies
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can see all data
CREATE POLICY "Admins can view all data"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Performance Architecture

### Performance Optimization Strategies

#### Frontend Optimizations
1. **Code Splitting**
   - Route-based code splitting with Next.js
   - Component-level lazy loading
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Next.js Image component with automatic optimization
   - Sharp integration for server-side processing
   - HEIC format support for modern devices

3. **Caching Strategy**
   - Browser caching for static assets
   - Service worker for offline functionality
   - SWR for client-side data caching

#### Backend Optimizations
1. **Database Optimization**
   - Proper indexing strategy
   - Query optimization
   - Connection pooling

2. **API Optimization**
   - Response compression
   - Efficient data serialization
   - Pagination for large datasets

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Data Flow Architecture

### State Management Flow
```
User Action → Component → Custom Hook → API Call → Database
     ↑                                                ↓
UI Update ← State Update ← Context Provider ← Response Data
```

### Shopping Cart Flow
```
Add to Cart → Cart Context → Local Storage + Database
     ↓
Update UI → Persist State → Sync on Login
```

### Authentication Flow
```
Login Request → Supabase Auth → JWT Token → Context Update
     ↓
Protected Routes → Token Validation → Access Control
```

## Integration Architecture

### Third-party Integrations

#### Razorpay Payment Integration
```
Checkout → Create Order → Razorpay SDK → Payment Processing
     ↓                                            ↓
Order Confirmation ← Webhook Handler ← Payment Success
```

#### Email Service Integration
```
Order Placed → Email Template → Nodemailer → SMTP Service
     ↓
Customer Notification + Admin Notification
```

## Deployment Architecture

### Environment Strategy
```
Development → Staging → Production
     ↓           ↓         ↓
Local DB    Test DB   Prod DB
Test Keys   Test Keys Live Keys
```

### CI/CD Pipeline
```
Git Push → Build & Test → Security Scan → Deploy → Monitor
    ↓
GitHub Actions → Vercel → Production Environment
```

## Monitoring and Observability

### Application Monitoring
1. **Performance Monitoring**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Server response time monitoring

2. **Error Tracking**
   - Client-side error logging
   - Server-side error handling
   - Payment failure tracking

3. **Business Metrics**
   - Conversion rate tracking
   - Cart abandonment monitoring
   - Order completion rates

### Logging Strategy
```
Application Logs → Structured Logging → Log Aggregation → Analysis
     ↓
Error Logs → Alert System → Incident Response
```

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Efficient database queries
- Optimized component rendering
- Memory usage optimization

### Future Scalability
- Microservices preparation
- API versioning strategy
- Database sharding considerations

## Disaster Recovery

### Backup Strategy
- Daily database backups
- Code repository redundancy
- Asset backup and recovery

### Recovery Procedures
- Database restore procedures
- Application rollback strategy
- Emergency contact protocols

## Documentation Standards

### Code Documentation
- JSDoc for functions and classes
- README files for each major component
- API documentation with examples

### Architecture Documentation
- System diagrams and flowcharts
- Decision records (ADRs)
- Regular architecture reviews