# Fix Login Loop After GPS Migration

This guide fixes the authentication loop issue that occurs after migrating from tower/flat system to GPS coordinates.

## 🔍 Root Cause

The login loop happens because:

1. **AuthGuard and Home page** were still checking for old `tower` and `flat` fields
2. **Users have GPS data** but code expects old field structure  
3. **Invalid session data** from before migration
4. **Missing GPS validation** in authentication flow

## 🚀 Quick Fix for Coolify Deployment

### Step 1: Update Your Code

```bash
git pull  # Get the latest fixes
git add .
git commit -m "Fix login loop after GPS migration"
git push  # This will trigger Coolify deployment
```

### Step 2: Run Database Fix Script

SSH into your Coolify container and run:

```bash
# Navigate to your app directory
cd /path/to/your/app

# Run the login loop fix
node fix-login-loop.js
```

### Step 3: Restart Application

```bash
# Restart your app (adjust command based on your setup)
pm2 restart all
# OR
docker restart your-container-name
# OR restart through Coolify dashboard
```

### Step 4: Clear Browser Data

**Important**: Users need to clear their browser data:

1. **Clear Cookies**: Delete all cookies for your domain
2. **Clear Local Storage**: Delete localStorage data
3. **Hard Refresh**: Ctrl+F5 or Cmd+Shift+R

## 🔧 What the Fix Does

### Code Changes Applied:

1. **AuthGuard Fixed**: 
   ```typescript
   // OLD (causing loop)
   if (user && user.name && user.tower && user.flat)
   
   // NEW (fixed)
   if (user && user.name && user.latitude && user.longitude && user.address_details)
   ```

2. **Home Page Fixed**:
   - Updated authentication check to use GPS fields
   - Updated description to reflect GPS system

3. **Auth Page Enhanced**:
   - Better error handling for invalid sessions
   - Validates GPS data before redirecting
   - Clears invalid session data automatically

### Database Fix Script Results:

✅ **Clears all sessions** (forces fresh login)  
✅ **Fixes users with missing GPS data**  
✅ **Fixes tasks with missing location data**  
✅ **Removes orphaned data**  
✅ **Adds performance indexes**  

## 🔍 Manual Troubleshooting

If users still experience login loops:

### Check Browser Console
Look for these errors:
```javascript
// Should NOT see these errors after fix:
"User missing GPS data"
"Auth check failed" 
"User has incomplete GPS profile"
```

### Check Server Logs
Look for these in your server logs:
```
✓ Session valid for user: user@example.com
✓ Found existing user: user@example.com  
✓ User has complete GPS profile
```

### Test Authentication Flow

1. **Clear everything**: Cookies + localStorage
2. **Visit your app**: Should go to home page
3. **Click "Get Started"**: Should go to auth page
4. **Enter email**: Should send OTP
5. **Enter OTP**: Should either:
   - Redirect to profile completion (new users)
   - Redirect to available-tasks (existing users with GPS)

### GPS Location Issues

If location permission problems persist:

1. **Ensure HTTPS**: GPS requires secure connection
2. **Check permissions**: Browser → Settings → Privacy → Location
3. **Try different browser**: Test in incognito mode
4. **Mobile devices**: Check device location services

## 📱 User Experience After Fix

### For Existing Users:
1. **Must re-login**: All sessions cleared for security
2. **Location permission**: App requests GPS access (mandatory)
3. **Default location**: Starts with Bangalore coordinates
4. **Profile update**: Users should update their precise location

### For New Users:
1. **Mandatory GPS**: Location permission required during signup
2. **3km radius**: Only see tasks within 3km of location
3. **Distance display**: Tasks show "1.2km away" badges

## 🔄 Verification Steps

After applying the fix:

### 1. Test Core Authentication Flow
- [ ] Home page loads without redirect loop
- [ ] Auth page accepts email and OTP
- [ ] Profile completion works for new users
- [ ] Existing users can access available-tasks

### 2. Test GPS Features
- [ ] Location permission prompt appears
- [ ] Task posting includes GPS coordinates
- [ ] Available tasks show distance badges
- [ ] 3km radius filtering works

### 3. Check Database
```sql
-- Verify user data structure
SELECT id, email, name, latitude, longitude, address_details FROM users LIMIT 5;

-- Verify task data structure  
SELECT id, title, latitude, longitude, address_details FROM tasks LIMIT 5;

-- Check sessions are cleared
SELECT COUNT(*) FROM sessions; -- Should be 0 or very low
```

## 🚨 Emergency Rollback

If the fix doesn't work and you need to rollback:

### Option 1: Revert Code
```bash
git log --oneline -10  # Find previous commit
git checkout PREVIOUS_COMMIT_HASH
git push --force
```

### Option 2: Restore Database Backup
```bash
# If you made a backup before migration
cp database.sqlite.backup database.sqlite
pm2 restart all
```

## 📞 Support Checklist

If users still report issues:

1. **Confirm they cleared browser data completely**
2. **Check if HTTPS is enabled** (required for GPS)
3. **Verify location permissions** in browser settings
4. **Test in incognent/private browsing mode**
5. **Check server logs** for specific error messages
6. **Confirm database migration** completed successfully

## ✅ Success Indicators

You'll know the fix worked when:

- ✅ No more redirect loops between pages
- ✅ Users can complete authentication flow
- ✅ GPS location requests work properly  
- ✅ Task posting and browsing work normally
- ✅ Distance-based filtering shows correct results

The GPS system provides much better location accuracy and user experience compared to the old tower/flat system!