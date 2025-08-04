# Database Migration Guide: Tower/Flat → GPS System

This guide helps you migrate your existing Coolify deployment from the old tower/flat location system to the new GPS coordinate system with 3km radius filtering.

## 🚨 Important: Backup First!

Before running the migration, **always backup your database**:

```bash
# If using SQLite
cp data/database.sqlite data/database.sqlite.backup

# If using PostgreSQL/MySQL, use appropriate backup commands
```

## Method 1: Automated Migration Script (Recommended)

### Step 1: Upload Migration Script

1. Add the `migrate-db.js` file to your project root
2. Commit and push to trigger Coolify deployment:

```bash
git add migrate-db.js
git commit -m "Add database migration script for GPS system"
git push
```

### Step 2: Run Migration on Coolify

1. SSH into your Coolify container or use the terminal:

```bash
# Navigate to your app directory
cd /path/to/your/app

# Run the migration
node migrate-db.js
```

### Step 3: Restart Application

Restart your application through Coolify dashboard or:

```bash
# If using PM2
pm2 restart all

# If using Docker
docker restart your-container-name
```

## Method 2: Manual SQL Migration

If you prefer to run SQL directly:

### For SQLite:

```bash
# Connect to your database
sqlite3 data/database.sqlite

# Run the SQL from migrate-to-gps.sql
.read migrate-to-gps.sql

# Exit
.quit
```

### For PostgreSQL:

```bash
psql -h localhost -U your-user -d your-database -f migrate-to-gps.sql
```

### For MySQL:

```bash
mysql -h localhost -u your-user -p your-database < migrate-to-gps.sql
```

## What the Migration Does

### 1. Schema Changes
- Adds `latitude`, `longitude`, `address_details` columns to `users` table
- Adds `latitude`, `longitude`, `address_details` columns to `tasks` table
- Removes dependency on old `tower`, `flat`, `location` fields

### 2. Data Migration
- Combines existing `tower` + `flat` into `address_details` field
- Moves task `location` data to new `address_details` field
- Sets default GPS coordinates (Bangalore city center: 12.9716, 77.5946)

### 3. User Sessions
- Clears all existing user sessions
- Forces users to log in again and update their GPS location

## Post-Migration User Experience

### For Existing Users:
1. **Forced Re-login**: All users must log in again
2. **Location Permission**: App will request GPS access (mandatory)
3. **Profile Update**: Users should update their precise location
4. **Default Location**: All users start with Bangalore coordinates until they update

### For New Users:
1. **Mandatory GPS**: Location permission required during signup
2. **3km Radius**: Only see tasks within 3km of their location
3. **Distance Display**: Tasks show distance badges (e.g., "1.2km away")

## Verification Steps

After migration, verify everything works:

### 1. Check Database Schema
```sql
-- Should show new GPS columns
PRAGMA table_info(users);
PRAGMA table_info(tasks);
```

### 2. Test Core Functions
- [ ] User registration with GPS coordinates
- [ ] Task posting with location
- [ ] Task browsing with 3km filtering
- [ ] Distance calculations work
- [ ] "My Tasks" shows posted tasks

### 3. Check Application Logs
Look for any errors related to:
- Database queries
- Location permissions
- Task creation/retrieval

## Troubleshooting

### Migration Script Fails
```bash
# Check database permissions
ls -la data/database.sqlite

# Check disk space
df -h

# Check for database locks
lsof data/database.sqlite
```

### Users Can't Log In
- Clear browser cache/localStorage
- Check if location permission is being requested
- Verify API endpoints are working

### Tasks Not Showing
- Check if users have valid GPS coordinates
- Verify 3km radius filtering logic
- Check browser console for JavaScript errors

### Location Permission Issues
- Ensure HTTPS is enabled (required for GPS)
- Check if location services are enabled in browser
- Verify location-guard component is working

## Rollback Plan

If something goes wrong, you can rollback:

### Restore Database Backup
```bash
# Stop application
pm2 stop all

# Restore backup
cp data/database.sqlite.backup data/database.sqlite

# Restart with old code
git checkout previous-commit-hash
pm2 start all
```

## Environment Variables

Make sure these are set in Coolify:

```env
# Database
DATABASE_PATH=/app/data/database.sqlite

# Email (for OTP)
RESEND_API_KEY=your-resend-key
FROM_EMAIL=your-from-email

# Optional: Location API
GOOGLE_MAPS_API_KEY=your-key (for reverse geocoding)
```

## Support

If you encounter issues:

1. Check the migration script output for specific errors
2. Verify database file permissions and disk space
3. Ensure all environment variables are set correctly
4. Test location permissions in different browsers

The GPS system provides much better user experience with precise location matching and automatic 3km radius filtering for task discovery.