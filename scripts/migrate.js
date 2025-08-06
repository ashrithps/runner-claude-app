#!/usr/bin/env node

/**
 * Migration CLI script
 * 
 * Usage:
 *   node scripts/migrate.js status    - Check migration status
 *   node scripts/migrate.js run       - Run pending migrations
 *   node scripts/migrate.js rollback  - Rollback last migration
 */

const path = require('path')

// Change to project root
process.chdir(path.join(__dirname, '..'))

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

async function runMigrations() {
  try {
    // Dynamic import since we're using ES modules
    const { MigrationRunner } = await import('../src/lib/migrate.js')
    
    const command = process.argv[2] || 'status'
    
    console.log(`🔄 Running migration command: ${command}`)
    
    switch (command) {
      case 'status':
        const status = await MigrationRunner.getMigrationStatus()
        console.log('\n📊 Migration Status:')
        console.log(`  Total migrations: ${status.total}`)
        console.log(`  Completed: ${status.completed.length}`)
        console.log(`  Pending: ${status.pending.length}`)
        
        if (status.completed.length > 0) {
          console.log('\n✅ Completed migrations:')
          status.completed.forEach(migration => {
            console.log(`  - ${migration.id} (${new Date(migration.executed_at).toLocaleDateString()})`)
          })
        }
        
        if (status.pending.length > 0) {
          console.log('\n⏳ Pending migrations:')
          status.pending.forEach(migration => {
            console.log(`  - ${migration}`)
          })
        } else {
          console.log('\n✅ All migrations are up to date!')
        }
        break
        
      case 'run':
        await MigrationRunner.runPendingMigrations()
        console.log('\n✅ Migrations completed!')
        break
        
      case 'rollback':
        await MigrationRunner.rollbackLastMigration()
        console.log('\n✅ Last migration rolled back!')
        console.log('⚠️  You may need to manually revert schema changes')
        break
        
      default:
        console.log('❌ Unknown command:', command)
        console.log('\nUsage:')
        console.log('  node scripts/migrate.js status    - Check migration status')
        console.log('  node scripts/migrate.js run       - Run pending migrations')
        console.log('  node scripts/migrate.js rollback  - Rollback last migration')
        process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run the migration command
runMigrations()