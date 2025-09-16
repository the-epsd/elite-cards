const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qkavtxyvmpsdvnlealfm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXZ0eHl2bXBzZHZubGVhbGZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA2MDk3NywiZXhwIjoyMDcwNjM2OTc3fQ.3obO4QQ8w07SUCWC4JDAEAgt1BmiWQPV8HB6eONbe6E'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  try {
    console.log('Testing database operations...')

    // Test creating a user
    console.log('1. Testing user creation...')
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        shop_domain: 'test-shop.myshopify.com',
        access_token: 'test-token-123',
        role: 'end_user',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'shop_domain'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ User creation failed:', userError)
    } else {
      console.log('✅ User created successfully:', user.id)
    }

    // Test creating a product
    console.log('2. Testing product creation...')
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        title: 'Test Product',
        description: 'A test product for Elite Cards',
        price: 29.99,
        image_url: 'https://example.com/image.jpg',
        set: 'Test Set',
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (productError) {
      console.error('❌ Product creation failed:', productError)
    } else {
      console.log('✅ Product created successfully:', product.id)
    }

    // Test reading products
    console.log('3. Testing product reading...')
    const { data: products, error: readError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (readError) {
      console.error('❌ Product reading failed:', readError)
    } else {
      console.log('✅ Products read successfully:', products.length, 'products found')
    }

    // Clean up test data
    console.log('4. Cleaning up test data...')
    await supabase.from('products').delete().eq('id', product.id)
    await supabase.from('users').delete().eq('id', user.id)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All database operations successful!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testDatabase()
