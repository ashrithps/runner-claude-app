# 🚀 Quick Migration Setup Guide

Your app needs a database update to support the new "Mark as Paid" feature. Here's the fastest way to set it up:

## ⚡ Super Quick Setup

### **Step 1: Start Your App**
```bash
npm run dev
```

### **Step 2: Run Migration (Choose ONE method)**

#### **Method A: Via Debug Page** ⭐ *Recommended - Easiest*
1. Open your browser to: http://localhost:3000/debug
2. Scroll to "Database Migrations" section
3. Click **"Check Status"** button
4. Click **"Run Migrations"** button
5. ✅ Done! You should see "Up to date"

#### **Method B: Via CLI** *Terminal users*
```bash
# In a NEW terminal (keep dev server running)
node scripts/migrate.js run
```

#### **Method C: Via API** *Developers*
```bash
curl -X POST http://localhost:3000/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate"}'
```

## ✅ Verify It Worked

After running the migration, you should see:
- ✅ "Migration completed successfully" message
- ✅ New "Archived" tab in My Tasks page  
- ✅ "Mark as Paid" button for completed tasks
- ✅ Purple styling for paid/archived tasks

## 🎯 Test the New Feature

1. **Complete a task** (as a runner)
2. **Mark it as paid** (as the task poster)
3. **Check archived tab** - task should appear there
4. **Check email** - runner should get payment confirmation

## 🆘 Having Issues?

### **"Cannot connect to development server"**
- Make sure `npm run dev` is running
- Check http://localhost:3000 works in browser
- Wait a few seconds after starting for server to fully load

### **"Migration failed"**  
- Go to `/debug` page and use the web interface instead
- Check console logs for specific error details
- Restart your dev server: `Ctrl+C` then `npm run dev`

### **"Mark as Paid button missing"**
- Migration probably didn't run - try Method A (Debug Page)
- Refresh the browser after migration completes
- Check `/debug` page shows "Up to date"

## 🔄 For Future Updates

The migration system is now set up! Future database changes will:
- ✅ Run automatically when app starts
- ✅ Be manageable via `/debug` page
- ✅ Include rollback capabilities
- ✅ Track all changes safely

---

**That's it!** The "Mark as Paid" feature with email notifications is now ready to use! 🎉