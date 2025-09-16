import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const set = searchParams.get('set')

    const where = set ? { set } : {}

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

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

