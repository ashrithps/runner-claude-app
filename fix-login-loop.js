#!/usr/bin/env node

/**
 * Fix Login Loop Issue After GPS Migration
 * 
 * This script fixes common issues that cause login loops after migrating
 * from tower/flat system to GPS coordinates.
 * 
 * Usage: node fix-login-loop.js
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔧 Fixing login loop issues after GPS migration...');

try {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found at:', dbPath);
    process.exit(1);
  }

  const db = new Database(dbPath);
  
  console.log('✅ Connected to database');
  
  // Start transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    console.log('🔄 Step 1: Clearing all sessions and OTP sessions...');
    
    // Clear all sessions to force fresh login
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
    const otpCount = db.prepare('SELECT COUNT(*) as count FROM otp_sessions').get();
    
    db.exec('DELETE FROM sessions');
    db.exec('DELETE FROM otp_sessions');
    
    console.log(`   Cleared ${sessionCount.count} sessions and ${otpCount.count} OTP sessions`);
    
    console.log('🔄 Step 2: Fixing user data inconsistencies...');
    
    // Fix any users with invalid GPS coordinates
    const invalidUsers = db.prepare(`
      SELECT id, email, latitude, longitude, address_details 
      FROM users 
      WHERE latitude IS NULL OR longitude IS NULL OR address_details IS NULL OR address_details = ''
    `).all();
    
    if (invalidUsers.length > 0) {
      console.log(`   Found ${invalidUsers.length} users with invalid GPS data, fixing...`);
      
      // Set default values for invalid users
      db.exec(`
        UPDATE users 
        SET 
          latitude = COALESCE(latitude, 12.9716),
          longitude = COALESCE(longitude, 77.5946),
          address_details = COALESCE(NULLIF(address_details, ''), 'Location to be updated')
        WHERE latitude IS NULL OR longitude IS NULL OR address_details IS NULL OR address_details = ''
      `);
    }
    
    console.log('🔄 Step 3: Fixing task data inconsistencies...');
    
    // Fix any tasks with invalid GPS coordinates
    const invalidTasks = db.prepare(`
      SELECT id, title, latitude, longitude, address_details 
      FROM tasks 
      WHERE latitude IS NULL OR longitude IS NULL OR address_details IS NULL OR address_details = ''
    `).all();
    
    if (invalidTasks.length > 0) {
      console.log(`   Found ${invalidTasks.length} tasks with invalid GPS data, fixing...`);
      
      // Set default values for invalid tasks
      db.exec(`
        UPDATE tasks 
        SET 
          latitude = COALESCE(latitude, 12.9716),
          longitude = COALESCE(longitude, 77.5946),
          address_details = COALESCE(NULLIF(address_details, ''), 'Location to be updated')
        WHERE latitude IS NULL OR longitude IS NULL OR address_details IS NULL OR address_details = ''
      `);
    }
    
    console.log('🔄 Step 4: Verifying database constraints...');
    
    // Check for orphaned data or constraint violations
    const orphanedTasks = db.prepare(`
      SELECT t.id, t.title, t.poster_id 
      FROM tasks t 
      LEFT JOIN users u ON t.poster_id = u.id 
      WHERE u.id IS NULL
    `).all();
    
    if (orphanedTasks.length > 0) {
      console.log(`   Found ${orphanedTasks.length} orphaned tasks, removing...`);
      db.exec(`
        DELETE FROM tasks 
        WHERE poster_id NOT IN (SELECT id FROM users)
      `);
    }
    
    console.log('🔄 Step 5: Creating missing indexes for performance...');
    
    // Create indexes if they don't exist
    try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_poster_id ON tasks(poster_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(latitude, longitude)');
    } catch (e) {
      console.log('   Indexes already exist or creation failed:', e.message);
    }
    
    // Commit transaction
    db.exec('COMMIT');
    
    // Get final stats
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
    
    console.log('🎉 Login loop fix completed successfully!');
    console.log(`📊 Database has ${userCount.count} users and ${taskCount.count} tasks`);
    console.log('');
    console.log('📝 What this fixed:');
    console.log('   ✅ Cleared all sessions (forces fresh login)');
    console.log('   ✅ Fixed users with missing GPS coordinates');
    console.log('   ✅ Fixed tasks with missing location data');
    console.log('   ✅ Removed orphaned data');
    console.log('   ✅ Added performance indexes');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Restart your application');
    console.log('   2. Clear browser cache and localStorage');
    console.log('   3. Users should now be able to log in fresh');
    console.log('   4. Users will be prompted for location permissions');
    
  } catch (error) {
    console.error('❌ Fix failed, rolling back...');
    db.exec('ROLLBACK');
    throw error;
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Login loop fix failed:', error.message);
  console.error('');
  console.error('🔧 Manual troubleshooting steps:');
  console.error('   1. Clear all browser data for your domain');
  console.error('   2. Check browser console for JavaScript errors');
  console.error('   3. Verify location permissions are working');
  console.error('   4. Check server logs for API errors');
  process.exit(1);
}