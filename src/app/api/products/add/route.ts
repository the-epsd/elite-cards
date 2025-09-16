import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { createProduct, createProductVariants } from '@/lib/supabase'

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
    const { title, description, price, imageUrl, set, isSingle } = body

    if (!title || !description || !price || !imageUrl || !set) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = await createProduct({
      title,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
      set,
      created_by: session.userId,
      is_single: isSingle || false,
    })

    // If it's a single card, create variants
    if (isSingle) {
      await createProductVariants(product.id, parseFloat(price))
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    )
  }
}

