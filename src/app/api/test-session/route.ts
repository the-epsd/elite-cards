import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value

  return NextResponse.json({
    hasSessionCookie: !!sessionToken,
    sessionToken: sessionToken ? sessionToken.substring(0, 50) + '...' : null,
    sessionValid: sessionToken ? !!verifySession(sessionToken) : false,
    sessionDetails: sessionToken ? verifySession(sessionToken) : null,
    allCookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
  })
}
