import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { createPokemonProduct } from '@/lib/supabase'
import { pokemonTCG } from '@/lib/pokemon-tcg'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { pokemonCardId } = body

    if (!pokemonCardId) {
      return NextResponse.json(
        { error: 'Pokemon card ID is required' },
        { status: 400 }
      )
    }

    // Get card details from Pokemon TCG API
    const cardResponse = await pokemonTCG.getCardById(pokemonCardId)
    const card = cardResponse.data

    // Get market pricing
    const pricing = await pokemonTCG.getMarketPricing(card.name, card.set)

    // Convert to product format
    const productData = pokemonTCG.convertToProduct(card, pricing)

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
      message: 'Pokemon card product created successfully'
    })
  } catch (error) {
    console.error('Error adding Pokemon product:', error)
    return NextResponse.json(
      { error: 'Failed to add Pokemon product' },
      { status: 500 }
    )
  }
}
