import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getAddedProductsByUser } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addedProducts = await getAddedProductsByUser(session.userId)

    // Return just the product IDs for easy checking
    const addedProductIds = addedProducts.map(ap => ap.product_id)

    return NextResponse.json({ addedProductIds })
  } catch (error) {
    console.error('Error fetching added products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch added products' },
      { status: 500 }
    )
  }
}
