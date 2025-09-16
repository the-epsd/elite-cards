import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasShopifyApiKey: !!process.env.SHOPIFY_API_KEY,
      hasShopifyApiSecret: !!process.env.SHOPIFY_API_SECRET_KEY,
      appUrl: process.env.APP_URL,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      apiKeyPreview: process.env.SHOPIFY_API_KEY?.substring(0, 8) + '...',
    },
    request: {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    }
  })
}
