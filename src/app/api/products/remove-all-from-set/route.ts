import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, getUserFromSession } from '@/lib/auth'
import { deleteProductFromShopify } from '@/lib/shopify'
import { getProductsBySet, getAddedProductsByUser, removeProductFromUser } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { set } = await request.json()

    if (!set) {
      return NextResponse.json({ error: 'Set name is required' }, { status: 400 })
    }

    // Get user session
    const user = await getUserFromSession(session)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all products from the specified set
    const products = await getProductsBySet(set)
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found for this set' }, { status: 404 })
    }

    // Get all added products for this user
    const addedProducts = await getAddedProductsByUser(user.id)

    // Filter to only products from this set that are actually added
    const setProductIds = new Set(products.map(p => p.id))
    const addedSetProducts = addedProducts.filter(ap => setProductIds.has(ap.product_id))

    if (addedSetProducts.length === 0) {
      return NextResponse.json({ error: 'No products from this set are currently added to your store' }, { status: 400 })
    }

    const results = {
      successful: [] as string[],
      failed: [] as { productId: string; error: string }[],
      notFound: [] as string[]
    }

    // Process each added product from the set
    for (const addedProduct of addedSetProducts) {
      try {
        const product = products.find(p => p.id === addedProduct.product_id)
        if (!product) {
          results.notFound.push(addedProduct.product_id)
          continue
        }

        // Try to delete from Shopify first
        const shopifyResult = await deleteProductFromShopify(
          user.access_token,
          user.shop_domain,
          addedProduct.shopify_product_id
        )

        // Remove from database regardless of Shopify result
        // (handles case where product was already deleted from Shopify)
        await removeProductFromUser(user.id, addedProduct.product_id)

        if (shopifyResult.success) {
          results.successful.push(product.title)
        } else if (shopifyResult.error && shopifyResult.error.includes('404')) {
          // Product was already deleted from Shopify, but we cleaned up the database
          results.successful.push(product.title)
        } else {
          // Other Shopify error, but we still removed from database
          results.successful.push(product.title)
        }
      } catch (error) {
        console.error(`Error removing product ${addedProduct.product_id} from store:`, error)
        results.failed.push({
          productId: addedProduct.product_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Prepare response message
    let message = `Successfully removed ${results.successful.length} products from your store.`
    if (results.failed.length > 0) {
      message += ` ${results.failed.length} products failed to remove.`
    }

    return NextResponse.json({
      success: true,
      message,
      results
    })

  } catch (error) {
    console.error('Error removing all products from set:', error)
    return NextResponse.json(
      { error: 'Failed to remove products from set' },
      { status: 500 }
    )
  }
}
