'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { setUser, clearUser, refreshUserData } = useAppStore()

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    setMounted(true)
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const { user } = await response.json()
          
          if (user && user.name && user.tower && user.flat) {
            // User has complete profile
            setUser(user)
            setIsAuthenticated(true)
          } else if (user) {
            // User authenticated but incomplete profile, redirect to auth
            setUser(user)
            router.push('/auth')
            return
          } else {
            // No user data, redirect to auth
            clearUser()
            router.push('/auth')
            return
          }
        } else {
          // Not authenticated, redirect to auth
          clearUser()
          router.push('/auth')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearUser()
        router.push('/auth')
        return
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Periodically check auth status
    const interval = setInterval(() => {
      refreshUserData()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [router, setUser, clearUser, refreshUserData])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to auth
  }

  return <>{children}</>
}