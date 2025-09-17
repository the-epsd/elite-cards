import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getAllPokemonSets } from '@/lib/pokemon-tcg'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const sets = await getAllPokemonSets()

    return NextResponse.json({
      success: true,
      sets
    })
  } catch (error) {
    console.error('Error fetching Pokemon sets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pokemon sets' },
      { status: 500 }
    )
  }
}
