import { MigrationRunner } from './migrate'

let migrationPromise: Promise<void> | null = null

/**
 * Initialize the application by running pending migrations
 * This ensures migrations run only once during app startup
 */
export async function initializeApp(): Promise<void> {
  // Ensure migrations only run once even if called multiple times
  if (migrationPromise) {
    return migrationPromise
  }

  migrationPromise = runStartupMigrations()
  return migrationPromise
}

async function runStartupMigrations(): Promise<void> {
  try {
    console.log('🚀 Initializing application...')
    
    // Run migrations on startup
    await MigrationRunner.runPendingMigrations()
    
    console.log('✅ Application initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize application:', error)
    
    // In development, log the error but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ Continuing in development mode despite migration failure')
      return
    }
    
    // In production, this should probably crash the app
    throw new Error(`Application initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if migrations are needed without running them
 */
export async function checkMigrationStatus(): Promise<{
  upToDate: boolean
  pending: number
  completed: number
}> {
  try {
    const status = await MigrationRunner.getMigrationStatus()
    
    return {
      upToDate: status.pending.length === 0,
      pending: status.pending.length,
      completed: status.completed.length
    }
  } catch (error) {
    console.error('Failed to check migration status:', error)
    return {
      upToDate: false,
      pending: 0,
      completed: 0
    }
  }
}