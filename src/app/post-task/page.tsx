'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedCard } from '@/components/ui/animated-card'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { MapPin, CheckCircle, Loader2, Sparkles, Plus, RotateCcw } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getCurrencySymbol } from '@/lib/currency'
import { createDefaultUser } from '@/lib/utils'
import { getCurrentPosition, shouldShowSafariHelp, getSafariLocationInstructions } from '@/lib/geolocation'
import { useToast } from '@/components/ui/toast'
import { useDynamicPlaceholder } from '@/hooks/useDynamicPlaceholder'

export default function PostTaskPage() {
  const router = useRouter()
  const { addTask, user, setUser, currency, currencyLoading } = useAppStore()
  const { showToast } = useToast()
  const { placeholder: dynamicPlaceholder, isVisible } = useDynamicPlaceholder(3000)
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
  const [showSafariHelp, setShowSafariHelp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
      setShowSafariHelp(shouldShowSafariHelp(err))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting || submitSuccess) {
      return
    }
    
    setIsSubmitting(true)
    
    if (!user) {
      // Create a default user if none exists
      const defaultUser = createDefaultUser()
      setUser(defaultUser)
    }

    const currentUser = user || createDefaultUser()

    if (!selectedDateTime) {
      showToast('Please select date and time for the task', 'warning')
      setIsSubmitting(false)
      return
    }

    if (locationStatus !== 'success') {
      showToast('Please set a valid location for the task', 'warning')
      setIsSubmitting(false)
      return
    }
    
    try {
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

      await addTask(taskData)
      
      // Mark success and show feedback
      setSubmitSuccess(true)
      showToast('🎉 Task posted successfully! Your community will see it now.', 'success')
      
      // Reset form completely
      setFormData({
        title: '',
        description: '',
        latitude: formData.latitude, // Keep location
        longitude: formData.longitude,
        address_details: formData.address_details,
        reward: ''
      })
      setSelectedDateTime(undefined)

      // Redirect to available tasks after a brief delay
      setTimeout(() => {
        router.push('/available-tasks')
      }, 2000)
    } catch (error) {
      showToast('Failed to post task. Please try again.', 'error')
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Reset success state when user starts typing again
    if (submitSuccess) {
      setSubmitSuccess(false)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Floating animation for header icons

  return (
    <div className="space-y-6">
      {/* Simplified Header */}
      <motion.div 
        className="rounded-lg bg-blue-600 p-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >

        {/* Main Header Content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3 mr-3">
              <Plus className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold">Create a Task</h1>
              <p className="text-blue-100">Your community is ready to help!</p>
            </div>
          </div>

        </div>

      </motion.div>

      <AnimatedCard delay={0.1}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="bg-gray-100 rounded-lg p-2 mr-3">
              <Sparkles className="h-5 w-5 text-gray-600" />
            </div>
            Task Details
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-700 font-medium">
                Task Title *
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  placeholder={dynamicPlaceholder}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  className="focus:border-blue-500 transition-all duration-200"
                  style={{ 
                    opacity: isVisible ? 1 : 0.7,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Be specific! Good titles get faster responses
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Additional details about the task... What exactly do you need help with?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add context to help others understand your needs better
              </p>
            </div>

            {/* Location Section */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">
                Task Location *
              </Label>
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
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Current Location
                  </Button>
                )}
                
                {locationStatus === 'loading' && (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 text-blue-600 mb-2 mx-auto animate-spin" />
                    <p className="text-sm text-gray-600">Getting your location...</p>
                  </div>
                )}
                
                {locationStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Location Set Successfully!</p>
                        <p className="text-xs text-green-600">
                          Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {locationStatus === 'error' && (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 font-medium">⚠️ {locationError}</p>
                      {showSafariHelp && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-800 mb-2">Safari Location Help:</p>
                          <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                            {getSafariLocationInstructions()}
                          </pre>
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_details" className="text-gray-700 font-medium">
                Address Details *
              </Label>
              <Input
                id="address_details"
                placeholder="e.g., Tower 12, Flat 1003, 2nd Floor, Main Gate"
                value={formData.address_details}
                onChange={(e) => handleInputChange('address_details', e.target.value)}
                required
                className="focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Detailed address helps runners find you quickly!
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime" className="text-gray-700 font-medium">
                When needed? *
              </Label>
              <div className="relative">
                <DateTimePicker
                  date={selectedDateTime}
                  onDateTimeChange={setSelectedDateTime}
                  placeholder="Pick a date and time"
                />
              </div>
              <p className="text-sm text-gray-600">
                {selectedDateTime 
                  ? `Scheduled for ${selectedDateTime.toLocaleDateString()} at ${selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : "Choose when you need this task completed"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward" className="text-gray-700 font-medium">
                Reward Amount ({getCurrencySymbol(currency)}) *
              </Label>
              <div className="relative">
                <Input
                  id="reward"
                  type="number"
                  placeholder="50"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', e.target.value)}
                  required
                  min="1"
                  className="focus:border-blue-500 pl-8"
                />
                <div className="absolute left-3 top-3 text-gray-500">{getCurrencySymbol(currency)}</div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || submitSuccess}
                className={`w-full font-semibold py-3 transition-colors ${
                  submitSuccess 
                    ? 'bg-green-600 hover:bg-green-600 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submitSuccess ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Task Posted Successfully!
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Posting Task...
                  </div>
                ) : (
                  "Post Task to Community"
                )}
              </Button>
            </div>
          </form>
        </div>
      </AnimatedCard>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Tips for Success</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Be specific about what help you need</p>
          <p>• Offer fair compensation for the effort</p>
          <p>• Include your exact location for easy finding</p>
          <p>• Set realistic timeframes for completion</p>
        </div>
      </div>
    </div>
  )
}