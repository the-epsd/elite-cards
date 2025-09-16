'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, Package, Trash2, Plus } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SkeletonLoader from '@/components/SkeletonLoader'
import PageTransition from '@/components/PageTransition'
import { useNotification } from '@/contexts/NotificationContext'

interface Product {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  set: string
  created_at: string
}

export default function CatalogPage() {
  const { showSuccess, showError } = useNotification()
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const [addingToStore, setAddingToStore] = useState<string | null>(null)
  const [removingFromStore, setRemovingFromStore] = useState<string | null>(null)
  const [addingAllFromSet, setAddingAllFromSet] = useState<string | null>(null)
  const [removingAllFromSet, setRemovingAllFromSet] = useState<string | null>(null)
  const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set())
  const [removeConfirm, setRemoveConfirm] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  })
  const [removeAllConfirm, setRemoveAllConfirm] = useState<{ show: boolean; set: string | null }>({
    show: false,
    set: null
  })

  useEffect(() => {
    fetchProducts()
    fetchAddedProducts()
  }, [])


  const fetchAddedProducts = async () => {
    try {
      const response = await fetch('/api/products/added')
      if (response.ok) {
        const data = await response.json()
        setAddedProductIds(new Set(data.addedProductIds))
      }
    } catch (error) {
      console.error('Error fetching added products:', error)
    }
  }

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
        showSuccess(data.message || 'Product successfully added to your store!')
        // Update the added products list
        setAddedProductIds(prev => new Set([...prev, productId]))
      } else {
        const error = await response.json()
        showError(error.error || 'Failed to add product to store')
      }
    } catch (error) {
      console.error('Error adding product to store:', error)
      showError('Failed to add product to store')
    } finally {
      setAddingToStore(null)
    }
  }

  const handleRemoveFromStore = async (productId: string) => {
    setRemovingFromStore(productId)

    try {
      const response = await fetch('/api/products/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess(data.message || 'Product removed from your store!')
        // Update the added products list
        setAddedProductIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
        setRemoveConfirm({ show: false, product: null })
      } else {
        const error = await response.json()
        showError(error.error || 'Failed to remove product from store')
      }
    } catch (error) {
      console.error('Error removing product from store:', error)
      showError('Failed to remove product from store')
    } finally {
      setRemovingFromStore(null)
    }
  }

  const confirmRemove = (product: Product) => {
    setRemoveConfirm({ show: true, product })
  }

  const cancelRemove = () => {
    setRemoveConfirm({ show: false, product: null })
  }

  const isAllProductsInSetAdded = (set: string) => {
    const setProducts = products[set] || []
    return setProducts.length > 0 && setProducts.every(product => addedProductIds.has(product.id))
  }

  const handleAddAllFromSet = async (set: string) => {
    setAddingAllFromSet(set)

    try {
      const response = await fetch('/api/products/add-all-from-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ set }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess(data.message || 'Products successfully added to your store!')
        // Refresh the added products list
        fetchAddedProducts()
      } else {
        const error = await response.json()
        showError(error.error || 'Failed to add products to store')
      }
    } catch (error) {
      console.error('Error adding all products from set:', error)
      showError('Failed to add products to store')
    } finally {
      setAddingAllFromSet(null)
    }
  }

  const handleRemoveAllFromSet = async (set: string) => {
    setRemovingAllFromSet(set)

    try {
      const response = await fetch('/api/products/remove-all-from-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ set }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccess(data.message || 'Products successfully removed from your store!')
        // Refresh the added products list
        fetchAddedProducts()
      } else {
        const error = await response.json()
        showError(error.error || 'Failed to remove products from store')
      }
    } catch (error) {
      console.error('Error removing all products from set:', error)
      showError('Failed to remove products from store')
    } finally {
      setRemovingAllFromSet(null)
    }
  }

  const confirmRemoveAll = (set: string) => {
    setRemoveAllConfirm({ show: true, set })
  }

  const cancelRemoveAll = () => {
    setRemoveAllConfirm({ show: false, set: null })
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="catalog" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-6 px-6">
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
            <SkeletonLoader type="card" count={2} />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentPage="catalog" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <PageTransition>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{set}</h3>
                          <p className="text-sm text-gray-500">{setProducts.length} cards available</p>
                        </div>
                        {isAllProductsInSetAdded(set) ? (
                          <div className="flex space-x-2">
                            <button
                              disabled
                              className="flex items-center px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              All Added
                            </button>
                            <button
                              onClick={() => confirmRemoveAll(set)}
                              disabled={removingAllFromSet === set}
                              className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {removingAllFromSet === set ? 'Removing All...' : 'Remove All'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddAllFromSet(set)}
                            disabled={addingAllFromSet === set}
                            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {addingAllFromSet === set ? 'Adding All...' : 'Add All'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                      {setProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                            {product.image_url && product.image_url.trim() !== '' ? (
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Image failed to load:', product.image_url, 'for product:', product.title)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="text-center">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">No image</p>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{product.title}</h4>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-indigo-600">${product.price}</span>
                              {addedProductIds.has(product.id) ? (
                                <div className="flex space-x-2">
                                  <button
                                    disabled
                                    className="flex items-center px-3 py-2 bg-gray-400 text-white text-sm rounded-md cursor-not-allowed"
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Added
                                  </button>
                                  <button
                                    onClick={() => confirmRemove(product)}
                                    disabled={removingFromStore === product.id}
                                    className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove from store"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToStore(product.id)}
                                  disabled={addingToStore === product.id}
                                  className="flex items-center px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  {addingToStore === product.id ? 'Adding...' : 'Add to Store'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PageTransition>
        </main>
      </div>

      {/* Remove Confirmation Dialog */}
      {removeConfirm.show && removeConfirm.product && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Remove Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove &quot;{removeConfirm.product.title}&quot; from your store? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleRemoveFromStore(removeConfirm.product!.id)}
                  disabled={removingFromStore === removeConfirm.product.id}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {removingFromStore === removeConfirm.product.id ? 'Removing...' : 'Remove'}
                </button>
                <button
                  onClick={cancelRemove}
                  disabled={removingFromStore === removeConfirm.product.id}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove All Confirmation Dialog */}
      {removeAllConfirm.show && removeAllConfirm.set && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Remove All Products</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove all products from &quot;{removeAllConfirm.set}&quot; from your store? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleRemoveAllFromSet(removeAllConfirm.set!)}
                  disabled={removingAllFromSet === removeAllConfirm.set}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {removingAllFromSet === removeAllConfirm.set ? 'Removing...' : 'Remove All'}
                </button>
                <button
                  onClick={cancelRemoveAll}
                  disabled={removingAllFromSet === removeAllConfirm.set}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

