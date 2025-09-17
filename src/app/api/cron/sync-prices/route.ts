import { NextRequest, NextResponse } from 'next/server'
import {
  getProductsWithAutoSync,
  updateProductPrice,
  getUsersWithProduct,
  updateShopifyProductPrice
} from '@/lib/supabase'
import { pokemonTCG } from '@/lib/pokemon-tcg'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request (you might want to add additional security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting scheduled price sync...')

    // Get all products with auto price sync enabled
    const products = await getProductsWithAutoSync()

    if (products.length === 0) {
      console.log('No products with auto price sync enabled')
      return NextResponse.json({
        success: true,
        message: 'No products with auto price sync enabled',
        updated: 0
      })
    }

    let updatedCount = 0
    const errors: string[] = []

    // Process each product
    for (const product of products) {
      try {
        if (!product.pokemon_card_id) {
          console.warn(`Product ${product.id} has auto price sync enabled but no Pokemon card ID`)
          continue
        }

        // Get current market pricing
        const cardResponse = await pokemonTCG.getCardById(product.pokemon_card_id)
        const card = cardResponse.data
        const pricing = await pokemonTCG.getMarketPricing(card.name, card.set)

        // Check if price has changed significantly (more than 5% difference)
        const priceDifference = Math.abs(pricing.marketPrice - product.price) / product.price
        const shouldUpdate = priceDifference > 0.05 // 5% threshold

        if (shouldUpdate) {
          console.log(`Updating price for ${product.title}: $${product.price} → $${pricing.marketPrice}`)

          // Update product price in our database
          await updateProductPrice(product.id, pricing.marketPrice, {
            low_price: pricing.lowPrice,
            mid_price: pricing.midPrice,
            high_price: pricing.highPrice,
            last_updated: pricing.lastUpdated
          })

          // Get all users who have this product
          const usersWithProduct = await getUsersWithProduct(product.id)

          // Update price in each user's Shopify store
          for (const addedProduct of usersWithProduct) {
            try {
              const user = addedProduct.users
              if (!user) continue

              const updateResult = await updateShopifyProductPrice(
                user.access_token,
                user.shop_domain,
                addedProduct.shopify_product_id,
                pricing.marketPrice
              )

              if (!updateResult.success) {
                console.error(`Failed to update Shopify price for ${user.shop_domain}:`, updateResult.error)
                errors.push(`${user.shop_domain}: ${updateResult.error}`)
              }
            } catch (error) {
              console.error(`Error updating Shopify price for product ${product.id}:`, error)
              errors.push(`Shopify update error: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }

          updatedCount++
        } else {
          console.log(`Price for ${product.title} hasn't changed significantly (${(priceDifference * 100).toFixed(1)}% difference)`)
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error)
        errors.push(`Product ${product.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`Price sync completed. Updated ${updatedCount} products.`)

    return NextResponse.json({
      success: true,
      message: `Scheduled price sync completed. Updated ${updatedCount} products.`,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in scheduled price sync:', error)
    return NextResponse.json(
      { error: 'Failed to sync prices' },
      { status: 500 }
    )
  }
}
