# Resend Email Integration Guide

## Overview
This guide provides comprehensive setup for integrating Resend email service with the Lumidumi e-commerce platform, including Vercel deployment integration and Supabase trigger configurations.

## Why Resend?

### Advantages over Traditional SMTP
- **Developer-friendly**: Built specifically for developers
- **Better deliverability**: Superior inbox placement rates
- **React email templates**: Native support for React-based email templates
- **Vercel integration**: Seamless integration with Vercel deployment
- **Analytics**: Built-in email analytics and tracking
- **Cost-effective**: Generous free tier and reasonable pricing

## Phase 1: Resend Setup

### Step 1: Create Resend Account
```bash
# Visit https://resend.com
# 1. Sign up with your email
# 2. Verify your email address
# 3. Complete account setup
```

### Step 2: Domain Configuration
```bash
# In Resend Dashboard:
# 1. Go to "Domains" section
# 2. Click "Add Domain"
# 3. Enter your domain (e.g., lumidumi.com)
# 4. Follow DNS configuration instructions
```

**DNS Records to Add:**
```dns
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record
Type: TXT
Name: resend._domainkey
Value: [Provided by Resend Dashboard]

# DMARC Record (Optional but recommended)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@lumidumi.com
```

### Step 3: Get API Key
```bash
# In Resend Dashboard:
# 1. Go to "API Keys" section
# 2. Click "Create API Key"
# 3. Name it "Lumidumi Production" or "Lumidumi Development"
# 4. Copy the API key (starts with re_)
```

## Phase 2: Project Integration

### Step 1: Install Resend Package
```bash
# Install Resend SDK
npm install resend

# Install React Email for templates
npm install @react-email/components @react-email/render

# Install additional email utilities
npm install @react-email/tailwind
```

### Step 2: Environment Variables
```bash
# Add to .env.local
cat >> .env.local << 'EOF'

# Resend Configuration
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=hello@lumidumi.com

# Email Configuration
ADMIN_EMAIL=admin@lumidumi.com
SUPPORT_EMAIL=support@lumidumi.com
EOF
```

### Step 3: Create Email Service
```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static readonly DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'hello@lumidumi.com';

  static async sendEmail(options: EmailOptions) {
    try {
      const emailData = {
        from: options.from || this.DEFAULT_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.react ? await render(options.react) : options.html,
        text: options.text,
      };

      const result = await resend.emails.send(emailData);

      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Order confirmation email
  static async sendOrderConfirmation(order: any, userEmail: string) {
    const { OrderConfirmationEmail } = await import('@/components/emails/OrderConfirmationEmail');

    return this.sendEmail({
      to: userEmail,
      subject: `Order Confirmation - #${order.orderNumber}`,
      react: OrderConfirmationEmail({ order })
    });
  }

  // Order status update email
  static async sendOrderStatusUpdate(order: any, userEmail: string) {
    const { OrderStatusUpdateEmail } = await import('@/components/emails/OrderStatusUpdateEmail');

    return this.sendEmail({
      to: userEmail,
      subject: `Order Update - #${order.orderNumber}`,
      react: OrderStatusUpdateEmail({ order })
    });
  }

  // Custom order inquiry email
  static async sendCustomOrderInquiry(customOrder: any) {
    const { CustomOrderInquiryEmail } = await import('@/components/emails/CustomOrderInquiryEmail');

    // Send to admin
    await this.sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `New Custom Order Inquiry from ${customOrder.name}`,
      react: CustomOrderInquiryEmail({ customOrder, isAdmin: true })
    });

    // Send confirmation to customer
    return this.sendEmail({
      to: customOrder.email,
      subject: 'Thank you for your custom order inquiry',
      react: CustomOrderInquiryEmail({ customOrder, isAdmin: false })
    });
  }

  // Contact form email
  static async sendContactForm(formData: any) {
    const { ContactFormEmail } = await import('@/components/emails/ContactFormEmail');

    return this.sendEmail({
      to: process.env.SUPPORT_EMAIL!,
      subject: `Contact Form Submission from ${formData.name}`,
      react: ContactFormEmail({ formData })
    });
  }

  // Welcome email for new users
  static async sendWelcomeEmail(user: any) {
    const { WelcomeEmail } = await import('@/components/emails/WelcomeEmail');

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Lumidumi - Handcrafted Candles',
      react: WelcomeEmail({ user })
    });
  }

  // Password reset email
  static async sendPasswordResetEmail(email: string, resetLink: string) {
    const { PasswordResetEmail } = await import('@/components/emails/PasswordResetEmail');

    return this.sendEmail({
      to: email,
      subject: 'Reset your Lumidumi password',
      react: PasswordResetEmail({ resetLink })
    });
  }
}
```

## Phase 3: Email Templates

### Step 1: Create Email Components Directory
```bash
mkdir -p src/components/emails
```

### Step 2: Base Email Template
```tsx
// src/components/emails/EmailLayout.tsx
import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            {/* Header */}
            <Section className="mt-[32px]">
              <Img
                src="https://your-domain.com/logo.png"
                width="160"
                height="48"
                alt="Lumidumi"
                className="my-0 mx-auto"
              />
            </Section>

            {/* Content */}
            {children}

            {/* Footer */}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This email was sent from Lumidumi. If you have any questions, please contact us at{' '}
              <Link
                href="mailto:hello@lumidumi.com"
                className="text-[#D4AF37] no-underline"
              >
                hello@lumidumi.com
              </Link>
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Lumidumi - Handcrafted Candles<br />
              Mumbai, India
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
```

### Step 3: Order Confirmation Email
```tsx
// src/components/emails/OrderConfirmationEmail.tsx
import {
  Section,
  Text,
  Button,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface OrderConfirmationEmailProps {
  order: {
    orderNumber: string;
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
}

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <EmailLayout preview={`Order confirmation for #${order.orderNumber}`}>
      <Text className="text-black text-[14px] leading-[24px]">
        Thank you for your order! We're excited to create and ship your beautiful candles.
      </Text>

      <Section>
        <Text className="text-black text-[16px] font-semibold leading-[24px]">
          Order #{order.orderNumber}
        </Text>

        {/* Order Items */}
        <Section className="bg-[#f9f9f9] p-[16px] rounded-[4px] my-[16px]">
          {order.items.map((item, index) => (
            <Row key={index} className={index > 0 ? "border-t border-[#eaeaea] pt-[12px]" : ""}>
              <Column>
                <Text className="text-black text-[14px] leading-[20px] m-0">
                  {item.name}
                </Text>
                <Text className="text-[#666666] text-[12px] leading-[16px] m-0">
                  Quantity: {item.quantity}
                </Text>
              </Column>
              <Column align="right">
                <Text className="text-black text-[14px] leading-[20px] m-0">
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </Column>
            </Row>
          ))}

          <Row className="border-t border-[#eaeaea] pt-[12px] mt-[12px]">
            <Column>
              <Text className="text-black text-[16px] font-semibold leading-[20px] m-0">
                Total
              </Text>
            </Column>
            <Column align="right">
              <Text className="text-black text-[16px] font-semibold leading-[20px] m-0">
                {formatPrice(order.totalAmount)}
              </Text>
            </Column>
          </Row>
        </Section>

        {/* Shipping Address */}
        <Section>
          <Text className="text-black text-[16px] font-semibold leading-[24px]">
            Shipping Address
          </Text>
          <Text className="text-[#666666] text-[14px] leading-[20px]">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.line1}<br />
            {order.shippingAddress.line2 && (
              <>
                {order.shippingAddress.line2}<br />
              </>
            )}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </Text>
        </Section>

        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-[#D4AF37] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
            href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.orderNumber}`}
          >
            Track Your Order
          </Button>
        </Section>

        <Text className="text-[#666666] text-[14px] leading-[24px]">
          We'll send you another email when your order ships. In the meantime, you can track your order status in your account.
        </Text>
      </Section>
    </EmailLayout>
  );
}
```

### Step 4: Custom Order Inquiry Email
```tsx
// src/components/emails/CustomOrderInquiryEmail.tsx
import {
  Section,
  Text,
  Button,
} from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface CustomOrderInquiryEmailProps {
  customOrder: {
    name: string;
    email: string;
    phone?: string;
    description: string;
    budgetRange?: string;
  };
  isAdmin: boolean;
}

export function CustomOrderInquiryEmail({ customOrder, isAdmin }: CustomOrderInquiryEmailProps) {
  if (isAdmin) {
    return (
      <EmailLayout preview={`New custom order inquiry from ${customOrder.name}`}>
        <Text className="text-black text-[16px] font-semibold leading-[24px]">
          New Custom Order Inquiry
        </Text>

        <Section className="bg-[#f9f9f9] p-[16px] rounded-[4px] my-[16px]">
          <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
            <strong>Customer:</strong> {customOrder.name}
          </Text>
          <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
            <strong>Email:</strong> {customOrder.email}
          </Text>
          {customOrder.phone && (
            <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
              <strong>Phone:</strong> {customOrder.phone}
            </Text>
          )}
          {customOrder.budgetRange && (
            <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
              <strong>Budget Range:</strong> {customOrder.budgetRange}
            </Text>
          )}
          <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
            <strong>Description:</strong>
          </Text>
          <Text className="text-[#666666] text-[14px] leading-[20px] m-0">
            {customOrder.description}
          </Text>
        </Section>

        <Section className="text-center mt-[32px] mb-[32px]">
          <Button
            className="bg-[#D4AF37] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
            href={`${process.env.NEXT_PUBLIC_APP_URL}/admin/custom-orders`}
          >
            View in Admin Panel
          </Button>
        </Section>
      </EmailLayout>
    );
  }

  return (
    <EmailLayout preview="Thank you for your custom order inquiry">
      <Text className="text-black text-[16px] font-semibold leading-[24px]">
        Thank you for your inquiry!
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Dear {customOrder.name},
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Thank you for your interest in our custom candles. We've received your inquiry and our team will review your requirements.
      </Text>

      <Section className="bg-[#f9f9f9] p-[16px] rounded-[4px] my-[16px]">
        <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px]">
          <strong>Your Request:</strong>
        </Text>
        <Text className="text-[#666666] text-[14px] leading-[20px] m-0">
          {customOrder.description}
        </Text>
        {customOrder.budgetRange && (
          <>
            <Text className="text-black text-[14px] leading-[20px] m-0 mb-[8px] mt-[12px]">
              <strong>Budget Range:</strong>
            </Text>
            <Text className="text-[#666666] text-[14px] leading-[20px] m-0">
              {customOrder.budgetRange}
            </Text>
          </>
        )}
      </Section>

      <Text className="text-black text-[14px] leading-[24px]">
        We'll get back to you within 24-48 hours with a custom quote and timeline for your project.
      </Text>

      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-[#D4AF37] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/products`}
        >
          Browse Our Collection
        </Button>
      </Section>
    </EmailLayout>
  );
}
```

## Phase 4: Supabase Integration

### Step 1: Create Database Functions for Email Triggers
```sql
-- Create email queue table for reliable delivery
CREATE TABLE email_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at);

-- Function to queue order confirmation email
CREATE OR REPLACE FUNCTION queue_order_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email for new orders
  IF TG_OP = 'INSERT' THEN
    INSERT INTO email_queue (to_email, subject, template_name, template_data)
    SELECT
      u.email,
      'Order Confirmation - #' || NEW.order_number,
      'order_confirmation',
      jsonb_build_object(
        'orderNumber', NEW.order_number,
        'totalAmount', NEW.total_amount,
        'shippingAddress', NEW.shipping_address,
        'orderId', NEW.id
      )
    FROM users u
    WHERE u.id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order confirmation emails
CREATE TRIGGER trigger_order_confirmation_email
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_order_confirmation_email();

-- Function to queue order status update email
CREATE OR REPLACE FUNCTION queue_order_status_update_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send email when status changes and it's not a new order
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND OLD.status != 'pending' THEN
    INSERT INTO email_queue (to_email, subject, template_name, template_data)
    SELECT
      u.email,
      'Order Update - #' || NEW.order_number,
      'order_status_update',
      jsonb_build_object(
        'orderNumber', NEW.order_number,
        'status', NEW.status,
        'totalAmount', NEW.total_amount,
        'orderId', NEW.id
      )
    FROM users u
    WHERE u.id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status updates
CREATE TRIGGER trigger_order_status_update_email
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_order_status_update_email();

-- Function to queue custom order inquiry email
CREATE OR REPLACE FUNCTION queue_custom_order_inquiry_email()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO email_queue (to_email, subject, template_name, template_data)
    VALUES (
      NEW.email,
      'Thank you for your custom order inquiry',
      'custom_order_inquiry',
      jsonb_build_object(
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'description', NEW.description,
        'budgetRange', NEW.budget_range,
        'isAdmin', false
      )
    );

    -- Also queue admin notification
    INSERT INTO email_queue (to_email, subject, template_name, template_data)
    VALUES (
      COALESCE(current_setting('app.admin_email', true), 'admin@lumidumi.com'),
      'New custom order inquiry from ' || NEW.name,
      'custom_order_inquiry',
      jsonb_build_object(
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'description', NEW.description,
        'budgetRange', NEW.budget_range,
        'isAdmin', true
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom order inquiries
CREATE TRIGGER trigger_custom_order_inquiry_email
  AFTER INSERT ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION queue_custom_order_inquiry_email();
```

### Step 2: Create Edge Function for Email Processing
```typescript
// supabase/functions/process-emails/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@0.16.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') ?? '');

    // Get pending emails
    const { data: emails, error } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw error;
    }

    const results = [];

    for (const email of emails) {
      try {
        // Mark as processing
        await supabaseClient
          .from('email_queue')
          .update({ status: 'processing', attempts: email.attempts + 1 })
          .eq('id', email.id);

        // Send email based on template
        let emailContent;

        switch (email.template_name) {
          case 'order_confirmation':
            emailContent = await generateOrderConfirmationEmail(email.template_data);
            break;
          case 'order_status_update':
            emailContent = await generateOrderStatusUpdateEmail(email.template_data);
            break;
          case 'custom_order_inquiry':
            emailContent = await generateCustomOrderInquiryEmail(email.template_data);
            break;
          default:
            throw new Error(`Unknown template: ${email.template_name}`);
        }

        const result = await resend.emails.send({
          from: 'Lumidumi <hello@lumidumi.com>',
          to: email.to_email,
          subject: email.subject,
          html: emailContent,
        });

        // Mark as sent
        await supabaseClient
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', email.id);

        results.push({ id: email.id, status: 'sent', result });

      } catch (emailError) {
        console.error(`Failed to send email ${email.id}:`, emailError);

        // Mark as failed or retry
        const shouldRetry = email.attempts < email.max_attempts;

        await supabaseClient
          .from('email_queue')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: emailError.message,
            scheduled_at: shouldRetry
              ? new Date(Date.now() + (email.attempts * 60000)).toISOString() // Exponential backoff
              : null
          })
          .eq('id', email.id);

        results.push({
          id: email.id,
          status: shouldRetry ? 'retrying' : 'failed',
          error: emailError.message
        });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Template generation functions
async function generateOrderConfirmationEmail(data: any): Promise<string> {
  // Basic HTML template - in production, use React Email
  return `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order #${data.orderNumber}!</p>
    <p>Total: ₹${data.totalAmount}</p>
    <p>We'll send you updates as your order progresses.</p>
  `;
}

async function generateOrderStatusUpdateEmail(data: any): Promise<string> {
  return `
    <h1>Order Update</h1>
    <p>Your order #${data.orderNumber} status has been updated to: ${data.status}</p>
    <p>Total: ₹${data.totalAmount}</p>
  `;
}

async function generateCustomOrderInquiryEmail(data: any): Promise<string> {
  if (data.isAdmin) {
    return `
      <h1>New Custom Order Inquiry</h1>
      <p><strong>Customer:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Description:</strong> ${data.description}</p>
      ${data.budgetRange ? `<p><strong>Budget:</strong> ${data.budgetRange}</p>` : ''}
    `;
  } else {
    return `
      <h1>Thank you for your inquiry!</h1>
      <p>Dear ${data.name},</p>
      <p>We've received your custom order inquiry and will get back to you within 24-48 hours.</p>
      <p>Your request: ${data.description}</p>
    `;
  }
}
```

## Phase 5: Vercel Integration

### Step 1: Environment Variables in Vercel
```bash
# Add these environment variables in Vercel Dashboard
# Settings > Environment Variables

RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=hello@lumidumi.com
ADMIN_EMAIL=admin@lumidumi.com
SUPPORT_EMAIL=support@lumidumi.com
```

### Step 2: Create API Routes for Email Testing
```typescript
// src/app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { type, data } = await request.json();

    let result;

    switch (type) {
      case 'order_confirmation':
        result = await EmailService.sendOrderConfirmation(data.order, data.email);
        break;
      case 'custom_order':
        result = await EmailService.sendCustomOrderInquiry(data.customOrder);
        break;
      case 'welcome':
        result = await EmailService.sendWelcomeEmail(data.user);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 3: Create Email Processing Cron Job
```typescript
// src/app/api/cron/process-emails/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Verify cron job authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call Supabase Edge Function to process emails
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.functions.invoke('process-emails');

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email processing cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 4: Configure Vercel Cron Jobs
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Phase 6: Testing and Monitoring

### Step 1: Email Testing Utility
```typescript
// src/lib/email-test.ts
import { EmailService } from './email';

export async function testEmailSetup() {
  const testData = {
    order: {
      orderNumber: 'TEST-001',
      totalAmount: 1299,
      items: [
        { name: 'Vanilla Dreams Candle', quantity: 1, price: 899 },
        { name: 'Lavender Bliss Candle', quantity: 1, price: 400 }
      ],
      shippingAddress: {
        name: 'Test Customer',
        line1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001'
      }
    },
    customOrder: {
      name: 'Test Customer',
      email: 'test@example.com',
      description: 'Custom candle with specific fragrance',
      budgetRange: '₹1000-₹2000'
    }
  };

  try {
    console.log('Testing order confirmation email...');
    await EmailService.sendOrderConfirmation(testData.order, 'test@example.com');

    console.log('Testing custom order inquiry email...');
    await EmailService.sendCustomOrderInquiry(testData.customOrder);

    console.log('All email tests passed!');
  } catch (error) {
    console.error('Email test failed:', error);
  }
}
```

### Step 2: Email Analytics Dashboard
```typescript
// src/app/admin/emails/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function EmailAnalyticsPage() {
  const [emailStats, setEmailStats] = useState(null);
  const [recentEmails, setRecentEmails] = useState([]);

  useEffect(() => {
    fetchEmailAnalytics();
  }, []);

  const fetchEmailAnalytics = async () => {
    const supabase = createClient();

    // Get email statistics
    const { data: stats } = await supabase
      .from('email_queue')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Get recent emails
    const { data: emails } = await supabase
      .from('email_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setEmailStats(stats);
    setRecentEmails(emails || []);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Email Analytics</h1>

      {/* Email statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Sent (24h)</h3>
          <p className="text-2xl font-bold text-green-600">
            {emailStats?.filter(e => e.status === 'sent').length || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {emailStats?.filter(e => e.status === 'pending').length || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Failed</h3>
          <p className="text-2xl font-bold text-red-600">
            {emailStats?.filter(e => e.status === 'failed').length || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
          <p className="text-2xl font-bold text-blue-600">
            {emailStats ? Math.round((emailStats.filter(e => e.status === 'sent').length / emailStats.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Recent emails table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Emails</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentEmails.map((email) => (
                <tr key={email.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{email.to_email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{email.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{email.template_name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      email.status === 'sent' ? 'bg-green-100 text-green-800' :
                      email.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {email.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(email.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

## Phase 7: Deployment Checklist

### Pre-deployment Checklist
- [ ] Resend API key configured in Vercel
- [ ] Domain DNS records configured
- [ ] Email templates tested
- [ ] Supabase triggers created
- [ ] Edge functions deployed
- [ ] Cron jobs configured
- [ ] Error handling implemented
- [ ] Email queue monitoring setup

### Post-deployment Verification
- [ ] Send test order confirmation email
- [ ] Verify custom order inquiry emails
- [ ] Check email delivery rates
- [ ] Monitor email queue processing
- [ ] Verify cron job execution
- [ ] Test email analytics dashboard

Your Resend email integration is now ready for production! 📧✨