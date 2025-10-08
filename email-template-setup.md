# Email Branding Setup for Lumidumi

## Steps to Brand Your Authentication Emails:

### 1. **Supabase Dashboard Settings:**
1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **"Email Templates"** section
3. Update the following templates:

### 2. **Confirm Signup Email Template:**
```html
<h2>Welcome to Lumidumi!</h2>
<p>Thank you for signing up. Please click the link below to confirm your email address and activate your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
<p>Best regards,<br>The Lumidumi Team</p>
<hr>
<p style="font-size: 12px; color: #666;">
  Lumidumi - Handcrafted Candles<br>
  Mumbai, India<br>
  hello@lumidumi.com
</p>
```

### 3. **Magic Link Email Template:**
```html
<h2>Sign in to Lumidumi</h2>
<p>Click the link below to sign in to your Lumidumi account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Lumidumi</a></p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>The Lumidumi Team</p>
<hr>
<p style="font-size: 12px; color: #666;">
  Lumidumi - Handcrafted Candles<br>
  Mumbai, India<br>
  hello@lumidumi.com
</p>
```

### 4. **Reset Password Email Template:**
```html
<h2>Reset Your Lumidumi Password</h2>
<p>You requested to reset your password for your Lumidumi account.</p>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>Best regards,<br>The Lumidumi Team</p>
<hr>
<p style="font-size: 12px; color: #666;">
  Lumidumi - Handcrafted Candles<br>
  Mumbai, India<br>
  hello@lumidumi.com
</p>
```

### 5. **Email Settings to Update:**
- **Site URL:** `https://lumidumi.com`
- **From Email:** Set to your domain email (if you have one)
- **Email Templates:** Use the templates above

### 6. **Additional Branding:**
- **Custom SMTP:** Consider setting up custom SMTP with your domain
- **Logo:** Add your Lumidumi logo to the email templates
- **Colors:** Match your brand colors (#D4A574 for cream-300)

## Quick Setup Instructions:
1. Copy the HTML templates above
2. Go to Supabase Dashboard → Auth → Settings → Email Templates
3. Replace the default templates with the branded ones
4. Update Site URL to `https://lumidumi.com`
5. Save changes

Your users will now receive beautifully branded emails from "Lumidumi" instead of generic Supabase emails!