import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { removeProductFromUser, isProductAddedByUser } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product is actually added by the user
    const isAdded = await isProductAddedByUser(session.userId, productId)
    if (!isAdded) {
      return NextResponse.json(
        { error: 'Product not found in your store' },
        { status: 404 }
      )
    }

    // Remove the product from user's store
    await removeProductFromUser(session.userId, productId)

    return NextResponse.json({
      success: true,
      message: 'Product removed from your store successfully'
    })
  } catch (error) {
    console.error('Error removing product from store:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from store' },
      { status: 500 }
    )
  }
}
