'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

type AuthStep = 'email' | 'sent' | 'profile'

function AuthPageContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    tower: '',
    flat: '',
    mobile: '',
    available_for_tasks: true,
    email_notifications: true
  })

  const router = useRouter()
  const { setUser } = useAppStore()

  // Handle URL parameters (from callback)
  useEffect(() => {
    const stepParam = searchParams.get('step')
    const emailParam = searchParams.get('email')
    const errorParam = searchParams.get('error')
    const code = searchParams.get('code')

    if (errorParam) {
      setError('Authentication failed. Please try again.')
    }

    if (stepParam === 'profile' && emailParam) {
      setStep('profile')
      setEmail(decodeURIComponent(emailParam))
      setIsNewUser(true)
    }

    // Handle magic link code
    if (code) {
      handleMagicLinkCode(code)
    }
  }, [searchParams])

  const handleMagicLinkCode = async (code: string) => {
    try {
      setIsLoading(true)
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth code exchange error:', error)
        setError('Authentication failed. Please try again.')
        return
      }

      if (data.session) {
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profileError || !userProfile) {
          // New user, need to create profile
          setIsNewUser(true)
          setStep('profile')
          if (data.session.user.email) {
            setEmail(data.session.user.email)
          }
        } else {
          // Existing user, log them in
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
          router.push('/available-tasks')
        }
      }
    } catch (err) {
      console.error('Magic link handling error:', err)
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Check for auth state changes (when user clicks magic link)
  useEffect(() => {
    // Check if user is already authenticated
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // User is already logged in, check profile
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !userProfile) {
          setIsNewUser(true)
          setStep('profile')
        } else {
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
          router.push('/available-tasks')
        }
      }
    }

    checkCurrentUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !userProfile) {
          // New user, need to create profile
          setIsNewUser(true)
          setStep('profile')
          if (session.user.email) {
            setEmail(session.user.email)
          }
        } else {
          // Existing user, log them in
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
          router.push('/available-tasks')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, setUser])

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setStep('sent')
      }
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      
      if (!authData.user) {
        setError('Authentication session expired. Please start over.')
        setStep('email')
        return
      }

      const newUser = {
        id: authData.user.id,
        email: email,
        ...profileData
      }

      const { error } = await supabase
        .from('users')
        .insert(newUser)

      if (error) {
        setError(error.message)
      } else {
        setUser({
          ...newUser,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        router.push('/available-tasks')
      }
    } catch (err) {
      setError('Failed to create profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {step === 'email' && '🏠 Welcome to Runner'}
            {step === 'sent' && '📧 Check Your Email'}
            {step === 'profile' && '👤 Complete Your Profile'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'sent' && 'Click the magic link we sent to your email to continue'}
            {step === 'profile' && 'Let your neighbors know who you are'}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Send Magic Link
              </Button>
            </form>
          )}

          {step === 'sent' && (
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">Magic link sent!</p>
                <p className="text-blue-600 text-sm mt-1">
                  Check your email and click the link to continue
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Sent to: <strong>{email}</strong></p>
                <p className="mt-2">The link will expire in 1 hour</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('email')}
              >
                Use Different Email
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => handleSendMagicLink({ preventDefault: () => {} } as React.FormEvent)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Resend Magic Link
              </Button>
            </div>
          )}

          {step === 'profile' && (
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => handleProfileInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tower">Tower</Label>
                  <Input
                    id="tower"
                    value={profileData.tower}
                    onChange={(e) => handleProfileInputChange('tower', e.target.value)}
                    placeholder="e.g., Tower 12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flat">Flat</Label>
                  <Input
                    id="flat"
                    value={profileData.flat}
                    onChange={(e) => handleProfileInputChange('flat', e.target.value)}
                    placeholder="e.g., Flat 1003"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={profileData.mobile}
                  onChange={(e) => handleProfileInputChange('mobile', e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Setup
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}