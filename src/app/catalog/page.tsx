'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, LogOut, Package } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  set: string
  createdAt: string
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [addingToStore, setAddingToStore] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/list')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToStore = async (productId: string) => {
    setAddingToStore(productId)

    try {
      const response = await fetch('/api/products/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Product successfully added to your store!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add product to store')
      }
    } catch (error) {
      console.error('Error adding product to store:', error)
      alert('Failed to add product to store')
    } finally {
      setAddingToStore(null)
    }
  }

  const handleLogout = () => {
    document.cookie = 'session=; Path=/; Max-Age=0'
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Elite Cards Catalog</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Premium Trading Cards</h2>
            <p className="text-gray-600">Add these exclusive cards to your Shopify store with one click</p>
          </div>

          <div className="space-y-8">
            {Object.keys(products).length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new card sets.</p>
              </div>
            ) : (
              Object.entries(products).map(([set, setProducts]) => (
                <div key={set} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">{set}</h3>
                    <p className="text-sm text-gray-500">{setProducts.length} cards available</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {setProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={300}
                          height={192}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{product.title}</h4>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-indigo-600">${product.price}</span>
                            <button
                              onClick={() => handleAddToStore(product.id)}
                              disabled={addingToStore === product.id}
                              className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              {addingToStore === product.id ? 'Adding...' : 'Add to Store'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

