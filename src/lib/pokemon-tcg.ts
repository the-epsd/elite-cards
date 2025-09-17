import TCGdx, { Query } from '@tcgdex/sdk'

// TCGdex API integration for Pokemon TCG product data and pricing
export interface PokemonCard {
  id: string
  name: string
  set: string
  setId: string
  number: string
  rarity: string
  imageUrl: string
  marketPrice: number
  lowPrice: number
  midPrice: number
  highPrice: number
  lastUpdated: string
  language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de'
  tcgplayer?: {
    url: string
    updatedAt: string
    prices: {
      normal?: { low: number; mid: number; high: number; market: number }
      holofoil?: { low: number; mid: number; high: number; market: number }
      reverseHolofoil?: { low: number; mid: number; high: number; market: number }
      '1stEditionHolofoil'?: { low: number; mid: number; high: number; market: number }
      unlimitedHolofoil?: { low: number; mid: number; high: number; market: number }
    }
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice: number
      lowPrice: number
      trendPrice: number
      germanProLow: number
      suggestedPrice: number
      reverseHoloSell: number
      reverseHoloLow: number
      reverseHoloTrend: number
      lowPriceExPlus: number
      avg1: number
      avg7: number
      avg30: number
      reverseHoloAvg1: number
      reverseHoloAvg7: number
      reverseHoloAvg30: number
    }
  }
}

export interface PokemonSet {
  id: string
  name: string
  series: string
  total: number
  releaseDate: string
  symbolUrl: string
  logoUrl: string
  language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de'
}

export interface PokemonTCGResponse {
  data: PokemonCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

class PokemonTCGAPI {
  private tcgdex: TCGdx

  constructor() {
    this.tcgdex = new TCGdx('en')
  }

  private getTcgdex(language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de'): TCGdx {
    // For now, only support English as the SDK doesn't support Japanese
    // In the future, we could create multiple instances for different languages
    return this.tcgdex
  }

  async searchCards(query: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en', page = 1, pageSize = 250): Promise<PokemonTCGResponse> {
    try {
      const tcgdex = this.getTcgdex(language)
      let cards: unknown[] = []

      if (query.trim()) {
        // Search by name using TCGdx SDK
        const queryBuilder = Query.create().contains('name', query)
        cards = await tcgdex.card.list(queryBuilder)
      } else {
        // Get all cards with pagination
        const queryBuilder = Query.create().paginate(page, pageSize)
        cards = await tcgdex.card.list(queryBuilder)
      }

      // Transform the response to include pricing data
      const transformedCards = cards.map((card: unknown) => this.transformCardData(card as Record<string, unknown>, language))

      return {
        data: transformedCards,
        page,
        pageSize,
        count: transformedCards.length,
        totalCount: transformedCards.length
      }
    } catch (error) {
      console.error('Error searching cards:', error)
      throw new Error('Failed to search cards')
    }
  }

  async getCardById(id: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<{ data: PokemonCard }> {
    try {
      const tcgdex = this.getTcgdex(language)
      const card = await tcgdex.card.get(id)

      if (!card) {
        throw new Error('Card not found')
      }

      return {
        data: this.transformCardData(card as unknown as Record<string, unknown>, language)
      }
    } catch (error) {
      console.error('Error getting card by ID:', error)
      throw new Error('Failed to get card')
    }
  }

  async getCardsBySet(setId: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en', page = 1, pageSize = 250): Promise<PokemonTCGResponse> {
    try {
      const tcgdex = this.getTcgdex(language)
      const queryBuilder = Query.create()
        .equal('set.id', setId)
        .paginate(page, pageSize)

      const cards = await tcgdex.card.list(queryBuilder)

      // Transform the response to include pricing data
      const transformedCards = cards.map((card: unknown) => this.transformCardData(card as Record<string, unknown>, language))

      return {
        data: transformedCards,
        page,
        pageSize,
        count: transformedCards.length,
        totalCount: transformedCards.length
      }
    } catch (error) {
      console.error('Error getting cards by set:', error)
      throw new Error('Failed to get cards by set')
    }
  }

  async getSets(language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<{ data: PokemonSet[] }> {
    try {
      const tcgdex = this.getTcgdex(language)
      const sets = await tcgdex.set.list()
      const transformedSets = sets.map((set: unknown) => this.transformSetData(set as Record<string, unknown>, language))
      return { data: transformedSets }
    } catch (error) {
      console.error('Error getting sets:', error)
      throw new Error('Failed to get sets')
    }
  }

  async getSetById(id: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<{ data: PokemonSet }> {
    try {
      const tcgdex = this.getTcgdex(language)
      const set = await tcgdex.set.get(id)

      if (!set) {
        throw new Error('Set not found')
      }

      return {
        data: this.transformSetData(set as unknown as Record<string, unknown>, language)
      }
    } catch (error) {
      console.error('Error getting set by ID:', error)
      throw new Error('Failed to get set')
    }
  }

  // Transform TCGdex data to our format
  private transformCardData(card: Record<string, unknown>, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de'): PokemonCard {
    const pricing = this.extractPricingFromCard(card)

    return {
      id: String(card.id || ''),
      name: String(card.name || ''),
      set: String((card.set as Record<string, unknown>)?.name || ''),
      setId: String((card.set as Record<string, unknown>)?.id || ''),
      number: String(card.localId || card.id || ''),
      rarity: String(card.rarity || ''),
      imageUrl: String(card.image || ''),
      marketPrice: pricing.marketPrice,
      lowPrice: pricing.lowPrice,
      midPrice: pricing.midPrice,
      highPrice: pricing.highPrice,
      lastUpdated: pricing.lastUpdated,
      language: language,
      tcgplayer: card.tcgplayer as PokemonCard['tcgplayer'],
      cardmarket: card.cardmarket as PokemonCard['cardmarket']
    }
  }

  // Transform TCGdex set data to our format
  private transformSetData(set: Record<string, unknown>, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de'): PokemonSet {
    return {
      id: String(set.id || ''),
      name: String(set.name || ''),
      series: String((set.serie as Record<string, unknown>)?.name || ''),
      total: Number((set.cardCount as Record<string, unknown>)?.total || 0),
      releaseDate: String(set.releaseDate || ''),
      symbolUrl: String(set.logo || ''),
      logoUrl: String(set.logo || ''),
      language: language
    }
  }

  // Extract pricing data from TCGdex response
  private extractPricingFromCard(card: Record<string, unknown>): {
    marketPrice: number
    lowPrice: number
    midPrice: number
    highPrice: number
    lastUpdated: string
  } {
    // Try TCGPlayer pricing first
    const tcgplayer = card.tcgplayer as Record<string, unknown>
    if (tcgplayer?.prices) {
      const prices = tcgplayer.prices as Record<string, unknown>
      const normalPrices = (prices.normal || prices.holofoil || prices.reverseHolofoil) as Record<string, unknown>

      if (normalPrices) {
        return {
          marketPrice: Number(normalPrices.market || normalPrices.mid || 0),
          lowPrice: Number(normalPrices.low || 0),
          midPrice: Number(normalPrices.mid || 0),
          highPrice: Number(normalPrices.high || 0),
          lastUpdated: String(tcgplayer.updatedAt || new Date().toISOString())
        }
      }
    }

    // Try Cardmarket pricing as fallback
    const cardmarket = card.cardmarket as Record<string, unknown>
    if (cardmarket?.prices) {
      const prices = cardmarket.prices as Record<string, unknown>
      return {
        marketPrice: Number(prices.averageSellPrice || prices.trendPrice || 0),
        lowPrice: Number(prices.lowPrice || 0),
        midPrice: Number(prices.averageSellPrice || 0),
        highPrice: Number(prices.suggestedPrice || prices.trendPrice || 0),
        lastUpdated: String(cardmarket.updatedAt || new Date().toISOString())
      }
    }

    // Fallback to estimated pricing based on rarity and set
    const basePrice = this.getFallbackPrice(String(card.name || ''), String((card.set as Record<string, unknown>)?.name || ''))
    return {
      marketPrice: basePrice,
      lowPrice: basePrice * 0.7,
      midPrice: basePrice,
      highPrice: basePrice * 1.3,
      lastUpdated: new Date().toISOString()
    }
  }

  // Get market pricing data from TCGdex
  async getMarketPricing(cardName: string, set: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<{
    marketPrice: number
    lowPrice: number
    midPrice: number
    highPrice: number
    lastUpdated: string
  }> {
    try {
      // Search for the card to get current pricing
      const response = await this.searchCards(cardName, language, 1, 1)

      if (response.data.length > 0) {
        const card = response.data[0]
        return {
          marketPrice: card.marketPrice,
          lowPrice: card.lowPrice,
          midPrice: card.midPrice,
          highPrice: card.highPrice,
          lastUpdated: card.lastUpdated
        }
      }
    } catch (error) {
      console.warn('Error fetching pricing from TCGdex:', error)
    }

    // Fallback pricing based on card rarity and set
    const basePrice = this.getFallbackPrice(cardName, set)
    return {
      marketPrice: basePrice,
      lowPrice: basePrice * 0.7,
      midPrice: basePrice,
      highPrice: basePrice * 1.3,
      lastUpdated: new Date().toISOString()
    }
  }

  private getFallbackPrice(cardName: string, set: string): number {
    // Simple fallback pricing logic
    const rarityMultipliers: Record<string, number> = {
      'Common': 0.1,
      'Uncommon': 0.25,
      'Rare': 0.5,
      'Rare Holo': 1.0,
      'Rare Ultra': 2.0,
      'Rare Secret': 5.0,
      'Amazing Rare': 3.0,
      'Radiant Rare': 2.5
    }

    const setMultipliers: Record<string, number> = {
      'base': 10.0,
      'jungle': 8.0,
      'fossil': 7.0,
      'team-rocket': 6.0,
      'gym-heroes': 5.0,
      'gym-challenge': 5.0,
      'neo-genesis': 4.0,
      'neo-discovery': 4.0,
      'neo-revelation': 4.0,
      'neo-destiny': 4.0
    }

    const rarity = this.extractRarity(cardName)
    const rarityMultiplier = rarityMultipliers[rarity] || 1.0
    const setMultiplier = setMultipliers[set.toLowerCase()] || 1.0

    return Math.max(0.1, rarityMultiplier * setMultiplier)
  }

  private extractRarity(cardName: string): string {
    // Simple rarity extraction - in production you'd get this from the API
    if (cardName.includes('Secret') || cardName.includes('Rainbow')) return 'Rare Secret'
    if (cardName.includes('Ultra') || cardName.includes('GX') || cardName.includes('VMAX')) return 'Rare Ultra'
    if (cardName.includes('Holo') || cardName.includes('Holographic')) return 'Rare Holo'
    if (cardName.includes('Amazing')) return 'Amazing Rare'
    if (cardName.includes('Radiant')) return 'Radiant Rare'
    return 'Rare'
  }

  // Convert TCGdex data to our product format
  convertToProduct(card: PokemonCard, pricing: {
    marketPrice: number
    lowPrice: number
    midPrice: number
    highPrice: number
    lastUpdated: string
  }): {
    title: string
    description: string
    price: number
    imageUrl: string
    set: string
    is_single: boolean
    pokemonCardId: string
    marketData: {
      lowPrice: number
      midPrice: number
      highPrice: number
      lastUpdated: string
    }
  } {
    return {
      title: `${card.name} (${card.set})`,
      description: `Pokemon TCG ${card.name} from ${card.set} set. ${card.rarity} rarity card.`,
      price: pricing.marketPrice,
      imageUrl: card.imageUrl,
      set: card.set,
      is_single: true,
      pokemonCardId: card.id,
      marketData: {
        lowPrice: pricing.lowPrice,
        midPrice: pricing.midPrice,
        highPrice: pricing.highPrice,
        lastUpdated: pricing.lastUpdated
      }
    }
  }
}

export const pokemonTCG = new PokemonTCGAPI()

// Helper function to search for Pokemon cards
export async function searchPokemonCards(query: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en', page = 1, pageSize = 250): Promise<PokemonCard[]> {
  const response = await pokemonTCG.searchCards(query, language, page, pageSize)
  return response.data
}

// Helper function to get cards from a specific set
export async function getCardsFromSet(setId: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en', page = 1, pageSize = 250): Promise<PokemonCard[]> {
  const response = await pokemonTCG.getCardsBySet(setId, language, page, pageSize)
  return response.data
}

// Helper function to get all available sets
export async function getAllPokemonSets(language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<PokemonSet[]> {
  const response = await pokemonTCG.getSets(language)
  return response.data
}

// Helper function to get a card by ID
export async function getCardById(id: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<PokemonCard> {
  const response = await pokemonTCG.getCardById(id, language)
  return response.data
}

// Helper function to get market pricing
export async function getMarketPricing(cardName: string, set: string, language: 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de' = 'en'): Promise<{
  marketPrice: number
  lowPrice: number
  midPrice: number
  highPrice: number
  lastUpdated: string
}> {
  return pokemonTCG.getMarketPricing(cardName, set, language)
}

// Helper function to convert card to product
export function convertToProduct(card: PokemonCard, pricing: {
  marketPrice: number
  lowPrice: number
  midPrice: number
  highPrice: number
  lastUpdated: string
}): {
  title: string
  description: string
  price: number
  imageUrl: string
  set: string
  is_single: boolean
  pokemonCardId: string
  marketData: {
    lowPrice: number
    midPrice: number
    highPrice: number
    lastUpdated: string
  }
} {
  return pokemonTCG.convertToProduct(card, pricing)
}

