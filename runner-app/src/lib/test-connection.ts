import { supabase } from './supabase'
import { createDefaultUser } from './utils'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
    
    if (error) {
      console.error('Supabase connection error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    console.log('Users table count:', data)
    return true
  } catch (err) {
    console.error('Connection test failed:', err)
    return false
  }
}

export async function insertTestData() {
  try {
    // Create a test user with proper UUID
    const testUser = createDefaultUser()
    testUser.name = 'Test User'
    
    console.log('Creating test user with UUID:', testUser.id)
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(testUser, { onConflict: 'id' })
      .select()
      .single()

    if (userError) {
      console.error('Error creating test user:', {
        error: userError,
        code: userError.code,
        message: userError.message,
        details: userError.details,
        user: testUser
      })
      return false
    }

    console.log('✅ Test user created:', userData)

    // Insert a test task
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test Task - Help with groceries',
        description: 'Need help carrying groceries from the parking lot',
        location: 'Tower 1, Flat 101',
        time: 'ASAP',
        reward: 50,
        poster_id: userData.id,
        status: 'available'
      })
      .select()
      .single()

    if (taskError) {
      console.error('Error creating test task:', {
        error: taskError,
        code: taskError.code,
        message: taskError.message,
        details: taskError.details
      })
      return false
    }

    console.log('✅ Test task created:', taskData)
    return true
  } catch (err) {
    console.error('Test data insertion failed:', err)
    return false
  }
}