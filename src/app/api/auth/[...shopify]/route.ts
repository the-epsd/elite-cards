import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl, validateShopifyCallback } from '@/lib/shopify'
import { createOrUpdateUser, createSession, setSessionCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const hmac = searchParams.get('hmac')
  const state = searchParams.get('state')
  
  console.log('=== OAUTH ROUTE CALLED ===')
  console.log('URL:', request.url)
  console.log('Search params:', { shop, code: code?.substring(0, 10) + '...', hmac: hmac?.substring(0, 10) + '...', state })

  // If no code, start OAuth flow
  if (!code) {
    if (!shop) {
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 })
    }

    // Validate shop domain format
    const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`
    const appUrl = process.env.APP_URL || 'https://elite-cards.vercel.app'
    const redirectUri = `${appUrl}/api/auth/shopify`
    const authUrl = getShopifyAuthUrl(shopDomain, redirectUri)

    return NextResponse.redirect(authUrl)
  }

  // Handle OAuth callback
  try {
    console.log('=== OAUTH CALLBACK START ===')
    console.log('OAuth callback received:', { code, shop, hmac, state })
    console.log('Environment check:', {
      hasApiKey: !!process.env.SHOPIFY_API_KEY,
      hasApiSecret: !!process.env.SHOPIFY_API_SECRET_KEY,
      apiKey: process.env.SHOPIFY_API_KEY?.substring(0, 8) + '...',
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    })

    const validation = await validateShopifyCallback({
      code: code || '',
      shop: shop || '',
      hmac: hmac || '',
      state: state || ''
    })

    console.log('Validation result:', validation)

    if (!validation.success || !validation.session) {
      console.error('Validation failed:', validation.error)
      return NextResponse.json({ error: validation.error || 'Invalid callback' }, { status: 400 })
    }

    const { session } = validation
    const shopDomain = session.shop
    const accessToken = session.accessToken

    // Determine user role
    const role = 'end_user'

    // Store the access token and shop in your database
    const user = await createOrUpdateUser(shopDomain, accessToken, role)

    // Create JWT session
    const sessionToken = createSession({
      userId: user.id,
      shopDomain: user.shop_domain,
      role: user.role as 'admin' | 'end_user',
    })

    console.log('Session created:', { userId: user.id, shopDomain: user.shop_domain, role: user.role })
    console.log('Session token:', sessionToken.substring(0, 50) + '...')

    // Redirect based on user role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/catalog'
    console.log('Redirecting to:', redirectUrl)

    // Create response with session cookie
    const appUrl = process.env.APP_URL || 'https://elite-cards.vercel.app'
    const response = NextResponse.redirect(`${appUrl}${redirectUrl}`)
    
    // Set the session cookie directly
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    console.log('Cookie set directly on response')
    console.log('=== OAUTH CALLBACK END - REDIRECTING TO:', `${appUrl}${redirectUrl}`)

    return response
  } catch (error) {
    console.error('Auth error:', error)
    const appUrl = process.env.APP_URL || 'https://elite-cards.vercel.app'
    return NextResponse.redirect(`${appUrl}/auth?error=authentication_failed`)
  }
}
