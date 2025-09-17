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

    let errorMessage = 'Failed to search Pokemon cards'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'The Pokemon TCG API is taking too long to respond. Please try again.'
        statusCode = 504
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('Pokemon TCG API error')) {
        errorMessage = 'Pokemon TCG API is currently unavailable. Please try again later.'
        statusCode = 503
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
