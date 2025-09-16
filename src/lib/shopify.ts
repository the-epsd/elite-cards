import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api'
import '@shopify/shopify-api/adapters/node'

// Initialize Shopify API
export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products', 'write_products'],
  hostName: process.env.APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
})

export interface ShopifyProduct {
  title: string
  body_html: string
  vendor: string
  product_type: string
  tags: string
  variants: Array<{
    price: string
    compare_at_price?: string
    inventory_management?: string
    inventory_quantity?: number
  }>
  images: Array<{
    src: string
    alt?: string
  }>
}

export async function createProductInShopify(
  accessToken: string,
  shopDomain: string,
  productData: {
    title: string
    description: string
    price: number
    imageUrl: string
    set: string
  }
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const session = {
      shop: shopDomain,
      accessToken: accessToken,
    }

    const product: ShopifyProduct = {
      title: productData.title,
      body_html: productData.description,
      vendor: 'Elite Cards',
      product_type: 'Trading Cards',
      tags: `elite-cards,${productData.set}`,
      variants: [
        {
          price: productData.price.toString(),
          inventory_management: 'shopify',
          inventory_quantity: 100,
        },
      ],
      images: [
        {
          src: productData.imageUrl,
          alt: productData.title,
        },
      ],
    }

    const response = await shopify.rest.Product.save({
      session,
      product,
    })

    return {
      success: true,
      productId: response.id?.toString(),
    }
  } catch (error) {
    console.error('Error creating product in Shopify:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function getShopifyAuthUrl(shop: string, redirectUri: string): string {
  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`)
  authUrl.searchParams.set('client_id', process.env.SHOPIFY_API_KEY!)
  authUrl.searchParams.set('scope', process.env.SHOPIFY_SCOPES || 'read_products,write_products')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  return authUrl.toString()
}

export async function validateShopifyCallback(
  query: Record<string, string | string[] | undefined>
): Promise<{ success: boolean; session?: { shop: string; accessToken: string }; error?: string }> {
  try {
    const { code, shop, hmac } = query

    if (!code || !shop || !hmac) {
      return {
        success: false,
        error: 'Missing required parameters',
      }
    }

    // For now, we'll skip HMAC validation for simplicity
    // In production, you should validate the HMAC signature

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code: code as string,
      }),
    })

    if (!tokenResponse.ok) {
      return {
        success: false,
        error: 'Failed to exchange code for access token',
      }
    }

    const tokenData = await tokenResponse.json()

    return {
      success: true,
      session: {
        shop: shop as string,
        accessToken: tokenData.access_token,
      },
    }
  } catch (error) {
    console.error('Error validating Shopify callback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid callback',
    }
  }
}

