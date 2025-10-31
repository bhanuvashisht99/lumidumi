# Lumidumi E-commerce Project Specification

## Project Overview
**Project Name**: Lumidumi - Handcrafted Candle E-commerce Platform
**Version**: 2.0 (Fresh Professional Implementation)
**Type**: B2C E-commerce Website with Admin Panel
**Target Market**: Premium handcrafted candle enthusiasts in India

## Business Requirements

### Core Functionality
1. **Customer-facing E-commerce Site**
   - Product catalog with filtering and search
   - Shopping cart and checkout process
   - Razorpay payment integration (UPI support for India)
   - User authentication and profiles
   - Order tracking and history
   - Custom order requests
   - Contact and support forms

2. **Admin Management Panel**
   - Product management (CRUD operations)
   - Order management and fulfillment
   - Customer management
   - Custom order request handling
   - Analytics dashboard
   - Inventory management

3. **Key Features**
   - Mobile-responsive design
   - SEO optimized
   - Performance optimized
   - Security compliant
   - Analytics integration

## Technical Specifications

### Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payment**: Razorpay (Indian market focus)
- **UI Components**: Headless UI, Heroicons
- **Image Handling**: Sharp, HEIC support
- **Deployment**: Vercel
- **Email**: Nodemailer

### Architecture Decisions
- **Database**: PostgreSQL via Supabase for reliability and scalability
- **Authentication**: Supabase Auth for secure user management
- **File Storage**: Supabase Storage for product images
- **State Management**: React Context API with local storage persistence
- **Styling**: Tailwind CSS for maintainable, responsive design
- **Payment Processing**: Razorpay for Indian market compliance

## Database Schema

### Core Tables
1. **categories** - Product categorization
2. **products** - Product catalog
3. **users** - Customer and admin accounts
4. **orders** - Purchase orders
5. **order_items** - Order line items
6. **custom_orders** - Custom product requests
7. **cart_items** - Persistent shopping cart

### Key Relationships
- Products belong to categories
- Orders contain multiple order items
- Users have orders and custom orders
- Cart items are user-specific

## Design System

### Color Palette
- **Primary**: #F7F3E9 (Warm Cream)
- **Secondary**: #E8DCC0 (Golden Cream)
- **Accent**: #D4AF37 (Elegant Gold)
- **Text**: #2C2C2C (Charcoal)
- **Background**: #FEFCF8 (Off-white)

### Typography
- Clean, readable fonts
- Hierarchy for content organization
- Accessibility compliant contrast ratios

## User Stories

### Customer Journey
1. **Discovery**: Browse products by category, view featured items
2. **Selection**: View product details, compare options
3. **Purchase**: Add to cart, secure checkout with Razorpay
4. **Fulfillment**: Order confirmation, tracking, delivery
5. **Support**: Contact forms, custom order requests

### Admin Journey
1. **Product Management**: Add/edit/remove products and categories
2. **Order Processing**: Review orders, update status, manage fulfillment
3. **Customer Service**: Handle custom orders, respond to inquiries
4. **Analytics**: Monitor sales, inventory, customer behavior

## Security Requirements

### Data Protection
- Row Level Security (RLS) on all tables
- Secure API endpoints with proper authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Payment Security
- Razorpay secure payment processing
- No storage of sensitive payment data
- PCI compliance through Razorpay

### Access Control
- Role-based permissions (customer, admin)
- Secure admin panel access
- Session management
- CSRF protection

## Performance Requirements

### Core Web Vitals
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

### Optimization Strategies
- Image optimization with Sharp
- Code splitting and lazy loading
- CDN for static assets
- Database query optimization
- Caching strategies

## Previous Implementation Issues

### Problems Encountered
1. **Multiple Supabase Client Instances**: Caused authentication conflicts
2. **Service Worker Conflicts**: Session management issues
3. **Authentication Race Conditions**: Data loading timing problems
4. **Complex Context Management**: Over-engineered state management
5. **Lack of Proper Planning**: Ad-hoc development approach

### Lessons Learned
1. **Single Source of Truth**: One Supabase client instance per application
2. **Simple State Management**: Avoid over-engineering contexts
3. **Proper Error Handling**: Comprehensive error boundaries and fallbacks
4. **Sequential Development**: Complete authentication before data loading
5. **Thorough Testing**: Test each component in isolation

## Success Metrics

### Technical KPIs
- Page load time < 3 seconds
- 99.9% uptime
- Zero critical security vulnerabilities
- Mobile responsiveness score > 95%

### Business KPIs
- Conversion rate optimization
- Cart abandonment reduction
- Customer satisfaction scores
- Order processing efficiency

## Compliance & Standards

### Web Standards
- WCAG 2.1 AA accessibility compliance
- HTML5 semantic markup
- Progressive enhancement
- SEO best practices

### Business Compliance
- Indian e-commerce regulations
- GST compliance (future consideration)
- Privacy policy and terms of service
- Data protection regulations

## Deployment Strategy

### Environment Setup
- **Development**: Local development with test database
- **Staging**: Pre-production testing environment
- **Production**: Live environment with monitoring

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Deployment automation
- Performance monitoring

## Timeline & Milestones

### Phase 1: Foundation (Days 1-2)
- Project setup and configuration
- Database schema implementation
- Basic authentication setup

### Phase 2: Core Features (Days 3-5)
- Product catalog implementation
- Shopping cart functionality
- Basic admin panel

### Phase 3: Payment & Checkout (Days 6-7)
- Razorpay integration
- Order processing workflow
- Email notifications

### Phase 4: Polish & Launch (Days 8-10)
- UI/UX refinements
- Performance optimization
- Testing and bug fixes
- Production deployment

## Risk Assessment

### High Risk
- Payment integration complexities
- Authentication edge cases
- Performance under load

### Medium Risk
- Third-party service dependencies
- Browser compatibility issues
- SEO implementation challenges

### Mitigation Strategies
- Thorough testing protocols
- Fallback mechanisms
- Performance monitoring
- Regular security audits