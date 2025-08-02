# Deploying Runner Claude App on Replit

## Quick Setup

1. **Fork this repository** to your GitHub account
2. **Go to [replit.com](https://replit.com)** and sign in
3. **Click "Create Repl"** and select "Import from GitHub"
4. **Paste your repository URL**: `https://github.com/yourusername/runner-claude-app`
5. **Select "Node.js"** as the language
6. **Click "Import from GitHub"**

## Environment Variables Setup

After importing, you'll need to set up your environment variables:

1. **Go to the "Secrets" tab** in your Repl
2. **Add the following environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

## Running the App

1. **Click "Run"** in your Repl
2. **Wait for the build to complete** (this may take a few minutes on first run)
3. **Your app will be available** at the Replit URL provided

## Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** support
- ✅ **Tailwind CSS** for styling
- ✅ **Supabase** integration
- ✅ **Email functionality** with Resend
- ✅ **Responsive design**
- ✅ **Authentication** system

## Troubleshooting

### If the app doesn't start:
1. Check the console for error messages
2. Ensure all environment variables are set correctly
3. Try running `npm install` manually in the shell

### If you see build errors:
1. Make sure you're using Node.js 18+ (Replit should handle this automatically)
2. Check that all dependencies are properly installed

## Customization

- **Update environment variables** in the Secrets tab
- **Modify the app** directly in the Replit editor
- **Deploy changes** by clicking "Run" again

## Support

If you encounter any issues:
1. Check the console logs in Replit
2. Verify your Supabase and Resend configurations
3. Ensure all environment variables are properly set

## Live Demo

Your app will be available at: `https://your-repl-name.your-username.repl.co` 