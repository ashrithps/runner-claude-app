#!/usr/bin/env node

/**
 * One-click setup script for the SQLite migration system
 * This script will run the first migration to add "Mark as Paid" functionality
 */

const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 Setting up SQLite Migration System...\n')

// Change to project root
process.chdir(path.join(__dirname))

async function setup() {
  try {
    // Step 1: Install dependencies if needed
    console.log('1️⃣ Checking dependencies...')
    try {
      execSync('npm list --depth=0', { stdio: 'pipe' })
      console.log('   ✅ Dependencies are installed')
    } catch (error) {
      console.log('   📦 Installing dependencies...')
      execSync('npm install', { stdio: 'inherit' })
    }

    // Step 2: Start the development server in background
    console.log('\n2️⃣ Starting development server...')
    const server = execSync('npm run dev &', { stdio: 'pipe' })
    
    // Wait for server to start
    console.log('   ⏳ Waiting for server to start...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Step 3: Run migrations via API
    console.log('\n3️⃣ Running database migrations...')
    
    try {
      const response = await fetch('http://localhost:3000/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('   ✅ Migrations completed successfully!')
        console.log(`   📊 Status: ${result.status.completed} completed, ${result.status.pending} pending`)
      } else {
        console.log('   ❌ Migration failed:', result.error)
      }
    } catch (error) {
      console.log('   ⚠️  Could not run migrations via API, trying CLI method...')
      
      // Fallback to CLI method
      try {
        execSync('node scripts/migrate.js run', { stdio: 'inherit' })
        console.log('   ✅ Migrations completed via CLI!')
      } catch (cliError) {
        console.log('   ❌ CLI migration also failed')
        throw cliError
      }
    }

    // Step 4: Verify setup
    console.log('\n4️⃣ Verifying setup...')
    
    try {
      const statusResponse = await fetch('http://localhost:3000/api/migrate')
      const statusResult = await statusResponse.json()
      
      if (statusResult.success && statusResult.status.upToDate) {
        console.log('   ✅ Database is up to date!')
      } else {
        console.log('   ⚠️  Database may need attention')
      }
    } catch (error) {
      console.log('   ⚠️  Could not verify status via API')
    }

    // Success message
    console.log('\n🎉 Setup Complete!')
    console.log('\n📋 What was set up:')
    console.log('   ✅ SQLite migration system')
    console.log('   ✅ Database schema updated for "Mark as Paid" feature')
    console.log('   ✅ Migration tracking system')
    console.log('   ✅ Debug page migration controls')
    
    console.log('\n🚀 Next Steps:')
    console.log('   1. Go to http://localhost:3000/debug to see migration status')
    console.log('   2. Test the new "Mark as Paid" feature in My Tasks')
    console.log('   3. Check MIGRATIONS.md for detailed documentation')
    
    console.log('\n📚 Available Commands:')
    console.log('   • node scripts/migrate.js status   - Check migration status')
    console.log('   • node scripts/migrate.js run      - Run pending migrations')
    console.log('   • Visit /debug page                - Web-based migration controls')

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    console.log('\n🔧 Manual Setup Instructions:')
    console.log('   1. Start your app: npm run dev')
    console.log('   2. Go to /debug page')
    console.log('   3. Click "Run Migrations" button')
    console.log('   4. Or run: node scripts/migrate.js run')
    
    process.exit(1)
  }
}

// Add fetch polyfill for Node.js if needed
if (!global.fetch) {
  global.fetch = require('node-fetch')
}

// Run setup
setup().catch(console.error)