import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { updateProduct, getProductById } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { productId, title, description, price, imageUrl, expansion, set, isSingle } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await getProductById(productId)
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Prepare update data (only include fields that are provided)
    const updateData: {
      title?: string
      description?: string
      price?: number
      image_url?: string
      expansion?: string
      set?: string
      is_single?: boolean
    } = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (expansion !== undefined) updateData.expansion = expansion
    if (set !== undefined) updateData.set = set
    if (isSingle !== undefined) updateData.is_single = isSingle

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const product = await updateProduct(productId, updateData)

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}
