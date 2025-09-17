import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit

    let supabaseQuery = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Add search filter if query is provided
    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,set.ilike.%${query}%,expansion.ilike.%${query}%`)
    }

    // Add pagination
    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1)

    const { data: products, error, count } = await supabaseQuery

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
