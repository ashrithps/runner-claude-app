# Database Migrations Guide

This project uses a custom SQLite migration system to handle database schema changes safely.

## Quick Start

### 🚀 **Run Your First Migration**

Your database needs to be updated to support the new "Mark as Paid" feature. Here's how:

#### **Option 1: Via Debug Page (Recommended)**
1. Start your app: `npm run dev`
2. Go to `/debug` page in your browser
3. Click **"Check Status"** in the Database Migrations section
4. Click **"Run Migrations"** to apply the updates
5. Verify it shows "✅ Up to date"

#### **Option 2: Via API Endpoint**
```bash
# Check migration status
curl http://localhost:3000/api/migrate

# Run pending migrations
curl -X POST http://localhost:3000/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate"}'
```

#### **Option 3: Via CLI Script**
```bash
# IMPORTANT: Start your dev server first in another terminal
npm run dev

# Then in another terminal:
# Check status
node scripts/migrate.js status

# Run migrations
node scripts/migrate.js run
```

## Migration System Overview

### **How It Works**
- Migration files are stored in `src/migrations/`
- Each migration has a unique filename: `001_description.sql`
- The system tracks which migrations have been run
- Migrations run automatically when the app starts (after the first manual run)

### **Current Migrations**
1. `001_add_paid_status_and_payment_notifications.sql` - Adds support for marking tasks as paid and payment confirmation emails

## Creating New Migrations

### **1. Create Migration File**
```bash
# Create new migration file with current timestamp
touch src/migrations/002_your_migration_name.sql
```

### **2. Write Migration SQL**
```sql
-- Migration: Description of what this migration does
-- Created: YYYY-MM-DD
-- Description: Detailed description

-- Your SQL commands here
ALTER TABLE users ADD COLUMN new_field TEXT DEFAULT '';

-- Always test your migrations on sample data first!
```

### **3. Test Migration**
1. Test in development first
2. Check migration status: `/debug` page or CLI
3. Run migration: "Run Migrations" button or CLI
4. Verify changes worked correctly

### **4. Deploy Migration**
- Migrations run automatically on app startup
- Or use the API endpoints to trigger manually
- Monitor the console for migration success/failure

## Migration File Naming

Use this naming pattern: `XXX_description.sql`

- `XXX` = Sequential number (001, 002, 003...)
- `description` = Short description using underscores

**Examples:**
- `001_add_paid_status_and_payment_notifications.sql`
- `002_add_user_preferences.sql`  
- `003_create_ratings_table.sql`

## SQLite Migration Best Practices

### **⚠️ SQLite Limitations**
SQLite has limited `ALTER TABLE` support. For major changes, you may need to:

1. Create new table with desired schema
2. Copy data from old table
3. Drop old table
4. Rename new table

**Example Pattern:**
```sql
-- Create new table
CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  new_field TEXT DEFAULT ''
);

-- Copy data
INSERT INTO users_new SELECT id, email, '' FROM users;

-- Replace old table
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
```

### **✅ Safe Migration Tips**
- Always backup data before major changes
- Test migrations on sample data first
- Use transactions for multi-step changes
- Include verification queries at the end
- Keep migrations small and focused

## API Endpoints

### **GET /api/migrate**
Check migration status without running any.

**Response:**
```json
{
  "success": true,
  "status": {
    "completed": 1,
    "pending": 0,
    "total": 1,
    "upToDate": true
  },
  "completedMigrations": [...],
  "pendingMigrations": []
}
```

### **POST /api/migrate**
Run pending migrations or get status.

**Request:**
```json
{
  "action": "migrate" | "status" | "rollback"
}
```

## CLI Commands

**⚠️ Important: CLI commands require your dev server to be running!**

```bash
# Start dev server (in one terminal)
npm run dev

# Run CLI commands (in another terminal)
# Check migration status
node scripts/migrate.js status

# Run pending migrations  
node scripts/migrate.js run

# Rollback last migration (dangerous!)
node scripts/migrate.js rollback
```

## Troubleshooting

### **"Migration failed" Error**
1. Check console logs for specific SQL errors
2. Verify migration SQL syntax
3. Check for SQLite constraint violations
4. Ensure database file is writable

### **"Database locked" Error**
1. Close any database browsers/tools
2. Restart the application
3. Check for long-running database operations

### **Migration Not Found**
1. Verify file exists in `src/migrations/`
2. Check filename format matches pattern
3. Ensure file has `.sql` extension

### **Schema Mismatch**
1. Check if manual database changes were made
2. Verify migration order is correct
3. Consider creating corrective migration

## Emergency Rollback

**⚠️ Use with extreme caution!**

```bash
# Via CLI
node scripts/migrate.js rollback

# Via API
curl -X POST http://localhost:3000/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "rollback"}'
```

**Note:** Rollback only removes the migration record - it doesn't automatically undo schema changes. You may need to manually revert database changes.

## Production Deployment

### **Automated Approach**
Migrations run automatically when the app starts. No manual intervention needed.

### **Manual Approach**
1. Deploy application code
2. Hit the `/api/migrate` endpoint
3. Verify migrations completed successfully
4. Monitor application logs

### **Zero-Downtime Deployments**
1. Ensure migrations are backward compatible
2. Deploy code first
3. Run migrations via API
4. Verify functionality works correctly

---

## Need Help?

- Check the `/debug` page for migration status
- Review console logs for detailed error messages
- Test migrations in development first
- Keep migrations small and focused