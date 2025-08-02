# Runner App Setup Guide

This guide will help you set up the Runner community task app with email OTP authentication, notifications, and WhatsApp integration.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account for email delivery

## Environment Setup

1. **Clone and Install Dependencies**
   ```bash
   cd runner-app
   npm install
   ```

2. **Environment Variables**
   
   Copy `.env.example` to `.env.local` and configure:
   
   ```bash
   cp .env.example .env.local
   ```
   
   Update the values in `.env.local`:
   
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Email Configuration (Resend)
   RESEND_API_KEY=your_resend_api_key
   FROM_EMAIL=Runner App <noreply@yourapp.com>
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## Supabase Setup

1. **Create a New Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key to `.env.local`

2. **Configure Authentication**
   - In Supabase Dashboard, go to Authentication > Settings
   - Enable **Email** provider
   - Set **Site URL** to `http://localhost:3000` (or your domain)
   - Set **Redirect URLs** to include `http://localhost:3000/auth`

3. **Run Database Schema**
   - In Supabase Dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Click **Run** to create tables and policies

4. **Configure Email Templates** (Optional)
   - Go to Authentication > Email Templates
   - Customize the OTP email template if desired

## Resend Setup

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up and verify your account

2. **Add Domain** (for production)
   - In Resend dashboard, add your domain
   - Verify DNS records

3. **Get API Key**
   - Create an API key in the Resend dashboard
   - Copy it to your `.env.local` file

4. **Configure FROM_EMAIL**
   - For development: use `noreply@resend.dev`
   - For production: use your verified domain email

## Development

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access the App**
   - Open [http://localhost:3000](http://localhost:3000)
   - You'll be redirected to `/auth` for email OTP login

3. **Test the Flow**
   - Enter your email address
   - Check your email for the OTP code
   - Complete your profile setup
   - Start using the app!

## Features Overview

### 🔐 Authentication
- **Email OTP**: Secure login without passwords
- **Profile Setup**: Complete profile during first login
- **Session Management**: Automatic login persistence

### 📧 Email Notifications
- **Task Assignment**: Poster receives email when task is accepted
- **Task Completion**: Poster receives email when task is completed
- **User Preferences**: Toggle email notifications in profile

### 📱 WhatsApp Integration
- **Direct Contact**: Tap to message task poster/runner on WhatsApp
- **Pre-filled Messages**: Context-aware message templates
- **Coordination**: Easy communication for task details

### 🏠 Community Features
- **Task Posting**: Create tasks with location, time, and reward
- **Task Browsing**: View available community tasks
- **Task Management**: Track posted and accepted tasks
- **Mobile-First**: Optimized for mobile devices

## Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys in `.env.local`
- Check that email provider is enabled in Supabase
- Ensure site URL is configured correctly

### Email Not Sending
- Verify Resend API key is correct
- Check that FROM_EMAIL domain is verified
- Look at Resend dashboard for delivery logs

### Database Errors
- Ensure `supabase-schema.sql` was run completely
- Check that RLS policies are enabled
- Verify user has proper permissions

### WhatsApp Links Not Working
- Ensure phone numbers are in international format
- Check that mobile numbers are saved in user profiles
- Test WhatsApp web access in browser

## Production Deployment

1. **Update Environment Variables**
   - Set production Supabase URL and keys
   - Use verified domain for FROM_EMAIL
   - Set NEXT_PUBLIC_APP_URL to your domain

2. **Configure Authentication**
   - Update Site URL in Supabase to your domain
   - Add production redirect URLs

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

## Security Notes

- RLS policies require user authentication
- Users can only modify their own data
- Email notifications respect user preferences
- WhatsApp links don't expose phone numbers publicly
- All database operations include proper error handling

## Support

For issues or questions:
- Check the browser console for error messages
- Review Supabase and Resend dashboard logs
- Ensure all environment variables are set correctly
- Verify database schema was applied successfully