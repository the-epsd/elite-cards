import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('session')?.value
  console.log('Middleware - pathname:', pathname)
  console.log('Middleware - session token exists:', !!sessionToken)

  if (!sessionToken) {
    // No session, redirect to auth
    console.log('Middleware - No session token, redirecting to auth')
    const shop = request.nextUrl.searchParams.get('shop')
    const authUrl = shop ? `/auth?shop=${shop}` : '/auth'
    return NextResponse.redirect(new URL(authUrl, request.url))
  }

  // Verify session
  const session = await verifySession(sessionToken)
  console.log('Middleware - Session verification result:', !!session)
  if (session) {
    console.log('Middleware - Session details:', { userId: session.userId, shopDomain: session.shopDomain, role: session.role })
  }

  if (!session) {
    // Invalid session, redirect to auth
    console.log('Middleware - Invalid session, redirecting to auth')
    const shop = request.nextUrl.searchParams.get('shop')
    const authUrl = shop ? `/auth?shop=${shop}` : '/auth'
    const response = NextResponse.redirect(new URL(authUrl, request.url))
    response.cookies.delete('session')
    return response
  }

  // Check admin access for admin routes
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/catalog', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}

