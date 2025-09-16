import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')
  const hmac = searchParams.get('hmac')
  const state = searchParams.get('state')
  
  return NextResponse.json({
    message: 'OAuth callback test endpoint',
    hasCode: !!code,
    hasShop: !!shop,
    hasHmac: !!hmac,
    hasState: !!state,
    code: code?.substring(0, 10) + '...',
    shop: shop,
    hmac: hmac?.substring(0, 10) + '...',
    state: state,
    timestamp: new Date().toISOString()
  })
}
