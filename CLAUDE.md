# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production version
npm run start        # Start production server
npm run lint         # Run ESLint
```

### ShadCN/UI Component Management
```bash
npx shadcn@latest add [component]  # Add new ShadCN/UI components
npx shadcn@latest init             # Reinitialize ShadCN/UI config
```

### Database Operations
- Run `supabase-schema.sql` in Supabase SQL Editor to set up database
- Use `/debug` page in the app to test Supabase connection and create test data

## Architecture Overview

### Core Technology Stack
- **Next.js 15** with App Router, TypeScript, and Turbopack
- **Tailwind CSS v4** with ShadCN/UI components
- **Zustand** for state management with persistence
- **Supabase** for PostgreSQL database with Row Level Security and Authentication
- **Resend** for email notifications and OTP delivery
- **WhatsApp Integration** for direct communication between users
- **Progressive Web App** with mobile-first design

### State Management Architecture
The app uses a hybrid approach combining Zustand store with Supabase:

**Zustand Store (`src/lib/store.ts`)**:
- Manages local state with persistence via localStorage
- Provides fallback functionality when Supabase is unavailable
- All database operations are async functions that sync with Supabase
- Three main data collections: `tasks`, `myPostedTasks`, `myAcceptedTasks`

**Data Flow Pattern**:
1. UI components call Zustand actions
2. Actions attempt Supabase operations first
3. On success, update local Zustand state
4. On failure, fall back to local-only operations (with mock data)

### Database Schema
Three main tables with foreign key relationships:
- `users`: Community member profiles (email, name, tower, flat, mobile, availability, email preferences)
- `tasks`: Task lifecycle management (title, description, location, time, reward, status, poster/runner relationships)
- `notifications`: Email notification tracking (user_id, task_id, type, message, read status)

### Mobile-First UI Architecture

**Navigation**: Fixed bottom tab navigation optimized for thumb access
- Post Task, Available Tasks, My Tasks, Profile, Debug

**Layout Structure**:
- `src/app/template.tsx`: Provides consistent mobile layout wrapper
- `src/components/navigation/bottom-nav.tsx`: Bottom navigation component
- Each page is contained within max-width mobile container

**Mobile Optimizations**:
- 44px minimum touch targets
- Safe area support for notched devices
- Prevents zoom on input focus (iOS)
- PWA manifest with mobile installation support

### Component Architecture

**UI Components**: All from ShadCN/UI in `src/components/ui/`
- Consistent design system based on Radix UI primitives
- Tailwind CSS styling with CSS variables for theming

**Page Structure**: Each route in `src/app/` follows pattern:
- Form-heavy pages (post-task, profile) use controlled components with local state
- Data-display pages (available-tasks, my-tasks) connect to Zustand store
- All pages are mobile-responsive with consistent spacing/layout

### Key Integration Points

**Authentication System**:
- Email OTP authentication via Supabase Auth
- AuthGuard component protects all routes except `/auth`
- User session management with automatic profile creation
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Email Notifications**:
- Resend API for email delivery (`RESEND_API_KEY`, `FROM_EMAIL`)
- Automatic notifications for task assignment and completion
- User preference controls for email notifications
- Email templates with task details and app links

**WhatsApp Integration**:
- Direct messaging via WhatsApp web links
- Pre-populated messages for task coordination
- Phone number validation and formatting
- Contact buttons in task management interface

**Supabase Integration**:
- Row Level Security policies require authentication
- Real-time subscriptions not implemented (uses polling via manual refresh)

**PWA Features**:
- Manifest in `public/manifest.json`
- Service worker not implemented
- Mobile app-like experience via viewport and theme configuration

## Development Patterns

### Adding New Features
1. Define TypeScript interfaces in store or supabase files
2. Add Zustand actions for state management
3. Create Supabase database operations
4. Build UI components using ShadCN/UI
5. Implement mobile-responsive design

### Database Operations
- All database operations have fallback to mock data
- Use Supabase client with async/await pattern
- Handle errors gracefully with console logging
- Update Zustand state after successful database operations
- **Important**: `poster_name` and `runner_name` are not database columns - they're derived from JOINs with the `users` table
- Users are automatically created in database via `ensureUserInDatabase()` before task operations
- **UUID Requirement**: All user IDs must be valid UUIDs - use `createDefaultUser()` from `@/lib/utils` to generate proper user objects
- **Foreign Key Constraint**: Users must exist in database before creating tasks - `ensureUserInDatabase()` is called automatically and must succeed

### Styling Approach
- Tailwind CSS v4 with CSS variables
- Mobile-first responsive design
- ShadCN/UI component variants for consistency
- Custom CSS classes for mobile optimizations (safe-area, touch targets)

### State Persistence
- Zustand persist middleware stores user data and personal tasks
- Available tasks are not persisted (always loaded fresh)
- Local storage used as backup when Supabase unavailable

## Project Structure Context

```
src/
├── app/                     # Next.js App Router pages
│   ├── available-tasks/     # Browse community tasks
│   ├── post-task/          # Create new tasks  
│   ├── my-tasks/           # Task management (posted/accepted)
│   ├── profile/            # User profile management
│   ├── debug/              # Development/testing tools
│   ├── layout.tsx          # Root layout with PWA metadata
│   └── template.tsx        # Mobile layout wrapper
├── components/
│   ├── ui/                 # ShadCN/UI components
│   └── navigation/         # Bottom tab navigation
└── lib/
    ├── store.ts            # Zustand state management
    ├── supabase.ts         # Database client
    ├── test-connection.ts  # Debug utilities
    └── utils.ts            # ShadCN/UI utilities
```

## Community Context
This is a task-sharing app for gated communities where residents help each other with simple tasks (groceries, parcels, plant care) for small rewards paid via UPI. Features email OTP authentication, automated notifications, and WhatsApp integration for seamless communication.