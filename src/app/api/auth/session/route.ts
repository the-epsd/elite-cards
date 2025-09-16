import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ session: null })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ session: null })
  }
}
