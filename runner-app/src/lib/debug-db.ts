import { supabase } from './supabase'
import { createDefaultUser } from './utils'

export async function debugDatabase() {
  console.log('🔍 Starting database debug...')
  
  // 1. Test basic connection
  console.log('1. Testing basic connection...')
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(0)
    if (error) {
      console.error('❌ Connection failed:', error)
      return false
    }
    console.log('✅ Connection successful')
  } catch (err) {
    console.error('❌ Connection exception:', err)
    return false
  }

  // 2. Check if tables exist
  console.log('2. Checking table structure...')
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error) {
      console.error('❌ Users table issue:', error)
      if (error.code === 'PGRST116') {
        console.error('💡 Hint: The users table might not exist. Run the SQL schema from supabase-schema.sql')
      }
      return false
    }
    console.log('✅ Users table exists')
  } catch (err) {
    console.error('❌ Table check failed:', err)
    return false
  }

  // 3. Test user insertion with detailed logging
  console.log('3. Testing user insertion...')
  const testUser = createDefaultUser()
  testUser.name = 'Debug Test User'
  
  console.log('Attempting to insert user:', testUser)
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single()

    if (error) {
      console.error('❌ User insertion failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Common error interpretations
      if (error.code === '23505') {
        console.log('💡 This is a unique constraint violation - user might already exist')
      } else if (error.code === '42P01') {
        console.log('💡 Table does not exist - run the database schema')
      } else if (error.code === '42703') {
        console.log('💡 Column does not exist - check schema matches code')
      }
      
      return false
    }
    
    console.log('✅ User insertion successful:', data)
    
    // 4. Clean up - delete the test user
    await supabase.from('users').delete().eq('id', testUser.id)
    console.log('✅ Test user cleaned up')
    
    return true
  } catch (err) {
    console.error('❌ User insertion exception:', err)
    return false
  }
}

export async function checkEnvironment() {
  console.log('🔍 Checking environment setup...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING')
  console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.log('💡 Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return false
  }
  
  console.log('✅ Environment variables are set')
  return true
}