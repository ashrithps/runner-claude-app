# 🏃 Runner - Community Task App

A mobile-first Progressive Web App (PWA) designed for gated communities to help residents post and accept simple tasks within their neighborhood.

## 🎯 Overview

Runner enables community members to:
- **Post tasks** like grocery help, parcel collection, plant watering
- **Accept and complete** tasks from neighbors
- **Earn rewards** through direct UPI payments
- **Build community connections** through mutual assistance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Set up the database:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-schema.sql`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📱 Features

### Core Functionality
- ✅ **Post Tasks** - Simple form to create community tasks
- ✅ **Browse Available Tasks** - View and accept tasks from neighbors  
- ✅ **Task Management** - Track posted and accepted tasks
- ✅ **User Profiles** - Manage personal information and preferences
- ✅ **Real-time Updates** - Tasks update automatically using Zustand store
- ✅ **Mobile-First Design** - Optimized for mobile devices
- ✅ **PWA Support** - Install as native app on mobile

### Mobile Optimizations
- Touch-friendly 44px minimum touch targets
- Prevents zoom on input focus (iOS)
- Safe area support for notched devices
- Bottom navigation for thumb-friendly access

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **ShadCN/UI** - Beautiful, accessible components
- **Zustand** - Lightweight state management
- **Lucide Icons** - Clean, minimal icons

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Built-in data protection

### Deployment
- **Vercel** - Optimized for Next.js (recommended)
- **Netlify** - Alternative option
- **Self-hosted** - Use Coolify + Tailscale for private deployment

## 📂 Project Structure

```
runner-app/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── available-tasks/  # Browse tasks
│   │   ├── post-task/       # Create new tasks
│   │   ├── my-tasks/        # Manage user tasks
│   │   └── profile/         # User profile
│   ├── components/
│   │   ├── ui/              # ShadCN/UI components
│   │   └── navigation/      # Bottom tab navigation
│   └── lib/
│       ├── store.ts         # Zustand state management
│       ├── supabase.ts      # Database client
│       └── utils.ts         # Utility functions
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icon.svg            # App icon
└── supabase-schema.sql      # Database setup
```

## 🎨 Design Principles

### Mobile-First
- Designed primarily for mobile use
- Bottom navigation for easy thumb access
- Large touch targets (minimum 44px)
- Optimized for one-handed operation

### Community-Focused
- Simple task posting and acceptance
- Clear task status tracking
- Direct payment via UPI (no transaction fees)
- Trust-based system for gated communities

### Privacy & Security
- No login required (anonymous usage)
- Data stored locally with Zustand persistence
- Supabase RLS for data protection
- No sensitive data collection

## 📱 Mobile Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Confirm installation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## 🔮 Future Enhancements

### Post-MVP Features
- **Task ratings & feedback** - Build community trust
- **QR code verification** - Confirm task completion
- **Community leaderboard** - Gamify participation
- **Admin panel** - Society management tools
- **Push notifications** - Real-time task alerts
- **Photo attachments** - Visual task descriptions

## 🤝 Contributing

This is a community-focused project. Contributions welcome!

## 📄 License

MIT License - feel free to use this for your community!

---

**Built with ❤️ for community connection**
