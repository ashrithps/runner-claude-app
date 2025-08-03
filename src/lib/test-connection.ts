import { ReplitDB, db } from './replitdb'

export async function testConnection() {
  console.log('🔍 Testing Replit Database connection...')

  try {
    // Test basic database operations
    const testKey = 'test:connection'
    const testValue = { message: 'Hello from Replit Database!', timestamp: new Date().toISOString() }

    // Test set operation
    await db.set(testKey, testValue)
    console.log('✅ Set operation successful')

    // Test get operation
    const retrievedValue = await db.get(testKey)
    if (retrievedValue && retrievedValue.message === testValue.message) {
      console.log('✅ Get operation successful')
    } else {
      throw new Error('Get operation failed - data mismatch')
    }

    // Test delete operation
    await db.delete(testKey)
    console.log('✅ Delete operation successful')

    // Test list operation
    await db.list()
    console.log('✅ List operation successful')

    // Test database stats
    const stats = await ReplitDB.getStats()
    console.log('✅ Stats operation successful:', stats)

    console.log('🎉 All database operations successful!')
    return {
      success: true,
      message: 'Replit Database connection and operations working correctly',
      stats
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to Replit Database'
    }
  }
}

export async function checkEnvironment() {
  console.log('🔍 Checking environment setup...')

  // Check if we're running on Replit
  const isReplit = typeof process !== 'undefined' && process.env.REPL_ID
  console.log('Replit Environment:', isReplit ? 'Yes' : 'No')

  // Check for required environment variables
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.FROM_EMAIL

  console.log('Resend API Key:', resendApiKey ? 'Set' : 'Missing')
  console.log('From Email:', fromEmail || 'Missing')

  if (!resendApiKey || !fromEmail) {
    console.warn('⚠️ Some environment variables are missing (email functionality may not work)')
    console.log('💡 Set RESEND_API_KEY and FROM_EMAIL in Replit Secrets for full functionality')
  } else {
    console.log('✅ All required environment variables are set')
  }

  return {
    success: true,
    isReplit,
    hasResendKey: !!resendApiKey,
    hasFromEmail: !!fromEmail
  }
}