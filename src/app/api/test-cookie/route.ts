import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  const response = NextResponse.json({
    message: 'Cookie test',
    timestamp: new Date().toISOString()
  })

  // Set a test cookie
  response.cookies.set('test-cookie', 'test-value-123', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  })

  console.log('Test cookie set')

  return response
}
