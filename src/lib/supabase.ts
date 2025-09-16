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

// Database functions
export async function createOrUpdateUser(shopDomain: string, accessToken: string, role: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      shop_domain: shopDomain,
      access_token: accessToken,
      role: role,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'shop_domain'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create/update user: ${error.message}`)
  }

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
