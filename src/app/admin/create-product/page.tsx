'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ArrowLeft, BarChart3, Plus, Users } from 'lucide-react'

export default function CreateProductPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    set: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Product created successfully!')
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <Package className="h-10 w-10 text-indigo-600" />
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
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/create-product')}
              className="w-full flex items-center px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-md"
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
            onClick={() => router.push('/admin')}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-3" />
            Back to Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
                <p className="text-sm text-gray-500">Add a new trading card to the catalog</p>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Charizard VMAX"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe the card's features, rarity, and appeal..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label htmlFor="set" className="block text-sm font-medium text-gray-700">
                      Card Set *
                    </label>
                    <select
                      name="set"
                      id="set"
                      required
                      value={formData.set}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a set</option>
                      <option value="Base Set">Base Set</option>
                      <option value="Jungle">Jungle</option>
                      <option value="Fossil">Fossil</option>
                      <option value="Team Rocket">Team Rocket</option>
                      <option value="Gym Heroes">Gym Heroes</option>
                      <option value="Gym Challenge">Gym Challenge</option>
                      <option value="Neo Genesis">Neo Genesis</option>
                      <option value="Neo Discovery">Neo Discovery</option>
                      <option value="Neo Revelation">Neo Revelation</option>
                      <option value="Neo Destiny">Neo Destiny</option>
                      <option value="Expedition">Expedition</option>
                      <option value="Aquapolis">Aquapolis</option>
                      <option value="Skyridge">Skyridge</option>
                      <option value="Ruby & Sapphire">Ruby & Sapphire</option>
                      <option value="Diamond & Pearl">Diamond & Pearl</option>
                      <option value="Black & White">Black & White</option>
                      <option value="XY">XY</option>
                      <option value="Sun & Moon">Sun & Moon</option>
                      <option value="Sword & Shield">Sword & Shield</option>
                      <option value="Scarlet & Violet">Scarlet & Violet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    required
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://example.com/card-image.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Use a high-quality image URL (300x192px recommended)
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
