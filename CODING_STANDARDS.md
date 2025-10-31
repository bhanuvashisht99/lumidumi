# Coding Standards & Best Practices

## Overview
This document establishes consistent coding standards and best practices for the Lumidumi e-commerce project to ensure maintainable, readable, and secure code across all development agents.

## General Principles

### Code Quality Standards
1. **Readability**: Code should be self-documenting and easy to understand
2. **Consistency**: Follow established patterns and conventions
3. **Simplicity**: Prefer simple solutions over complex ones
4. **Security**: Security considerations in every line of code
5. **Performance**: Write efficient, optimized code
6. **Testability**: Code should be easily testable

### SOLID Principles
- **S** - Single Responsibility Principle
- **O** - Open/Closed Principle
- **L** - Liskov Substitution Principle
- **I** - Interface Segregation Principle
- **D** - Dependency Inversion Principle

## TypeScript Standards

### Type Definitions
```typescript
// ✅ Good: Explicit types
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: Category;
  createdAt: Date;
}

// ❌ Bad: Any types
interface Product {
  id: any;
  name: any;
  price: any;
  [key: string]: any;
}
```

### Strict Type Configuration
```typescript
// tsconfig.json - Required settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Organization
```typescript
// types/index.ts - Centralized type exports
export type { Product, Category, User } from './database';
export type { ApiResponse, ErrorResponse } from './api';
export type { CartItem, OrderSummary } from './cart';
```

## React Component Standards

### Component Structure
```typescript
// ✅ Good: Consistent component structure
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  return (
    <div className={clsx('bg-white rounded-lg shadow-md', className)}>
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">{formatPrice(product.price)}</p>
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### Naming Conventions
```typescript
// Components: PascalCase
export function ProductCard() {}
export function ShoppingCartModal() {}

// Functions: camelCase
const handleSubmit = () => {};
const calculateTotal = () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_CART_ITEMS = 10;
const API_BASE_URL = 'https://api.example.com';

// Types/Interfaces: PascalCase
interface UserProfile {}
type OrderStatus = 'pending' | 'confirmed' | 'shipped';
```

### Component Organization
```typescript
// ✅ Good: Logical organization
export function ProductList() {
  // 1. Hooks
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();

  // 2. Event handlers
  const handleAddToCart = useCallback((productId: string) => {
    addToCart(productId);
  }, [addToCart]);

  // 3. Derived state
  const filteredProducts = useMemo(() =>
    products.filter(p => p.inStock), [products]
  );

  // 4. Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // 5. Main render
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
```

## Custom Hooks Standards

### Hook Design Pattern
```typescript
// ✅ Good: Comprehensive hook with error handling
export function useProducts() {
  const [state, setState] = useState<{
    products: Product[];
    loading: boolean;
    error: Error | null;
  }>({
    products: [],
    loading: true,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const products = await productService.getAll();
      setState({ products, loading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    refetch: fetchProducts,
  };
}
```

### Hook Naming
```typescript
// Data fetching hooks
const useProducts = () => {};
const useProduct = (id: string) => {};

// State management hooks
const useCart = () => {};
const useAuth = () => {};

// Utility hooks
const useLocalStorage = (key: string) => {};
const useDebounce = (value: string, delay: number) => {};
```

## State Management Standards

### Context Pattern
```typescript
// ✅ Good: Proper context implementation
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authService.logout();
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
  }), [user, login, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## API Standards

### Error Handling
```typescript
// ✅ Good: Comprehensive error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || 'API request failed',
        response.status,
        errorData?.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}
```

### API Route Structure
```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const products = await productService.getProducts({ category });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Products API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products'
      },
      { status: 500 }
    );
  }
}
```

## Database Standards

### Query Organization
```typescript
// ✅ Good: Organized database queries
export class ProductRepository {
  constructor(private supabase: SupabaseClient) {}

  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `);

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.featured) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  }

  async createProduct(product: CreateProductInput): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  }
}
```

### Type Safety with Database
```typescript
// Database types from Supabase CLI
import { Database } from './database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
```

## Security Standards

### Input Validation
```typescript
// ✅ Good: Proper input validation
import { z } from 'zod';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  stock: z.number().int().min(0),
});

export function validateCreateProduct(data: unknown): CreateProductInput {
  try {
    return CreateProductSchema.parse(data);
  } catch (error) {
    throw new ValidationError('Invalid product data', error);
  }
}
```

### Authentication Checks
```typescript
// ✅ Good: Proper auth checks
export async function requireAuth(request: Request): Promise<User> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const user = await authService.verifyToken(token);
    return user;
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}

export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireAuth(request);

  if (user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  return user;
}
```

## Styling Standards

### Tailwind CSS Organization
```typescript
// ✅ Good: Organized classes with clsx
import clsx from 'clsx';

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

interface ButtonProps {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-md font-medium transition-colors',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### CSS Custom Properties
```css
/* ✅ Good: Organized CSS variables */
:root {
  /* Colors */
  --color-primary: #f7f3e9;
  --color-secondary: #e8dcc0;
  --color-accent: #d4af37;
  --color-text: #2c2c2c;
  --color-background: #fefcf8;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
}
```

## Testing Standards

### Unit Testing
```typescript
// ✅ Good: Comprehensive unit tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from './ProductCard';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  description: 'A test product',
  imageUrl: '/test-image.jpg',
  category: { id: '1', name: 'Test Category' },
  createdAt: new Date(),
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const mockOnAddToCart = jest.fn();

    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹99.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', async () => {
    const mockOnAddToCart = jest.fn();

    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
      />
    );

    fireEvent.click(screen.getByText('Add to Cart'));

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith('1');
    });
  });
});
```

### Integration Testing
```typescript
// ✅ Good: Integration test example
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  await page.goto('/products');

  // Add product to cart
  await page.click('[data-testid="product-card"]:first-child >> text=Add to Cart');

  // Go to cart
  await page.click('[data-testid="cart-icon"]');

  // Proceed to checkout
  await page.click('text=Checkout');

  // Fill shipping information
  await page.fill('[name="address"]', '123 Test Street');
  await page.fill('[name="city"]', 'Test City');
  await page.fill('[name="postalCode"]', '12345');

  // Complete purchase
  await page.click('text=Place Order');

  // Verify success page
  await expect(page).toHaveURL(/\/order-success/);
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

## File Organization Standards

### Import Organization
```typescript
// ✅ Good: Organized imports
// 1. Node modules
import React, { useState, useEffect, useCallback } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import clsx from 'clsx';

// 2. Internal utilities
import { formatPrice, validateEmail } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// 3. Internal components
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// 4. Types
import type { Product, Category } from '@/types';
```

### File Naming
```
components/
├── ui/
│   ├── Button.tsx              # PascalCase for components
│   ├── LoadingSpinner.tsx
│   └── index.ts                # Barrel exports
├── forms/
│   ├── ContactForm.tsx
│   └── ProductForm.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx

lib/
├── utils.ts                    # camelCase for utilities
├── supabase.ts
└── validation.ts

hooks/
├── useAuth.ts                  # camelCase with 'use' prefix
├── useCart.ts
└── useLocalStorage.ts
```

## Documentation Standards

### Code Comments
```typescript
/**
 * Calculates the total price including taxes and shipping
 * @param items - Array of cart items
 * @param shippingCost - Shipping cost in cents
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price in cents
 */
export function calculateTotal(
  items: CartItem[],
  shippingCost: number,
  taxRate: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  return subtotal + tax + shippingCost;
}
```

### README Structure
```markdown
# Component Name

## Purpose
Brief description of what this component does.

## Usage
```tsx
<ComponentName prop1="value" prop2={123} />
```

## Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| prop1 | string | Yes | Description of prop1 |
| prop2 | number | No | Description of prop2 |

## Examples
... code examples ...
```

## Performance Standards

### Code Optimization
```typescript
// ✅ Good: Optimized component
export function ProductList({ products }: { products: Product[] }) {
  // Memoize expensive calculations
  const sortedProducts = useMemo(() =>
    [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  // Memoize event handlers
  const handleProductClick = useCallback((product: Product) => {
    // Handle click
  }, []);

  return (
    <div>
      {sortedProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={handleProductClick}
        />
      ))}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const ProductCard = memo(function ProductCard({ product, onClick }: Props) {
  return (
    <div onClick={() => onClick(product)}>
      {product.name}
    </div>
  );
});
```

## Accessibility Standards

### ARIA and Semantic HTML
```typescript
// ✅ Good: Accessible component
export function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch(value);
          }
        }}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full px-4 py-2 border rounded-md"
      />
      <button
        onClick={() => onSearch(value)}
        aria-label="Search"
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        🔍
      </button>
    </div>
  );
}
```

## Code Review Checklist

### Before Submitting PR
- [ ] All tests pass
- [ ] TypeScript has no errors
- [ ] ESLint has no warnings
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Performance is optimized
- [ ] Accessibility is considered
- [ ] Security best practices followed
- [ ] Documentation is updated
- [ ] No console.log statements left

### Review Criteria
- [ ] Code follows established patterns
- [ ] Logic is clear and well-structured
- [ ] Edge cases are handled
- [ ] Security vulnerabilities are addressed
- [ ] Performance impact is acceptable
- [ ] Tests provide adequate coverage