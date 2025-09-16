import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop') || 'elite-cards-8514.myshopify.com'
  
  const appUrl = process.env.APP_URL || 'https://elite-cards.vercel.app'
  const redirectUri = `${appUrl}/api/auth/shopify`
  const authUrl = getShopifyAuthUrl(shop, redirectUri)
  
  return NextResponse.json({
    shop: shop,
    appUrl: appUrl,
    redirectUri: redirectUri,
    authUrl: authUrl,
    environment: {
      hasApiKey: !!process.env.SHOPIFY_API_KEY,
      hasApiSecret: !!process.env.SHOPIFY_API_SECRET_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
      apiKey: process.env.SHOPIFY_API_KEY?.substring(0, 8) + '...',
    }
  })
}
