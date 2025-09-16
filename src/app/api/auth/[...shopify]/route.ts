import { NextRequest, NextResponse } from 'next/server'
import { getShopifyAuthUrl, validateShopifyCallback } from '@/lib/shopify'
import { createOrUpdateUser, createSession, setSessionCookie } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get('shop')
  const code = searchParams.get('code')
  const hmac = searchParams.get('hmac')
  const state = searchParams.get('state')

  // If no code, start OAuth flow
  if (!code) {
    if (!shop) {
      return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 })
    }

    // Validate shop domain format
    const shopDomain = shop.includes('.') ? shop : `${shop}.myshopify.com`
    const redirectUri = `${process.env.APP_URL}/api/auth/shopify`
    const authUrl = getShopifyAuthUrl(shopDomain, redirectUri)

    return NextResponse.redirect(authUrl)
  }

  // Handle OAuth callback
  try {
    const validation = await validateShopifyCallback({ 
      code: code || '', 
      shop: shop || '', 
      hmac: hmac || '', 
      state: state || '' 
    })

    if (!validation.success || !validation.session) {
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
      shopDomain: user.shopDomain,
      role: user.role as 'admin' | 'end_user',
    })

    // Redirect based on user role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/catalog'

    // Create response with session cookie
    const response = NextResponse.redirect(`${process.env.APP_URL}${redirectUrl}`)
    const cookieHeader = setSessionCookie(sessionToken)['Set-Cookie']
    response.headers.set('Set-Cookie', cookieHeader)

    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(`${process.env.APP_URL}/auth?error=authentication_failed`)
  }
}
