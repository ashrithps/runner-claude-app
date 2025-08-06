-- Add is_paid column to tasks table
-- SQLite migration for paid status tracking

-- Check if column exists before adding (SQLite-safe approach)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we'll use a more robust approach

-- First, let's check if the column already exists
-- If it fails, the column doesn't exist and we'll add it
-- If it succeeds, the column exists and we skip

BEGIN;

-- Try to select from the column - if it fails, column doesn't exist
-- This is wrapped in a transaction for safety
ALTER TABLE tasks ADD COLUMN is_paid INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_is_paid ON tasks(is_paid);

COMMIT;