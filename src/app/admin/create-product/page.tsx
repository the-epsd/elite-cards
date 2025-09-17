'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PageTransition from '@/components/PageTransition'
import { useNotification } from '@/contexts/NotificationContext'
import { getExpansions, getSetsByExpansion, type Expansion, type Set } from '@/lib/expansions'

export default function CreateProductPage() {
  const { showSuccess, showError } = useNotification()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    expansion: '',
    set: '',
    isSingle: false
  })
  const [loading, setLoading] = useState(false)
  const [expansions, setExpansions] = useState<Expansion[]>([])
  const [availableSets, setAvailableSets] = useState<Set[]>([])
  const router = useRouter()

  useEffect(() => {
    setExpansions(getExpansions())
  }, [])

  useEffect(() => {
    if (formData.expansion) {
      setAvailableSets(getSetsByExpansion(formData.expansion))
      // Reset set selection when expansion changes
      setFormData(prev => ({ ...prev, set: '' }))
    } else {
      setAvailableSets([])
    }
  }, [formData.expansion])

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
        showSuccess('Product created successfully!')
        router.push('/admin')
      } else {
        const error = await response.json()
        showError(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      showError('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentPage="create-product" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <div className="max-w-2xl mx-auto">
            <PageTransition>
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
                  <p className="text-sm text-gray-500">Add a new trading card to the catalog</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-800">
                      Card Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                      placeholder="e.g., Charizard VMAX"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 resize-none"
                      placeholder="Describe the card's features, rarity, and appeal..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="price" className="block text-sm font-semibold text-gray-800">
                        Price (USD) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          id="price"
                          step="0.01"
                          min="0"
                          required
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                          placeholder="29.99"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="expansion" className="block text-sm font-semibold text-gray-800">
                        Expansion *
                      </label>
                      <select
                        name="expansion"
                        id="expansion"
                        required
                        value={formData.expansion}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
                      >
                        <option value="">Select an expansion</option>
                        {expansions.map((expansion) => (
                          <option key={expansion.id} value={expansion.id}>
                            {expansion.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="set" className="block text-sm font-semibold text-gray-800">
                      Set *
                    </label>
                    <select
                      name="set"
                      id="set"
                      required
                      value={formData.set}
                      onChange={handleChange}
                      disabled={!formData.expansion || availableSets.length === 0}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all duration-200 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.expansion
                          ? 'Select an expansion first'
                          : availableSets.length === 0
                            ? 'No sets available'
                            : 'Select a set'
                        }
                      </option>
                      {availableSets.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.name} ({set.code})
                        </option>
                      ))}
                    </select>
                    {formData.expansion && availableSets.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {availableSets.length} sets available in {expansions.find(e => e.id === formData.expansion)?.name}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        name="isSingle"
                        id="isSingle"
                        checked={formData.isSingle}
                        onChange={handleChange}
                        className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div>
                        <label htmlFor="isSingle" className="block text-sm font-semibold text-gray-800">
                          Single Card (creates condition variants)
                        </label>
                        <p className="mt-1 text-sm text-gray-600">
                          Check this if this is a single card that should have Near Mint, Light Play, and Moderately Played variants
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-800">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      id="imageUrl"
                      required
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                      placeholder="https://example.com/card-image.jpg"
                    />
                    <p className="text-sm text-gray-500">
                      Use a high-quality image URL (square aspect ratio recommended)
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => router.push('/admin')}
                      className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? 'Creating...' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
