'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthPageContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const shop = searchParams.get('shop')

  const handleOAuthRedirect = useCallback(async () => {
    if (!shop) {
      setError('Shop parameter is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Clean up shop domain
      let shopDomain = shop.trim()
      if (!shopDomain.includes('.')) {
        shopDomain = `${shopDomain}.myshopify.com`
      }

      // Redirect to OAuth flow using the new package
      window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(shopDomain)}`
    } catch {
      setError('Failed to start OAuth flow')
      setLoading(false)
    }
  }, [shop])

  useEffect(() => {
    if (shop) {
      handleOAuthRedirect()
    }
  }, [shop, handleOAuthRedirect])

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const shopInput = (e.target as HTMLFormElement).shop.value.trim()
    if (shopInput) {
      router.push(`/auth?shop=${encodeURIComponent(shopInput)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to Shopify...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Elite Cards
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your Shopify store to access premium trading cards
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleManualLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="shop" className="block text-sm font-medium text-gray-700">
              Shop Domain
            </label>
            <input
              id="shop"
              name="shop"
              type="text"
              required
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="your-shop.myshopify.com"
              defaultValue={shop || ''}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect to Shopify
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
