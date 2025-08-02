# 🏃 Runner – Hyperlocal Task App for Communities

## 🔥 Concept

**Runner** is a **mobile-first task app** designed for gated communities (like apartments or housing societies).  
Residents can post **simple tasks** (e.g., “Get groceries”, “Water plants”, “Help with parcel delivery”) and other community members (usually kids, teenagers, or helpers) can pick them up and earn rewards.  

**No payment gateway** is needed — users will pay directly via **UPI** or in person.

---

## 📱 Platform

- Mobile-Only Web App (PWA-friendly)
- Optional: Wrap into a mobile app later using **Capacitor** or **Expo**

---

## ⚙️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React-based)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide](https://lucide.dev/)

### Backend
- **Option 1**: [Supabase](https://supabase.com/) (Auth, DB, Realtime)
- **Option 2**: Express.js + SQLite/PostgreSQL (for self-hosting)

### Hosting
- Frontend: Vercel / Netlify
- Backend: Supabase / Railway / Render
- Self-hosted: Coolify + Tailscale

---

## 🧩 UI Screens & Features

### 1. Home Page
- Bottom Tab Navigation:
  - `Post Task`
  - `Available Tasks`
  - `My Tasks`
  - `Profile`

---

### 2. 📝 Post a Task
- **Fields**:
  - Task Title (e.g., “Help carry groceries”)
  - Task Description (Optional)
  - Location (e.g., Tower 12, Flat 1003)
  - Time (e.g., ASAP or choose time)
  - Reward ₹ (manual)
  - UPI ID (optional)
- [Post Task] button

---

### 3. 📋 Available Tasks
- Task cards showing:
  - Title
  - Time / Location
  - Reward ₹
  - [Accept Task] button

---

### 4. 🚀 Runner Task View
- Once accepted:
  - Task Details
  - Status Actions:
    - `In Progress` → `Completed`
  - Completion screen shows UPI ID to request manual payment

---

### 5. 👤 Profile Page
- Name
- Tower/Flat
- Mobile Number
- Toggle: "Available for Tasks" (Yes/No)

---

## 🚫 Not Required in MVP

- No login or OTP verification
- No payment gateway
- No real-time chat or map
- No push notifications

---

## 💡 Developer Notes

- Use localStorage or Supabase anonymous auth for quick identity
- Supabase Realtime or polling to update task availability
- Task ownership logic: 1 task = 1 runner at a time
- Responsive design: touch-friendly UI, quick load times

---

## ⏱️ Estimated Build Timeline

- Basic working prototype in 5–7 days
- Launch-ready MVP in <2 weeks for gated community usage

---

## ✅ Post-MVP Ideas

- Task rating & feedback
- QR scan to verify task delivery
- Community leaderboard / badges
- Admin panel for society managers

---