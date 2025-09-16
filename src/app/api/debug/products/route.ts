import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const products = await getAllProducts()

    return NextResponse.json({
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        image_url: p.image_url,
        set: p.set
      }))
    })
  } catch (error) {
    console.error('Error fetching products for debug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
