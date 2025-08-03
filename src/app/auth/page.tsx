'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, KeyRound, CheckCircle, Loader2, Send, Users, MessageCircle, CreditCard, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { ClientAuth } from '@/lib/client-auth'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

type AuthStep = 'email' | 'otp' | 'profile'

function AuthPageContent() {
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOTP] = useState('')
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

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const result = await ClientAuth.getCurrentUser()
      if (result.user) {
        setUser(result.user)
        router.push('/available-tasks')
      }
    }
    
    checkAuth()
  }, [router, setUser])

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await ClientAuth.sendOTP(email)
    
    if (result.success) {
      setStep('otp')
    } else {
      setError(result.error || 'Failed to send OTP')
    }
    
    setIsLoading(false)
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await ClientAuth.verifyOTP(email, otp)
    
    if (result.success) {
      if (result.isNewUser) {
        setIsNewUser(true)
        setStep('profile')
      } else {
        setUser(result.user!)
        router.push('/available-tasks')
      }
    } else {
      setError(result.error || 'Invalid OTP')
    }
    
    setIsLoading(false)
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await ClientAuth.updateProfile(profileData)
    
    if (result.success) {
      setUser(result.user!)
      router.push('/available-tasks')
    } else {
      if (result.error === 'Not authenticated') {
        setError('Session expired. Please start over.')
        setStep('email')
      } else {
        setError(result.error || 'Failed to create profile')
      }
    }
    
    setIsLoading(false)
  }



  const handleProfileInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <PWAInstallPrompt />
        
        {step === 'email' && (
          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏠</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Runner</h1>
                <p className="text-gray-600">Your community task-sharing platform</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Help neighbors with groceries, parcels, and errands</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Earn small rewards paid via UPI</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <span>Direct WhatsApp communication</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span>Secure email verification</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {step === 'email' && 'Get Started'}
              {step === 'otp' && '🔐 Enter Verification Code'}
              {step === 'profile' && '👤 Complete Your Profile'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 'email' && 'Enter your email to join your community'}
              {step === 'otp' && 'Enter the 4-digit code we sent to your email'}
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
            <form onSubmit={handleSendOTP} className="space-y-4">
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
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Verification Code
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <KeyRound className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-medium">Code sent!</p>
                <p className="text-blue-600 text-sm mt-1">
                  Check your email for the 4-digit verification code
                </p>
              </div>
              <div className="text-sm text-gray-600 text-center">
                <p>Sent to: <strong>{email}</strong></p>
                <p className="mt-2">The code will expire in 10 minutes</p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    placeholder="1234"
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={4}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || otp.length !== 4}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Code
                </Button>
              </form>
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setStep('email')}
                >
                  Change Email
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Resend Code
                </Button>
              </div>
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
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}