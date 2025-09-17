'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Package, Users, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SkeletonLoader from '@/components/SkeletonLoader'
import PageTransition from '@/components/PageTransition'
import { useNotification } from '@/contexts/NotificationContext'

interface Product {
  id: string
  title: string
  price: number
  set: string
  image_url: string
  created_at: string
}

interface User {
  id: string
  shop_domain: string
  role: 'admin' | 'end_user'
  created_at: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminPage() {
  const { showSuccess, showError } = useNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  })
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery || pagination.currentPage > 1) {
      fetchProducts()
    }
  }, [searchQuery, pagination.currentPage])

  const fetchData = async () => {
    try {
      const [productsResponse, usersResponse] = await Promise.all([
        fetchProducts(),
        fetch('/api/admin/users')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '25'
      })

      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim())
      }

      const response = await fetch(`/api/products/search?${params}`)

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/products/delete/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the product from the local state
        setProducts(products.filter(product => product.id !== productId))
        setDeleteConfirm({ show: false, product: null })
        showSuccess('Product deleted successfully!')
        // Refresh the product list to update pagination
        fetchProducts()
      } else {
        const error = await response.json()
        showError(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (product: Product) => {
    setDeleteConfirm({ show: true, product })
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, product: null })
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="admin" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-6 px-6">
            <SkeletonLoader type="stats" />
            <SkeletonLoader type="table" />
          </main>
        </div>
      </div>
    )
  }

  const adminUsers = users.filter(user => user.role === 'admin').length
  const endUsers = users.filter(user => user.role === 'end_user').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentPage="admin" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <PageTransition>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                        <dd className="text-lg font-medium text-gray-900">{products.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Admin Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{adminUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">End Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{endUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Search Bar */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-6 py-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products by title, description, set, or expansion..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {searchQuery ? `Search Results (${pagination.totalItems} found)` : 'Recent Products'}
                </h3>
                {pagination.totalItems > 0 && (
                  <span className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
                  </span>
                )}
              </div>
              <div className="px-6 py-4">
                {products.length === 0 ? (
                  <p className="text-gray-500">
                    {searchQuery ? 'No products found matching your search.' : 'No products created yet.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            {product.image_url && product.image_url.trim() !== '' ? (
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                width={48}
                                height={32}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Admin: Image failed to load:', product.image_url, 'for product:', product.title)
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <Package className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                            <p className="text-sm text-gray-500">{product.set} • ${product.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/admin/edit-product/${product.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => confirmDelete(product)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="text-xs text-gray-400">
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                          <span className="font-medium">{pagination.totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const startPage = Math.max(1, pagination.currentPage - 2)
                            const pageNum = startPage + i
                            if (pageNum > pagination.totalPages) return null

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === pagination.currentPage
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}

                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PageTransition>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && deleteConfirm.product && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete &quot;{deleteConfirm.product.title}&quot;? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm.product!.id)}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
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