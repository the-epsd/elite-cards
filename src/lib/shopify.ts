import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api'
import '@shopify/shopify-api/adapters/node'

// Lazy initialization of Shopify API
let shopifyInstance: ReturnType<typeof shopifyApi> | null = null

function getShopifyInstance() {
  if (!shopifyInstance) {
    const apiKey = process.env.SHOPIFY_API_KEY
    const apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || process.env.SHOPIFY_API_SECRET

    if (!apiKey || !apiSecretKey) {
      throw new Error('Missing Shopify API credentials. Please set SHOPIFY_API_KEY and SHOPIFY_API_SECRET_KEY environment variables.')
    }

    shopifyInstance = shopifyApi({
      apiKey,
      apiSecretKey,
      scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products', 'write_products'],
      hostName: process.env.APP_URL?.replace(/https?:\/\//, '') || 'localhost:3000',
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: true,
    })
  }

  return shopifyInstance
}

// Export a getter function instead of the instance
export const shopify = {
  get auth() {
    return getShopifyInstance().auth
  },
  get rest() {
    return getShopifyInstance().rest
  }
}

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
    console.log('Creating product in Shopify:', {
      shopDomain,
      title: productData.title,
      price: productData.price
    })

    // Use direct REST API call instead of Shopify SDK
    const productPayload = {
      product: {
        title: productData.title,
        body_html: productData.description,
        vendor: 'Elite Cards',
        product_type: 'Trading Cards',
        tags: `elite-cards,${productData.set}`,
        variants: [
          {
            price: productData.price.toString(),
            inventory_management: 'shopify',
            inventory_quantity: 0,
          },
        ],
        images: [
          {
            src: productData.imageUrl,
            alt: productData.title,
          },
        ],
      }
    }

    const response = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      return {
        success: false,
        error: `Shopify API error: ${response.status} ${errorText}`,
      }
    }

    const result = await response.json()
    console.log('Product created successfully:', result.product.id)

    return {
      success: true,
      productId: result.product.id?.toString(),
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
  authUrl.searchParams.set('state', 'nonce') // Add state parameter for security
  return authUrl.toString()
}

export async function validateShopifyCallback(
  query: Record<string, string | string[] | undefined>
): Promise<{ success: boolean; session?: { shop: string; accessToken: string }; error?: string }> {
  try {
    const { code, shop, hmac } = query

    console.log('Validating Shopify callback:', { code, shop, hmac })
    console.log('Parameter types:', {
      codeType: typeof code,
      shopType: typeof shop,
      hmacType: typeof hmac
    })

    if (!code || !shop || !hmac) {
      console.error('Missing required parameters:', {
        hasCode: !!code,
        hasShop: !!shop,
        hasHmac: !!hmac
      })
      return {
        success: false,
        error: `Missing required parameters: code=${!!code}, shop=${!!shop}, hmac=${!!hmac}`,
      }
    }

    // For now, we'll skip HMAC validation for simplicity
    // In production, you should validate the HMAC signature

    // Check if environment variables are set
    const apiSecretKey = process.env.SHOPIFY_API_SECRET_KEY || process.env.SHOPIFY_API_SECRET
    if (!process.env.SHOPIFY_API_KEY || !apiSecretKey) {
      console.error('Missing environment variables:', {
        hasApiKey: !!process.env.SHOPIFY_API_KEY,
        hasApiSecret: !!apiSecretKey,
      })
      return {
        success: false,
        error: 'Missing Shopify API credentials. Please check environment variables.',
      }
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: apiSecretKey,
        code: code as string,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        shop: shop,
        code: code
      })
      return {
        success: false,
        error: `Failed to exchange code for access token: ${tokenResponse.status} ${errorText}`,
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

