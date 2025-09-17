import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { supabase, addProductToUser, isProductAddedByUser, getProductVariants } from '@/lib/supabase'
import { createProductInShopify } from '@/lib/shopify'

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
    const { productId, userId } = body

    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'Product ID and User ID are required' },
        { status: 400 }
      )
    }

    // Get the product from our database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get the user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if product is already added by this user
    const isAlreadyAdded = await isProductAddedByUser(userId, productId)
    if (isAlreadyAdded) {
      return NextResponse.json(
        { error: 'Product already added to this user\'s store' },
        { status: 400 }
      )
    }

    // Get variants if this is a single card
    let variants = undefined
    if (product.is_single) {
      variants = await getProductVariants(productId)
    }

    // Push product to Shopify
    const result = await createProductInShopify(
      user.access_token,
      user.shop_domain,
      {
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.image_url,
        set: product.set,
        is_single: product.is_single,
        variants: variants,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create product in Shopify' },
        { status: 500 }
      )
    }

    // Track that this product was added by this user
    await addProductToUser(userId, productId, result.productId!)

    return NextResponse.json({
      success: true,
      message: `Product successfully added to ${user.shop_domain}`,
      shopifyProductId: result.productId,
    })
  } catch (error) {
    console.error('Error pushing product to user:', error)
    return NextResponse.json(
      { error: 'Failed to push product to user' },
      { status: 500 }
    )
  }
}
