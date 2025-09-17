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
    const query = searchParams.get('q') || 'Wurmple'
    const limit = parseInt(searchParams.get('limit') || '5')

    // Use the existing search function to get processed cards
    const cards = await searchPokemonCards(query, 'en', 1, limit)

    return NextResponse.json({
      success: true,
      query,
      totalResults: cards.length,
      limitedResults: cards.length,
      cards: cards.map(card => ({
        id: card.id,
        name: card.name,
        set: card.set,
        setId: card.setId,
        number: card.number,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
        marketPrice: card.marketPrice,
        lowPrice: card.lowPrice,
        highPrice: card.highPrice,
        tcgplayer: card.tcgplayer,
        cardmarket: card.cardmarket
      }))
    })
  } catch (error) {
    console.error('Error debugging TCGdex:', error)
    return NextResponse.json(
      { error: 'Failed to debug TCGdex', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
