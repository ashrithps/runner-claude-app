# Replit Database Setup Guide

## Overview

Your app is now configured to use Replit's built-in database service. No additional packages need to be installed!

## How Replit Database Works

Replit provides a global `Database` object that you can use directly in your code. The database is:
- **Persistent** - Data survives repl restarts
- **Fast** - Built on top of SQLite
- **Simple** - Key-value store with JSON serialization
- **Free** - Included with every Repl

## Database Operations

The database supports these basic operations:

```javascript
// Set a value
await db.set('key', value)

// Get a value
const value = await db.get('key')

// Delete a value
await db.delete('key')

// List all keys (optionally with prefix)
const keys = await db.list('prefix:')

// Clear all data
await db.empty()
```

## Your App's Database Structure

Your app uses these key patterns:

- `user:{id}` - User profiles
- `user_email:{email}` - Email to user ID mapping
- `task:{id}` - Task data
- `notification:{id}` - User notifications
- `otp:{email}` - OTP sessions for authentication

## Environment Variables for Replit

You only need these environment variables in Replit:

```
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_sender_email
```

**Note**: You don't need Supabase environment variables anymore since we're using Replit's database!

## Setting Up in Replit

1. **Create your Repl** and import the GitHub repository
2. **Go to Secrets** tab in your Repl
3. **Add these environment variables**:
   ```
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=your_sender_email
   ```
4. **Click Run** - The app will automatically initialize the database

## Sample Data

The app automatically loads sample data when first run:
- 3 sample users (Priya, Raj, Anita)
- 3 sample tasks (groceries, plants, parcel)
- All with realistic community data

## Database Features

✅ **Automatic initialization** - Database starts automatically  
✅ **Sample data loading** - Demo data for testing  
✅ **Error handling** - Graceful fallbacks  
✅ **Type safety** - Full TypeScript support  
✅ **Persistence** - Data survives restarts  

## Troubleshooting

### If database operations fail:
1. Check the console for error messages
2. Ensure you're running on Replit (not local development)
3. The app will fall back to in-memory storage if needed

### If you want to clear all data:
- Visit `/debug` page in your app
- Use the "Clear All Data" function

### If sample data doesn't load:
- Check the console for initialization errors
- Try refreshing the page
- Sample data only loads once per database

## Migration from Supabase

The app automatically detects and uses Replit's database when available. No manual migration needed!

## Performance Tips

- Database operations are async - always use `await`
- Use prefixes for efficient key listing
- The database handles JSON serialization automatically
- Large datasets are supported but keep individual values under 1MB

## Security

- Database is isolated to your Repl
- No external database credentials needed
- Data is private to your Repl instance
- Automatic backup with Replit's infrastructure 