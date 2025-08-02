'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'

  // If it's the auth page, don't wrap with AuthGuard or show BottomNav
  if (isAuthPage) {
    return <>{children}</>
  }

  // For all other pages, require authentication
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="pb-20 px-4 pt-4 max-w-md mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}