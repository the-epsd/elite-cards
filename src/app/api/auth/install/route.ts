import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl } from '@/lib/shopify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 })
  }

  // Validate shop domain format
  const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`

  const redirectUri = `${process.env.APP_URL}/api/auth/callback`
  const authUrl = getShopifyAuthUrl(shopDomain, redirectUri)

  return NextResponse.redirect(authUrl)
}

