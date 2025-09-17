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

    const { searchParams } = new URL(request.url)
    const language = (searchParams.get('language') as 'en' | 'fr' | 'es' | 'it' | 'pt' | 'de') || 'en'

    const sets = await getAllPokemonSets(language)

    return NextResponse.json({
      success: true,
      sets
    })
  } catch (error) {
    console.error('Error fetching Pokemon sets:', error)

    let errorMessage = 'Failed to fetch Pokemon sets'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'The TCGdex API is taking too long to respond. Please try again.'
        statusCode = 504
      } else if (error.message.includes('Rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
        statusCode = 429
      } else if (error.message.includes('TCGdex API error')) {
        errorMessage = 'TCGdex API is currently unavailable. Please try again later.'
        statusCode = 503
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}
