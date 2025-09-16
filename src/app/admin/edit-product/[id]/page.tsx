'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Save } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import SkeletonLoader from '@/components/SkeletonLoader'
import PageTransition from '@/components/PageTransition'

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
        alert('Product not found')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }, [productId, router])

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
        alert('Product updated successfully!')
        router.push('/admin')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
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
          <div className="max-w-2xl mx-auto">
            <PageTransition>
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
                  <p className="text-sm text-gray-500">Update the trading card information</p>
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isSingle"
                        id="isSingle"
                        checked={formData.isSingle}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isSingle" className="ml-2 block text-sm font-medium text-gray-700">
                        Single (creates NM, LP, MP, DMG variants)
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Check this if this is a single card that should have condition variants
                    </p>
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      placeholder="https://example.com/card-image.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Use a high-quality image URL (300x192px recommended)
                    </p>
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <Image
                          src={formData.imageUrl}
                          alt="Product preview"
                          width={128}
                          height={80}
                          className="w-32 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
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
                      disabled={saving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}
