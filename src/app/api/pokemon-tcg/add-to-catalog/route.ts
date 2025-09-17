import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getCardById, getMarketPricing, convertToProduct } from '@/lib/pokemon-tcg'
import { createPokemonProduct } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { pokemonCardId, language = 'en' } = await request.json()

    if (!pokemonCardId) {
      return NextResponse.json({ error: 'Pokemon card ID is required' }, { status: 400 })
    }

    // Get card data from TCGdx
    const card = await getCardById(pokemonCardId, language as 'en' | 'ja')

    // Get current market pricing
    const pricing = await getMarketPricing(card.name, card.set, language as 'en' | 'ja')

    // Convert to product format
    const productData = convertToProduct(card, pricing)

    // Create product in database
    const product = await createPokemonProduct({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      image_url: productData.imageUrl,
      set: productData.set,
      created_by: session.userId,
      pokemon_card_id: productData.pokemonCardId,
      market_data: {
        low_price: productData.marketData.lowPrice,
        mid_price: productData.marketData.midPrice,
        high_price: productData.marketData.highPrice,
        last_updated: productData.marketData.lastUpdated
      }
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Card added to catalog successfully'
    })
  } catch (error) {
    console.error('Error adding card to catalog:', error)

    let errorMessage = 'Failed to add card to catalog'
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
