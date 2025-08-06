import fs from 'fs'
import path from 'path'
import { DatabaseOperations } from './db-operations'

interface Migration {
  id: string
  filename: string
  sql: string
  executedAt?: string
}

interface MigrationRecord {
  id: string
  executed_at: string
}

export class MigrationRunner {
  private static migrationsPath = path.join(process.cwd(), 'src/migrations')
  
  /**
   * Run all pending migrations
   */
  static async runPendingMigrations(): Promise<void> {
    try {
      console.log('🔄 Starting database migrations...')
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable()
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles()
      
      if (migrationFiles.length === 0) {
        console.log('✅ No migrations found')
        return
      }
      
      // Get completed migrations from database
      const completedMigrations = await this.getCompletedMigrations()
      const completedIds = completedMigrations.map(m => m.id)
      
      // Filter pending migrations
      const pendingMigrations = migrationFiles.filter(
        migration => !completedIds.includes(migration.id)
      )
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date')
        return
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`)
      
      // Run each pending migration
      for (const migration of pendingMigrations) {
        await this.runSingleMigration(migration)
      }
      
      console.log('✅ All migrations completed successfully!')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Get list of all completed migrations
   */
  static async getCompletedMigrations(): Promise<MigrationRecord[]> {
    try {
      const result = await DatabaseOperations.executeRaw('SELECT id, executed_at FROM migrations ORDER BY executed_at')
      return result as MigrationRecord[]
    } catch (error) {
      // If migrations table doesn't exist yet, return empty array
      console.log('📝 No migrations table found - will be created')
      return []
    }
  }
  
  /**
   * Get status of all migrations (completed + pending)
   */
  static async getMigrationStatus(): Promise<{
    completed: MigrationRecord[]
    pending: string[]
    total: number
  }> {
    const migrationFiles = await this.getMigrationFiles()
    const completedMigrations = await this.getCompletedMigrations()
    const completedIds = completedMigrations.map(m => m.id)
    
    const pending = migrationFiles
      .filter(m => !completedIds.includes(m.id))
      .map(m => m.id)
    
    return {
      completed: completedMigrations,
      pending,
      total: migrationFiles.length
    }
  }
  
  /**
   * Create the migrations tracking table
   */
  private static async ensureMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TEXT NOT NULL
      )
    `
    await DatabaseOperations.executeRaw(sql)
  }
  
  /**
   * Get all migration files from the migrations directory
   */
  private static async getMigrationFiles(): Promise<Migration[]> {
    if (!fs.existsSync(this.migrationsPath)) {
      console.log('📁 Creating migrations directory')
      fs.mkdirSync(this.migrationsPath, { recursive: true })
      return []
    }
    
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    const migrations: Migration[] = []
    
    for (const filename of files) {
      const id = filename.replace('.sql', '')
      const filePath = path.join(this.migrationsPath, filename)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      migrations.push({
        id,
        filename,
        sql
      })
    }
    
    return migrations
  }
  
  /**
   * Execute a single migration
   */
  private static async runSingleMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Running migration: ${migration.id}`)
    
    try {
      // Execute the migration SQL
      await DatabaseOperations.executeRaw(migration.sql)
      
      // Record the migration as completed
      const executedAt = new Date().toISOString()
      await DatabaseOperations.executeRaw(
        'INSERT INTO migrations (id, executed_at) VALUES (?, ?)',
        [migration.id, executedAt]
      )
      
      console.log(`✅ Migration completed: ${migration.id}`)
      
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.id}`, error)
      throw new Error(`Migration ${migration.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Rollback the last migration (use with caution!)
   */
  static async rollbackLastMigration(): Promise<void> {
    const completedMigrations = await this.getCompletedMigrations()
    
    if (completedMigrations.length === 0) {
      console.log('❌ No migrations to rollback')
      return
    }
    
    // Get the last migration
    const lastMigration = completedMigrations[completedMigrations.length - 1]
    
    console.log(`⚠️ Rolling back migration: ${lastMigration.id}`)
    console.log('⚠️ WARNING: This will remove the migration record but cannot automatically undo schema changes!')
    
    // Remove from migrations table
    await DatabaseOperations.executeRaw(
      'DELETE FROM migrations WHERE id = ?',
      [lastMigration.id]
    )
    
    console.log(`✅ Migration record removed: ${lastMigration.id}`)
    console.log('⚠️ You may need to manually revert database schema changes!')
  }
}