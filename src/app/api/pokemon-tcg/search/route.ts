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
    const language = (searchParams.get('language') as 'en' | 'ja') || 'en'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const setId = searchParams.get('setId') || ''

    let cards
    if (setId) {
      // Get cards from specific set
      const { getCardsFromSet } = await import('@/lib/pokemon-tcg')
      cards = await getCardsFromSet(setId, language, page, pageSize)
    } else {
      // Search cards
      cards = await searchPokemonCards(query, language, page, pageSize)
    }

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
        errorMessage = 'The TCGdx API is taking too long to respond. Please try again.'
        statusCode = 504
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('TCGdx API error')) {
        errorMessage = 'TCGdx API is currently unavailable. Please try again later.'
        statusCode = 503
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
