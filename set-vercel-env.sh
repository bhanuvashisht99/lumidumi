#!/bin/bash

# Set Vercel environment variables for production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_ACCESS_TOKEN production
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables have been set for production"
echo "Now run: vercel --prod"