-- Migration: Add 'paid' status to tasks and 'payment_confirmed' to notifications
-- Created: 2024-01-01
-- Description: Adds support for marking tasks as paid and archiving them

-- Create backup tables for data safety
CREATE TABLE IF NOT EXISTS tasks_backup AS SELECT * FROM tasks WHERE 1=0;
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications WHERE 1=0;

-- Backup existing data
INSERT INTO tasks_backup SELECT * FROM tasks;
INSERT INTO notifications_backup SELECT * FROM notifications;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_poster_id; 
DROP INDEX IF EXISTS idx_tasks_runner_id;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_task_id;
DROP INDEX IF EXISTS idx_notifications_created_at;

-- Drop existing tables
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS notifications;

-- Recreate tasks table with 'paid' status
CREATE TABLE tasks (
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
  status TEXT CHECK (status IN ('available', 'in_progress', 'completed', 'paid')) DEFAULT 'available',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Recreate notifications table with 'payment_confirmed' type
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_cancelled', 'payment_confirmed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL
);

-- Restore data from backups
INSERT INTO tasks SELECT * FROM tasks_backup;
INSERT INTO notifications SELECT * FROM notifications_backup;

-- Recreate indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_poster_id ON tasks(poster_id);
CREATE INDEX idx_tasks_runner_id ON tasks(runner_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_task_id ON notifications(task_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Clean up backup tables
DROP TABLE tasks_backup;
DROP TABLE notifications_backup;

-- Verify migration by checking constraints
SELECT 
  name, 
  sql 
FROM sqlite_master 
WHERE type='table' 
AND name IN ('tasks', 'notifications');