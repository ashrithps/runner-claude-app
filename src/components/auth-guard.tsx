'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  const { setUser, clearUser } = useAppStore()

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    setMounted(true)
    
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get user profile
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userProfile && !error) {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              tower: userProfile.tower,
              flat: userProfile.flat,
              mobile: userProfile.mobile,
              available_for_tasks: userProfile.available_for_tasks,
              email_notifications: userProfile.email_notifications,
              created_at: userProfile.created_at,
              updated_at: userProfile.updated_at
            })
            setIsAuthenticated(true)
          } else {
            // User authenticated but no profile, redirect to auth for profile completion
            router.push('/auth')
            return
          }
        } else {
          // No session, redirect to auth
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          clearUser()
          router.push('/auth')
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Refresh user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userProfile) {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              tower: userProfile.tower,
              flat: userProfile.flat,
              mobile: userProfile.mobile,
              available_for_tasks: userProfile.available_for_tasks,
              email_notifications: userProfile.email_notifications,
              created_at: userProfile.created_at,
              updated_at: userProfile.updated_at
            })
            setIsAuthenticated(true)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, setUser, clearUser])

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