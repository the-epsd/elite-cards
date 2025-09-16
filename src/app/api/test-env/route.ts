import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT SET',
    SHOPIFY_API_SECRET_KEY: (process.env.SHOPIFY_API_SECRET_KEY || process.env.SHOPIFY_API_SECRET) ? 'SET' : 'NOT SET',
    APP_URL: process.env.APP_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    // Show first few characters for verification (don't expose full keys)
    apiKeyPrefix: process.env.SHOPIFY_API_KEY?.substring(0, 8) + '...',
    secretKeyPrefix: (process.env.SHOPIFY_API_SECRET_KEY || process.env.SHOPIFY_API_SECRET)?.substring(0, 8) + '...',
  })
}
