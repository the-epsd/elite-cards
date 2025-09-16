import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getProductsBySet, getAllProducts } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const set = searchParams.get('set')

    const products = set ? await getProductsBySet(set) : await getAllProducts()

    // Group products by set
    const productsBySet = products.reduce((acc, product) => {
      if (!acc[product.set]) {
        acc[product.set] = []
      }
      acc[product.set].push(product)
      return acc
    }, {} as Record<string, typeof products>)

    return NextResponse.json({ products: productsBySet })
  } catch (error) {
    console.error('Error listing products:', error)
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    )
  }
}

