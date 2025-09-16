'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Save } from 'lucide-react'
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
  is_single: boolean
  created_at: string
  updated_at: string
}

export default function EditProductPage() {
  const { showSuccess, showError } = useNotification()
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    set: '',
    isSingle: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const productData = data.product
        setProduct(productData)
        setFormData({
          title: productData.title,
          description: productData.description,
          price: productData.price.toString(),
          imageUrl: productData.image_url,
          set: productData.set,
          isSingle: productData.is_single || false
        })
      } else {
        showError('Product not found')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      showError('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [productId, router, showError])

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId, fetchProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/products/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          ...formData
        }),
      })

      if (response.ok) {
        showSuccess('Product updated successfully!')
        router.push('/admin')
      } else {
        const error = await response.json()
        showError(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      showError('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar currentPage="admin" />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 py-6 px-6">
            <div className="max-w-2xl mx-auto">
              <SkeletonLoader type="form" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar currentPage="admin" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <PageTransition>
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                  <p className="text-gray-600 mt-1">Update the trading card information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                  {/* Large Image on Left */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h3>
                      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
                        {formData.imageUrl && formData.imageUrl.trim() !== '' ? (
                          <Image
                            src={formData.imageUrl}
                            alt={formData.title || 'Product preview'}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-gray-500">📷</span>
                              </div>
                              <p className="text-gray-500 text-sm">No image preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">
                          <strong>Current Image URL:</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 break-all">
                          {formData.imageUrl || 'No URL provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form on Right */}
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-8">
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
                          <label htmlFor="set" className="block text-sm font-semibold text-gray-800">
                            Card Set *
                          </label>
                          <select
                            name="set"
                            id="set"
                            required
                            value={formData.set}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
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

                      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => router.push('/admin')}
                          className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-8 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2 inline" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
