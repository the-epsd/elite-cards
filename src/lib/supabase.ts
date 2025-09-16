import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://qkavtxyvmpsdvnlealfm.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXZ0eHl2bXBzZHZubGVhbGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA2MDk3NywiZXhwIjoyMDcwNjM2OTc3fQ.3obO4QQ8w07SUCWC4JDAEAgt1BmiWQPV8HB6eONbe6E'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  shop_domain: string
  role: string
  access_token: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  set: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface AddedProduct {
  id: string
  user_id: string
  product_id: string
  shopify_product_id: string
  added_at: string
}

// Database functions
export async function createOrUpdateUser(shopDomain: string, accessToken: string, role: string): Promise<User> {
  // First, check if user already exists
  const existingUser = await getUserByShopDomain(shopDomain)

  // If user exists and is admin, preserve admin role
  const finalRole = existingUser?.role === 'admin' ? 'admin' : role

  console.log('createOrUpdateUser:', {
    shopDomain,
    existingRole: existingUser?.role,
    requestedRole: role,
    finalRole
  })

  const { data, error } = await supabase
    .from('users')
    .upsert({
      shop_domain: shopDomain,
      access_token: accessToken,
      role: finalRole,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_domain'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create/update user: ${error.message}`)
  }

  console.log('User created/updated with role:', data.role)
  return data
}

export async function getUserByShopDomain(shopDomain: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('shop_domain', shopDomain)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    throw new Error(`Failed to get user: ${error.message}`)
  }

  return data
}

export async function createProduct(productData: {
  title: string
  description: string
  price: number
  image_url: string
  set: string
  created_by: string
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  return data
}

export async function updateProduct(productId: string, productData: {
  title?: string
  description?: string
  price?: number
  image_url?: string
  set?: string
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...productData,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
  }

  return data
}

export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Product not found
    }
    throw new Error(`Failed to get product: ${error.message}`)
  }

  return data
}

export async function getProductsBySet(set: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('set', set)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get products: ${error.message}`)
  }

  return data || []
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get products: ${error.message}`)
  }

  return data || []
}

// Added products tracking functions
export async function addProductToUser(userId: string, productId: string, shopifyProductId: string): Promise<AddedProduct> {
  const { data, error } = await supabase
    .from('added_products')
    .insert({
      user_id: userId,
      product_id: productId,
      shopify_product_id: shopifyProductId,
      added_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add product to user: ${error.message}`)
  }

  return data
}

export async function getAddedProductsByUser(userId: string): Promise<AddedProduct[]> {
  const { data, error } = await supabase
    .from('added_products')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to get added products: ${error.message}`)
  }

  return data || []
}

export async function isProductAddedByUser(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('added_products')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return false // Product not added
    }
    throw new Error(`Failed to check if product is added: ${error.message}`)
  }

  return !!data
}
