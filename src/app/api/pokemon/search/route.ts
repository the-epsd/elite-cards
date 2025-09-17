import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { searchPokemonCards } from '@/lib/pokemon-tcg'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const cards = await searchPokemonCards(query, page, pageSize)

    return NextResponse.json({
      success: true,
      cards,
      pagination: {
        page,
        pageSize,
        total: cards.length
      }
    })
  } catch (error) {
    console.error('Error searching Pokemon cards:', error)
    return NextResponse.json(
      { error: 'Failed to search Pokemon cards' },
      { status: 500 }
    )
  }
}
