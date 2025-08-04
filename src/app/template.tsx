'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { LocationGuard } from '@/components/location-guard'
import { ToastProvider } from '@/components/ui/toast'
import { useAppStore } from '@/lib/store'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/auth'
  const isHomePage = pathname === '/'
  const { user, setUser } = useAppStore()

  // If it's the auth page or home page, don't wrap with guards or show BottomNav
  if (isAuthPage || isHomePage) {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    )
  }

  const handleLocationGranted = (lat: number, lon: number) => {
    // Update user location in store if user exists
    if (user) {
      const updatedUser = { ...user, latitude: lat, longitude: lon }
      setUser(updatedUser)
    }
  }

  // For all other pages, require authentication and location
  return (
    <ToastProvider>
      <AuthGuard>
        <LocationGuard onLocationGranted={handleLocationGranted}>
          <div className="min-h-screen bg-gray-50">
            <main className="pb-20 px-4 pt-4 max-w-md mx-auto">
              {children}
            </main>
            <BottomNav />
          </div>
        </LocationGuard>
      </AuthGuard>
    </ToastProvider>
  )
}