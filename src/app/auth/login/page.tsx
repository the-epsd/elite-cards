'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [shop, setShop] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shop.trim()) return

    setLoading(true)

    // Clean up shop domain
    let shopDomain = shop.trim()
    if (!shopDomain.includes('.')) {
      shopDomain = `${shopDomain}.myshopify.com`
    }

    // Redirect to OAuth flow
    window.location.href = `/api/auth/install?shop=${encodeURIComponent(shopDomain)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Elite Cards
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Premium trading cards for your Shopify store
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="shop" className="sr-only">
              Shop domain
            </label>
            <input
              id="shop"
              name="shop"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="your-shop.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Login with Shopify'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have a Shopify store?{' '}
            <a
              href="https://www.shopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

