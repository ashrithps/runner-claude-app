'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { MapPin, CheckCircle, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createDefaultUser } from '@/lib/utils'
import { getCurrentPosition } from '@/lib/geolocation'

export default function PostTaskPage() {
  const router = useRouter()
  const { addTask, user, setUser } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: 0,
    longitude: 0,
    address_details: '',
    reward: ''
  })
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(undefined)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState('')

  // Auto-populate location from user's current location on page load
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setFormData(prev => ({
        ...prev,
        latitude: user.latitude,
        longitude: user.longitude,
        address_details: user.address_details || ''
      }))
      setLocationStatus('success')
    } else {
      // Try to get current location
      handleGetCurrentLocation()
    }
  }, [user])

  const handleGetCurrentLocation = async () => {
    setLocationStatus('loading')
    setLocationError('')

    try {
      const coords = await getCurrentPosition()
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude
      }))
      setLocationStatus('success')
    } catch (err) {
      setLocationStatus('error')
      setLocationError(err instanceof Error ? err.message : 'Failed to get location')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      // Create a default user if none exists
      const defaultUser = createDefaultUser()
      setUser(defaultUser)
    }

    const currentUser = user || createDefaultUser()

    if (!selectedDateTime) {
      alert('Please select date and time for the task')
      return
    }

    if (locationStatus !== 'success') {
      alert('Please set a valid location for the task')
      return
    }
    
    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address_details: formData.address_details,
      time: selectedDateTime.toISOString(),
      reward: parseInt(formData.reward),
      poster_id: currentUser.id,
      poster_name: currentUser.name,
      status: 'available' as const
    }

    addTask(taskData)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      latitude: formData.latitude, // Keep location
      longitude: formData.longitude,
      address_details: formData.address_details,
      reward: ''
    })
    setSelectedDateTime(undefined)

    // Redirect to available tasks
    router.push('/available-tasks')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📝 Post a Task</h1>
        <p className="text-gray-600 mt-1">Get help from your community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Help carry groceries"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details about the task..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-2">
              <Label>Task Location *</Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">GPS Location</span>
                </div>
                
                {locationStatus === 'idle' && (
                  <Button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Current Location
                  </Button>
                )}
                
                {locationStatus === 'loading' && (
                  <div className="text-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Getting location...</p>
                  </div>
                )}
                
                {locationStatus === 'success' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Location Set</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </p>
                    <Button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      Update Location
                    </Button>
                  </div>
                )}
                
                {locationStatus === 'error' && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">{locationError}</p>
                    <Button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_details">Address Details *</Label>
              <Input
                id="address_details"
                placeholder="e.g., Tower 12, Flat 1003, 2nd Floor"
                value={formData.address_details}
                onChange={(e) => handleInputChange('address_details', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Include building/tower, flat number, floor - helps runners find you easily
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime">When needed? *</Label>
              <DateTimePicker
                date={selectedDateTime}
                onDateTimeChange={setSelectedDateTime}
                placeholder="Pick a date and time"
              />
              <p className="text-sm text-gray-500">
                Choose when you need this task completed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward Amount (₹) *</Label>
              <Input
                id="reward"
                type="number"
                placeholder="50"
                value={formData.reward}
                onChange={(e) => handleInputChange('reward', e.target.value)}
                required
                min="1"
              />
            </div>


            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Post Task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips for better results</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about what help you need</li>
          <li>• Offer fair compensation for the effort</li>
          <li>• Include your exact location for easy finding</li>
        </ul>
      </div>
    </div>
  )
}