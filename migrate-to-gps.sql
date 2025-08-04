-- Migration script to convert from tower/flat system to GPS coordinates
-- Run this on your Coolify deployment database

-- First, add the new GPS columns to the users table
ALTER TABLE users ADD COLUMN latitude REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN longitude REAL DEFAULT 0;
ALTER TABLE users ADD COLUMN address_details TEXT DEFAULT '';

-- Add the new GPS columns to the tasks table
ALTER TABLE tasks ADD COLUMN latitude REAL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN longitude REAL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN address_details TEXT DEFAULT '';

-- Update existing users: combine tower and flat into address_details
UPDATE users SET address_details = COALESCE(tower, '') || CASE 
    WHEN tower IS NOT NULL AND flat IS NOT NULL THEN ', ' 
    ELSE '' 
END || COALESCE(flat, '') 
WHERE address_details = '';

-- Update existing tasks: combine location info into address_details
UPDATE tasks SET address_details = COALESCE(location, 'Location not specified')
WHERE address_details = '';

-- Set default GPS coordinates for existing records (you'll need users to update these)
-- Using Bangalore city center as default coordinates
UPDATE users SET 
    latitude = 12.9716,
    longitude = 77.5946
WHERE latitude = 0 AND longitude = 0;

UPDATE tasks SET 
    latitude = 12.9716,
    longitude = 77.5946
WHERE latitude = 0 AND longitude = 0;

-- Make the new columns NOT NULL after setting defaults
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate tables

-- Create new users table with proper constraints
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
);

-- Copy data from old table to new table
INSERT INTO users_new (id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications, created_at, updated_at)
SELECT id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications, created_at, updated_at
FROM users;

-- Create new tasks table with proper constraints
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
    FOREIGN KEY (poster_id) REFERENCES users_new(id),
    FOREIGN KEY (runner_id) REFERENCES users_new(id)
);

-- Copy data from old table to new table
INSERT INTO tasks_new (id, title, description, latitude, longitude, address_details, time, reward, upi_id, poster_id, runner_id, status, created_at, updated_at)
SELECT id, title, description, latitude, longitude, address_details, time, reward, upi_id, poster_id, runner_id, status, created_at, updated_at
FROM tasks;

-- Drop old tables and rename new ones
DROP TABLE tasks;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
ALTER TABLE tasks_new RENAME TO tasks;

-- Recreate other tables to ensure foreign key references work
-- (notifications, sessions, otp_sessions, ratings should be recreated to reference the new users table)

-- Clean up any existing sessions to force users to re-login and update their profiles
DELETE FROM sessions;
DELETE FROM otp_sessions;

-- Show migration results
SELECT 'Migration completed. Users count:' as message, COUNT(*) as count FROM users
UNION ALL
SELECT 'Tasks count:', COUNT(*) FROM tasks;