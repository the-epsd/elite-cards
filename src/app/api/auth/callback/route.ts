import { NextRequest, NextResponse } from 'next/server'
import { validateShopifyCallback } from '@/lib/shopify'
import { createOrUpdateUser, createSession, setSessionCookie } from '@/lib/auth'

interface ShopifySession {
  shop: string
  accessToken: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  try {
    // Validate the Shopify callback
    const validation = await validateShopifyCallback(Object.fromEntries(searchParams))

    if (!validation.success || !validation.session) {
      return NextResponse.json({ error: validation.error || 'Invalid callback' }, { status: 400 })
    }

    const { session } = validation
    const shopDomain = (session as ShopifySession).shop
    const accessToken = (session as ShopifySession).accessToken

    // Determine user role (you can implement logic here to determine if user is admin)
    // For now, we'll default to 'end_user' and allow manual admin assignment
    const role = 'end_user'

    // Create or update user in database
    const user = await createOrUpdateUser(shopDomain, accessToken, role)

    // Create JWT session
    const sessionToken = createSession({
      userId: user.id,
      shopDomain: user.shopDomain,
      role: user.role as 'admin' | 'end_user',
    })

    // Redirect based on role
    const redirectUrl = user.role === 'admin' ? '/admin' : '/catalog'

    const response = NextResponse.redirect(`${process.env.APP_URL}${redirectUrl}`)
    const cookieHeader = setSessionCookie(sessionToken)['Set-Cookie']
    response.headers.set('Set-Cookie', cookieHeader)

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

