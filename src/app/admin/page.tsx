'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, Users, Plus, LogOut, BarChart3, Edit } from 'lucide-react'

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

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsResponse, usersResponse] = await Promise.all([
        fetch('/api/products/list'),
        fetch('/api/admin/users')
      ])

      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        // Flatten products from grouped structure
        const allProducts = Object.values(productsData.products).flat() as Product[]
        setProducts(allProducts)
      }

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

  const handleLogout = () => {
    document.cookie = 'session=; Path=/; Max-Age=0'
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const adminUsers = users.filter(user => user.role === 'admin').length
  const endUsers = users.filter(user => user.role === 'end_user').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <BarChart3 className="h-10 w-10 text-indigo-600" />
            <h1 className="ml-3 text-xl font-bold text-gray-900">Elite Cards</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Admin
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-md"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/create-product')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4 mr-3" />
              Create Product
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Users className="h-4 w-4 mr-3" />
              Manage Users
            </button>
            <button
              onClick={() => router.push('/catalog')}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Package className="h-4 w-4 mr-3" />
              View Catalog
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
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


          {/* Recent Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
            </div>
            <div className="px-6 py-4">
              {products.length === 0 ? (
                <p className="text-gray-500">No products created yet.</p>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-8 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                          <p className="text-sm text-gray-500">{product.set} • ${product.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/admin/edit-product/${product.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
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
          </div>
        </main>
      </div>
    </div>
  )
}