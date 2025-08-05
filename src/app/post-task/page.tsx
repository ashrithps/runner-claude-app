'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnimatedButton } from '@/components/ui/animated-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedCard } from '@/components/ui/animated-card'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { MapPin, CheckCircle, Loader2, Sparkles, Zap, Heart, Users, Clock, Gift, Star, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getCurrencySymbol } from '@/lib/currency'
import { createDefaultUser } from '@/lib/utils'
import { getCurrentPosition } from '@/lib/geolocation'
import { useToast } from '@/components/ui/toast'

export default function PostTaskPage() {
  const router = useRouter()
  const { addTask, user, setUser, currency, currencyLoading } = useAppStore()
  const { showToast } = useToast()
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
      
      // Show success message
      showToast('🎉 Task posted successfully! Your community will see it now.', 'success')
      
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

      // Redirect to available tasks after a brief delay
      setTimeout(() => {
        router.push('/available-tasks')
      }, 1500)
    } catch (error) {
      showToast('Failed to post task. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Floating animation for header icons
  const floatingIcons = [
    { icon: Heart, color: 'text-pink-500', delay: 0 },
    { icon: Sparkles, color: 'text-yellow-500', delay: 0.5 },
    { icon: Users, color: 'text-blue-500', delay: 1 },
    { icon: Zap, color: 'text-purple-500', delay: 1.5 },
    { icon: Gift, color: 'text-green-500', delay: 2 },
    { icon: Star, color: 'text-orange-500', delay: 2.5 }
  ]

  return (
    <div className="space-y-6">
      {/* Dynamic Animated Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, #ffffff 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 50%)',
                'radial-gradient(circle at 40% 40%, #ffffff 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              className={`absolute ${item.color}`}
              style={{
                left: `${20 + (index * 12)}%`,
                top: `${30 + (index % 2) * 40}%`
              }}
              animate={{
                y: [-10, 10, -10],
                rotate: [-5, 5, -5],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: item.delay,
                ease: "easeInOut"
              }}
            >
              <item.icon className="h-6 w-6 opacity-30" />
            </motion.div>
          ))}
        </div>

        {/* Main Header Content */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-center mb-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="bg-white/20 rounded-full p-3 mr-3"
            >
              <Plus className="h-8 w-8 text-white" />
            </motion.div>
            
            <div>
              <motion.h1 
                className="text-3xl font-bold"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Create a Task
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-lg font-medium"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Your community is ready to help! ✨
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="flex justify-center space-x-6 mt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {[
              { icon: Users, label: 'Community', value: '50+' },
              { icon: Clock, label: 'Avg Response', value: '15min' },
              { icon: Star, label: 'Success Rate', value: '98%' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-white/20 rounded-lg p-2 mb-1 inline-block">
                  <stat.icon className="h-4 w-4 mx-auto" />
                </div>
                <div className="text-xs font-semibold">{stat.value}</div>
                <div className="text-xs text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Animated Border Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/20"
          animate={{
            boxShadow: [
              '0 0 20px rgba(255,255,255,0.1)',
              '0 0 40px rgba(255,255,255,0.2)',
              '0 0 20px rgba(255,255,255,0.1)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <AnimatedCard delay={0.1}>
        <div className="p-6">
          <motion.h2 
            className="text-xl font-semibold text-gray-900 mb-6 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              className="bg-blue-100 rounded-lg p-2 mr-3"
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Sparkles className="h-5 w-5 text-blue-600" />
            </motion.div>
            Task Details
          </motion.h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Label htmlFor="title" className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-blue-600 rounded-full mr-2"
                  animate={{ scale: focusedField === 'title' ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                Task Title *
              </Label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input
                  id="title"
                  placeholder="e.g., Help carry groceries from supermarket"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="border-2 transition-all duration-200 focus:border-blue-500 focus:shadow-lg"
                />
              </motion.div>
              <AnimatePresence>
                {focusedField === 'title' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-blue-600 mt-1"
                  >
                    💡 Be specific! Good titles get faster responses
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Label htmlFor="description" className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-purple-600 rounded-full mr-2"
                  animate={{ scale: focusedField === 'description' ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                Description (Optional)
              </Label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Textarea
                  id="description"
                  placeholder="Additional details about the task... What exactly do you need help with?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  className="border-2 transition-all duration-200 focus:border-purple-500 focus:shadow-lg resize-none"
                />
              </motion.div>
              <AnimatePresence>
                {focusedField === 'description' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-purple-600 mt-1"
                  >
                    ✨ Add context to help others understand your needs better
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Location Section */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Label className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-green-600 rounded-full mr-2"
                  animate={{ scale: locationStatus === 'loading' ? [1, 1.5, 1] : 1 }}
                  transition={{ duration: 1, repeat: locationStatus === 'loading' ? Infinity : 0 }}
                />
                Task Location *
              </Label>
              <motion.div 
                className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm"
                whileHover={{ shadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">GPS Location</span>
                </div>
                
                <AnimatePresence mode="wait">
                  {locationStatus === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatedButton
                        type="button"
                        onClick={handleGetCurrentLocation}
                        variant="outline"
                        animation="bounce"
                        haptic
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Current Location
                      </AnimatedButton>
                    </motion.div>
                  )}
                  
                  {locationStatus === 'loading' && (
                    <motion.div
                      className="text-center py-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <Loader2 className="h-6 w-6 text-blue-600 mb-2" />
                      </motion.div>
                      <p className="text-sm text-gray-600">Getting your location...</p>
                      <div className="mt-2 flex justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {locationStatus === 'success' && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div 
                        className="flex items-center space-x-2 text-green-700 bg-green-50 rounded-lg p-3"
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </motion.div>
                        <span className="text-sm font-medium">Location captured successfully!</span>
                      </motion.div>
                      <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">
                        📍 {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </p>
                      <AnimatedButton
                        type="button"
                        onClick={handleGetCurrentLocation}
                        variant="ghost"
                        animation="scale"
                        className="w-full text-green-700 hover:bg-green-50"
                      >
                        📱 Update Location
                      </AnimatedButton>
                    </motion.div>
                  )}
                  
                  {locationStatus === 'error' && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div
                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                        animate={{ x: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <p className="text-sm text-red-600 font-medium">⚠️ {locationError}</p>
                      </motion.div>
                      <AnimatedButton
                        type="button"
                        onClick={handleGetCurrentLocation}
                        variant="outline"
                        animation="shake"
                        haptic
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Try Again
                      </AnimatedButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Label htmlFor="address_details" className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-orange-600 rounded-full mr-2"
                  animate={{ scale: focusedField === 'address_details' ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                Address Details *
              </Label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Input
                  id="address_details"
                  placeholder="e.g., Tower 12, Flat 1003, 2nd Floor, Main Gate"
                  value={formData.address_details}
                  onChange={(e) => handleInputChange('address_details', e.target.value)}
                  onFocus={() => setFocusedField('address_details')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="border-2 transition-all duration-200 focus:border-orange-500 focus:shadow-lg"
                />
              </motion.div>
              <AnimatePresence>
                {focusedField === 'address_details' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-orange-600 mt-1"
                  >
                    📍 Detailed address helps runners find you quickly!
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Label htmlFor="datetime" className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-pink-600 rounded-full mr-2"
                  animate={{ scale: focusedField === 'datetime' ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                When needed? *
              </Label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <DateTimePicker
                  date={selectedDateTime}
                  onDateTimeChange={setSelectedDateTime}
                  placeholder="Pick a date and time"
                />
                {selectedDateTime && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
              <motion.p 
                className="text-sm text-pink-600 font-medium"
                animate={{ opacity: selectedDateTime ? 1 : 0.7 }}
              >
                {selectedDateTime 
                  ? `⏰ Scheduled for ${selectedDateTime.toLocaleDateString()} at ${selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : "⏰ Choose when you need this task completed"
                }
              </motion.p>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Label htmlFor="reward" className="flex items-center text-gray-700 font-medium">
                <motion.div
                  className="w-2 h-2 bg-yellow-600 rounded-full mr-2"
                  animate={{ scale: focusedField === 'reward' ? 1.5 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                Reward Amount ({getCurrencySymbol(currency)}) *
              </Label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <Input
                  id="reward"
                  type="number"
                  placeholder="50"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', e.target.value)}
                  onFocus={() => setFocusedField('reward')}
                  onBlur={() => setFocusedField(null)}
                  required
                  min="1"
                  className="border-2 transition-all duration-200 focus:border-yellow-500 focus:shadow-lg pl-8"
                />
                <div className="absolute left-3 top-3 text-gray-500">{getCurrencySymbol(currency)}</div>
                {formData.reward && parseInt(formData.reward) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -right-2 -top-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    💰
                  </motion.div>
                )}
              </motion.div>
              <AnimatePresence>
                {focusedField === 'reward' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-yellow-600 mt-1"
                  >
                    💝 Fair rewards get better response rates!
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="pt-4"
            >
              <AnimatedButton 
                type="submit" 
                animation="glow"
                haptic
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.div>
                      Posting Task...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="mr-2"
                      >
                        🚀
                      </motion.div>
                      Post Task to Community
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedButton>
            </motion.div>
          </form>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={0.2}>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <motion.div
                className="bg-blue-100 rounded-full p-2 mr-3"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="h-5 w-5 text-blue-600" />
              </motion.div>
              <h3 className="font-semibold text-blue-900 text-lg">💡 Pro Tips for Success</h3>
            </div>
            
            <div className="grid gap-3">
              {[
                { icon: '🎯', text: 'Be specific about what help you need', color: 'text-blue-700' },
                { icon: '💰', text: 'Offer fair compensation for the effort', color: 'text-green-700' },
                { icon: '📍', text: 'Include your exact location for easy finding', color: 'text-purple-700' },
                { icon: '⏰', text: 'Set realistic timeframes for completion', color: 'text-orange-700' },
                { icon: '📱', text: 'Keep your phone nearby for quick responses', color: 'text-pink-700' }
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 bg-white/50 rounded-lg p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + (index * 0.1), duration: 0.4 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.8)' }}
                >
                  <motion.span 
                    className="text-lg"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {tip.icon}
                  </motion.span>
                  <span className={`text-sm font-medium ${tip.color}`}>{tip.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-l-4 border-blue-500"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
            >
              <p className="text-sm text-blue-800 font-medium flex items-center">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-2"
                >
                  🎉
                </motion.span>
                Tasks with clear descriptions get 3x faster responses!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedCard>
    </div>
  )
}