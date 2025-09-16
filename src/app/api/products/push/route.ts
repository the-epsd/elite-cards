import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, getUserFromSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createProductInShopify } from '@/lib/shopify'

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

    // Get the product from our database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get user's access token
    const user = await getUserFromSession(session)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Push product to Shopify
    const result = await createProductInShopify(
      user.accessToken,
      user.shopDomain,
      {
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        set: product.set,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create product in Shopify' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product successfully added to your Shopify store',
      shopifyProductId: result.productId,
    })
  } catch (error) {
    console.error('Error pushing product to Shopify:', error)
    return NextResponse.json(
      { error: 'Failed to push product to Shopify' },
      { status: 500 }
    )
  }
}

