import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, getUserFromSession } from '@/lib/auth'
import { createProductInShopify } from '@/lib/shopify'
import { addProductToUser, getProductsBySet, isProductAddedByUser } from '@/lib/supabase'

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

    const results = {
      successful: [] as string[],
      failed: [] as { productId: string; error: string }[],
      alreadyAdded: [] as string[]
    }

    // Process each product in the set
    for (const product of products) {
      try {
        // Check if product is already added to user's store
        const isAlreadyAdded = await isProductAddedByUser(user.id, product.id)
        if (isAlreadyAdded) {
          results.alreadyAdded.push(product.title)
          continue
        }

        // Add product to Shopify
        const shopifyProduct = await createProductInShopify(
          user.access_token,
          user.shop_domain,
          {
            title: product.title,
            description: product.description,
            price: product.price,
            imageUrl: product.image_url,
            set: product.set,
            is_single: product.is_single
          }
        )

        // Update the added_products record with Shopify product ID
        await addProductToUser(user.id, product.id, shopifyProduct.productId!)

        results.successful.push(product.title)
      } catch (error) {
        console.error(`Error adding product ${product.title} to store:`, error)
        results.failed.push({
          productId: product.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Prepare response message
    let message = `Successfully added ${results.successful.length} products to your store.`
    if (results.alreadyAdded.length > 0) {
      message += ` ${results.alreadyAdded.length} products were already in your store.`
    }
    if (results.failed.length > 0) {
      message += ` ${results.failed.length} products failed to add.`
    }

    return NextResponse.json({
      success: true,
      message,
      results
    })

  } catch (error) {
    console.error('Error adding all products from set:', error)
    return NextResponse.json(
      { error: 'Failed to add products from set' },
      { status: 500 }
    )
  }
}
