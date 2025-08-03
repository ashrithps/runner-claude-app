'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Users, MapPin, IndianRupee, Clock, CheckCircle, Phone, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const { user, setUser, clearUser } = useAppStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (response.ok) {
          const { user: authenticatedUser } = await response.json()
          
          if (authenticatedUser && authenticatedUser.name && authenticatedUser.tower && authenticatedUser.flat) {
            // User has complete profile, redirect to available tasks
            setUser(authenticatedUser)
            router.push('/available-tasks')
            return
          } else if (authenticatedUser) {
            // User authenticated but incomplete profile, redirect to auth
            setUser(authenticatedUser)
            router.push('/auth')
            return
          }
        }
        
        // User not authenticated, stay on home page
        clearUser()
      } catch (error) {
        console.error('Auth check failed:', error)
        clearUser()
      }
    }

    checkAuth()
  }, [router, setUser, clearUser])

  // Show loading while checking authentication
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-8 px-4 pt-8 max-w-md mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🏃</div>
        <h1 className="text-4xl font-bold text-gray-900">Runner</h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Your community task-sharing platform. Help neighbors, earn rewards, build connections.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline">
              Join Community
            </Button>
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">How Runner Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-full p-2 mt-1">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Community Powered</h3>
                <p className="text-gray-600 text-sm">Connect with neighbors in your gated community for mutual assistance</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fair Rewards</h3>
                <p className="text-gray-600 text-sm">Earn small rewards for helping others with everyday tasks</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 rounded-full p-2 mt-1">
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Integration</h3>
                <p className="text-gray-600 text-sm">Seamless communication via WhatsApp for task coordination</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Quick Tasks</h3>
                <p className="text-gray-600 text-sm">Groceries, parcels, plant care & more</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Secure & Safe</h3>
                <p className="text-gray-600 text-sm">Email OTP authentication & community verification</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Local Focus</h3>
                <p className="text-gray-600 text-sm">Tower & flat-based location system</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Task Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">🛒 Grocery Shopping</Badge>
            <Badge variant="secondary">📦 Parcel Collection</Badge>
            <Badge variant="secondary">🌱 Plant Watering</Badge>
            <Badge variant="secondary">🚗 Car Pickup/Drop</Badge>
            <Badge variant="secondary">🏠 House Sitting</Badge>
            <Badge variant="secondary">🐕 Pet Care</Badge>
            <Badge variant="secondary">🔧 Quick Repairs</Badge>
            <Badge variant="secondary">📚 Tutoring Help</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to get started?</h3>
          <p className="text-gray-600 mb-4">Join your community and start helping each other today!</p>
          <Link href="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Join Your Community
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
      </main>
    </div>
  )
}
