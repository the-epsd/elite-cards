import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  // Only allow this in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  return NextResponse.json({
    hasApiKey: !!process.env.SHOPIFY_API_KEY,
    hasApiSecret: !!process.env.SHOPIFY_API_SECRET_KEY,
    hasAppUrl: !!process.env.APP_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    apiKeyPrefix: process.env.SHOPIFY_API_KEY?.substring(0, 8) + '...',
    appUrl: process.env.APP_URL,
    nodeEnv: process.env.NODE_ENV,
  })
}
