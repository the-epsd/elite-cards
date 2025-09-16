import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, getUserFromSession } from '@/lib/auth'
import { removeProductFromUser, getAddedProductByUserAndProduct } from '@/lib/supabase'
import { deleteProductFromShopify } from '@/lib/shopify'

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

    // Get the added product record to get Shopify product ID
    const addedProduct = await getAddedProductByUserAndProduct(session.userId, productId)
    if (!addedProduct) {
      return NextResponse.json(
        { error: 'Product not found in your store' },
        { status: 404 }
      )
    }

    // Get user's access token and shop domain
    const user = await getUserFromSession(session)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the product from Shopify first
    const shopifyResult = await deleteProductFromShopify(
      user.access_token,
      user.shop_domain,
      addedProduct.shopify_product_id
    )

    if (!shopifyResult.success) {
      console.error('Failed to delete product from Shopify:', shopifyResult.error)
      return NextResponse.json(
        { error: `Failed to delete product from Shopify: ${shopifyResult.error}` },
        { status: 500 }
      )
    }

    // Remove the product from our database
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
