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
    // For TypeScript projects, we need to use the Next.js API instead
    console.log('🔄 Using API-based migration for TypeScript project')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const command = process.argv[2] || 'status'
    
    console.log(`🔄 Running migration command: ${command}`)
    
    // Check if server is running
    try {
      const healthCheck = await fetch(`${baseUrl}/api/migrate`, { method: 'GET' })
      if (!healthCheck.ok) {
        throw new Error('Server not responding')
      }
    } catch (error) {
      console.log('❌ Cannot connect to development server')
      console.log('🚀 Please start your app first: npm run dev')
      console.log(`   Expected server at: ${baseUrl}`)
      process.exit(1)
    }
    
    switch (command) {
      case 'status':
        const statusResponse = await fetch(`${baseUrl}/api/migrate`)
        const status = await statusResponse.json()
        
        if (!status.success) {
          throw new Error(status.error || 'Failed to get migration status')
        }
        
        console.log('\n📊 Migration Status:')
        console.log(`  Total migrations: ${status.status.total || 0}`)
        console.log(`  Completed: ${status.status.completed || 0}`)
        console.log(`  Pending: ${status.status.pending || 0}`)
        console.log(`  Up to date: ${status.status.upToDate ? '✅ Yes' : '❌ No'}`)
        
        if (status.completedMigrations && status.completedMigrations.length > 0) {
          console.log('\n✅ Completed migrations:')
          status.completedMigrations.forEach(migration => {
            console.log(`  - ${migration.id} (${new Date(migration.executed_at).toLocaleDateString()})`)
          })
        }
        
        if (status.pendingMigrations && status.pendingMigrations.length > 0) {
          console.log('\n⏳ Pending migrations:')
          status.pendingMigrations.forEach(migration => {
            console.log(`  - ${migration}`)
          })
        } else {
          console.log('\n✅ All migrations are up to date!')
        }
        break
        
      case 'run':
        console.log('🔄 Running pending migrations...')
        const runResponse = await fetch(`${baseUrl}/api/migrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'migrate' })
        })
        const runResult = await runResponse.json()
        
        if (!runResult.success) {
          throw new Error(runResult.details || runResult.error || 'Migration failed')
        }
        
        console.log('\n✅ Migrations completed!')
        console.log(`📊 Result: ${runResult.status.completed} completed, ${runResult.status.pending} pending`)
        
        if (runResult.completedMigrations && runResult.completedMigrations.length > 0) {
          console.log('\n📋 Completed migrations:')
          runResult.completedMigrations.forEach(migration => {
            console.log(`  ✅ ${migration.id}`)
          })
        }
        break
        
      case 'rollback':
        console.log('⚠️  Rolling back last migration...')
        const rollbackResponse = await fetch(`${baseUrl}/api/migrate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rollback' })
        })
        const rollbackResult = await rollbackResponse.json()
        
        if (!rollbackResult.success) {
          throw new Error(rollbackResult.details || rollbackResult.error || 'Rollback failed')
        }
        
        console.log('\n✅ Last migration rolled back!')
        console.log('⚠️  You may need to manually revert schema changes')
        if (rollbackResult.warning) {
          console.log(`⚠️  ${rollbackResult.warning}`)
        }
        break
        
      default:
        console.log('❌ Unknown command:', command)
        console.log('\nUsage:')
        console.log('  node scripts/migrate.js status    - Check migration status')
        console.log('  node scripts/migrate.js run       - Run pending migrations')
        console.log('  node scripts/migrate.js rollback  - Rollback last migration')
        console.log('\n💡 Make sure your dev server is running: npm run dev')
        process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Add fetch polyfill for Node.js if needed
async function setupFetch() {
  if (!global.fetch) {
    try {
      const { default: fetch } = await import('node-fetch')
      global.fetch = fetch
    } catch (error) {
      // If node-fetch is not available, try using built-in fetch (Node 18+)
      if (typeof fetch === 'undefined') {
        console.log('❌ fetch is not available. Please install node-fetch or use Node.js 18+')
        console.log('💡 Run: npm install node-fetch')
        process.exit(1)
      }
    }
  }
}

// Run setup and then migration command
setupFetch().then(runMigrations).catch(console.error)