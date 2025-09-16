'use client'

import { useEffect } from 'react'

interface ShopifyApp {
  createApp: (config: {
    apiKey: string
    shop: string | null
    forceRedirect: boolean
  }) => {
    dispatch: (action: unknown) => void
  }
  actions: {
    AppBridge: {
      actions: {
        APP_INITIALIZE: unknown
      }
    }
  }
}

declare global {
  interface Window {
    ShopifyApp: ShopifyApp
  }
}

export default function ShopifyAppBridge() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ShopifyApp) {
      // Initialize App Bridge
      const app = window.ShopifyApp.createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '',
        shop: new URLSearchParams(window.location.search).get('shop'),
        forceRedirect: true,
      })

      // Set up the app
      app.dispatch(window.ShopifyApp.actions.AppBridge.actions.APP_INITIALIZE)
    }
  }, [])

  return null
}
