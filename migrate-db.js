#!/usr/bin/env node

/**
 * Database Migration Script: Tower/Flat system to GPS coordinates
 * 
 * This script migrates your existing Coolify database from the old tower/flat
 * system to the new GPS coordinate system.
 * 
 * Usage:
 * 1. Upload this file to your Coolify deployment
 * 2. Run: node migrate-db.js
 * 3. Restart your application
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting database migration from tower/flat to GPS system...');

try {
  // Database path - adjust if needed for your Coolify setup
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found at:', dbPath);
    console.log('Please check your DATABASE_PATH environment variable or database location.');
    process.exit(1);
  }

  console.log('📍 Using database at:', dbPath);
  
  const db = new Database(dbPath);
  
  // Enable foreign keys and WAL mode
  db.pragma('foreign_keys = OFF'); // Disable during migration
  db.pragma('journal_mode = WAL');
  
  console.log('✅ Connected to database');
  
  // Check current schema
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const taskColumns = db.prepare('PRAGMA table_info(tasks)').all();
  
  const hasOldUserSchema = userColumns.some(col => col.name === 'tower' || col.name === 'flat');
  const hasOldTaskSchema = taskColumns.some(col => col.name === 'location');
  const hasNewUserSchema = userColumns.some(col => col.name === 'latitude');
  
  console.log('📊 Current schema status:');
  console.log('  - Users table has old schema (tower/flat):', hasOldUserSchema);
  console.log('  - Tasks table has old schema (location):', hasOldTaskSchema);
  console.log('  - Users table has new schema (GPS):', hasNewUserSchema);
  
  if (!hasOldUserSchema && hasNewUserSchema) {
    console.log('✅ Database already migrated to GPS system. No action needed.');
    db.close();
    process.exit(0);
  }
  
  if (!hasOldUserSchema) {
    console.log('⚠️  Warning: Database schema not recognized. Please check manually.');
    db.close();
    process.exit(1);
  }
  
  // Start migration transaction
  db.exec('BEGIN TRANSACTION');
  
  try {
    console.log('🔄 Step 1: Adding new GPS columns...');
    
    // Add new columns to users table
    try {
      db.exec('ALTER TABLE users ADD COLUMN latitude REAL DEFAULT 0');
      db.exec('ALTER TABLE users ADD COLUMN longitude REAL DEFAULT 0');
      db.exec('ALTER TABLE users ADD COLUMN address_details TEXT DEFAULT ""');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        throw e;
      }
      console.log('   GPS columns already exist in users table');
    }
    
    // Add new columns to tasks table
    try {
      db.exec('ALTER TABLE tasks ADD COLUMN latitude REAL DEFAULT 0');
      db.exec('ALTER TABLE tasks ADD COLUMN longitude REAL DEFAULT 0');
      db.exec('ALTER TABLE tasks ADD COLUMN address_details TEXT DEFAULT ""');
    } catch (e) {
      if (!e.message.includes('duplicate column name')) {
        throw e;
      }
      console.log('   GPS columns already exist in tasks table');
    }
    
    console.log('🔄 Step 2: Migrating existing data...');
    
    // Migrate users data
    const userUpdateResult = db.exec(`
      UPDATE users SET address_details = COALESCE(tower, '') || CASE 
        WHEN tower IS NOT NULL AND flat IS NOT NULL THEN ', ' 
        ELSE '' 
      END || COALESCE(flat, '') 
      WHERE address_details = '' OR address_details IS NULL
    `);
    
    // Migrate tasks data
    const taskUpdateResult = db.exec(`
      UPDATE tasks SET address_details = COALESCE(location, 'Location not specified')
      WHERE address_details = '' OR address_details IS NULL
    `);
    
    // Set default GPS coordinates (Bangalore city center)
    db.exec(`
      UPDATE users SET 
        latitude = 12.9716,
        longitude = 77.5946
      WHERE latitude = 0 AND longitude = 0
    `);
    
    db.exec(`
      UPDATE tasks SET 
        latitude = 12.9716,
        longitude = 77.5946
      WHERE latitude = 0 AND longitude = 0
    `);
    
    console.log('🔄 Step 3: Creating new tables with proper constraints...');
    
    // Create new users table
    db.exec(`
      CREATE TABLE users_new (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address_details TEXT NOT NULL,
        mobile TEXT NOT NULL,
        available_for_tasks BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Copy users data
    db.exec(`
      INSERT INTO users_new (id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications, created_at, updated_at)
      SELECT id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications, created_at, updated_at
      FROM users
    `);
    
    // Create new tasks table
    db.exec(`
      CREATE TABLE tasks_new (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address_details TEXT NOT NULL,
        time TEXT NOT NULL,
        reward INTEGER NOT NULL,
        upi_id TEXT,
        poster_id TEXT NOT NULL,
        runner_id TEXT,
        status TEXT CHECK(status IN ('available', 'in_progress', 'completed')) DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poster_id) REFERENCES users(id),
        FOREIGN KEY (runner_id) REFERENCES users(id)
      )
    `);
    
    // Copy tasks data
    db.exec(`
      INSERT INTO tasks_new (id, title, description, latitude, longitude, address_details, time, reward, upi_id, poster_id, runner_id, status, created_at, updated_at)
      SELECT id, title, description, latitude, longitude, address_details, time, reward, upi_id, poster_id, runner_id, status, created_at, updated_at
      FROM tasks
    `);
    
    console.log('🔄 Step 4: Replacing old tables...');
    
    // Drop old tables and rename new ones
    db.exec('DROP TABLE tasks');
    db.exec('DROP TABLE users');
    db.exec('ALTER TABLE users_new RENAME TO users');
    db.exec('ALTER TABLE tasks_new RENAME TO tasks');
    
    console.log('🔄 Step 5: Cleaning up sessions...');
    
    // Clear sessions to force users to re-login and update their GPS coordinates
    db.exec('DELETE FROM sessions');
    db.exec('DELETE FROM otp_sessions');
    
    // Commit transaction
    db.exec('COMMIT');
    
    // Get final counts
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
    
    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Final counts: ${userCount.count} users, ${taskCount.count} tasks`);
    console.log('');
    console.log('📝 Important next steps:');
    console.log('   1. Restart your application');
    console.log('   2. All users will need to log in again');
    console.log('   3. Users will be prompted to allow location access');
    console.log('   4. Default coordinates are set to Bangalore - users should update their location');
    console.log('');
    console.log('✅ Your app now supports GPS-based 3km radius task filtering!');
    
  } catch (error) {
    console.error('❌ Migration failed, rolling back...');
    db.exec('ROLLBACK');
    throw error;
  }
  
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  db.close();
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error('');
  console.error('🔧 Troubleshooting:');
  console.error('   1. Make sure the database file exists and is writable');
  console.error('   2. Ensure no other processes are using the database');
  console.error('   3. Check that you have sufficient disk space');
  console.error('   4. Verify the database path is correct');
  process.exit(1);
}