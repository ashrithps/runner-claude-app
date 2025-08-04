'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react'
import { getCurrentPosition, checkLocationPermission, requestLocationPermission } from '@/lib/geolocation'

interface LocationGuardProps {
  children: React.ReactNode
  onLocationGranted: (lat: number, lon: number) => void
}

export function LocationGuard({ children, onLocationGranted }: LocationGuardProps) {
  const [locationStatus, setLocationStatus] = useState<'checking' | 'denied' | 'granted' | 'requesting'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkInitialPermission()
  }, [])

  const checkInitialPermission = async () => {
    try {
      const hasPermission = await checkLocationPermission()
      
      if (hasPermission) {
        // Try to get current position
        const coords = await getCurrentPosition()
        setLocationStatus('granted')
        onLocationGranted(coords.latitude, coords.longitude)
      } else {
        setLocationStatus('denied')
      }
    } catch (err) {
      console.error('Error checking location permission:', err)
      setLocationStatus('denied')
      setError('Unable to access location services')
    }
  }

  const handleRequestPermission = async () => {
    setLocationStatus('requesting')
    setError(null)

    try {
      const granted = await requestLocationPermission()
      
      if (granted) {
        const coords = await getCurrentPosition()
        setLocationStatus('granted')
        onLocationGranted(coords.latitude, coords.longitude)
      } else {
        setLocationStatus('denied')
        setError('Location permission is required to use this app')
      }
    } catch (err: any) {
      console.error('Error requesting location permission:', err)
      setLocationStatus('denied')
      setError(err.message || 'Failed to get location permission')
    }
  }

  if (locationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-lg font-semibold mb-2">Checking Location Access</h2>
              <p className="text-gray-600">Please wait while we check your location permissions...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (locationStatus === 'granted') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Location Access Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-gray-600">
              Runner needs access to your location to show you nearby tasks and enable precise delivery coordination.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2">Why we need location:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Show tasks within 3km of your location</li>
                <li>• Help runners find you accurately</li>
                <li>• Enable location-based task matching</li>
                <li>• Calculate distances to tasks</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRequestPermission}
              disabled={locationStatus === 'requesting'}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {locationStatus === 'requesting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Requesting Permission...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Your location is only used for task matching and is never shared publicly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}