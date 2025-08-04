'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnimatedButton } from '@/components/ui/animated-button'
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from '@/components/ui/animated-card'
import { TaskCardSkeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import { MapPin, Clock, IndianRupee, User, Loader2, RotateCcw, CheckCircle2, Navigation, Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { UserRatingDisplay } from '@/components/user-rating-display'
import { formatDistance } from '@/lib/geolocation'
import { useHaptics } from '@/lib/haptics'

export default function AvailableTasksPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null)
  const [recentlyAccepted, setRecentlyAccepted] = useState<string | null>(null)
  const { tasks, loadTasks, acceptTask, user } = useAppStore()
  const { success, error } = useToast()
  const { vibrate } = useHaptics()

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        console.log('Loading tasks from database...')
        await loadTasks()
        console.log('Tasks loaded:', tasks.length)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [loadTasks, tasks.length])

  const handleRefresh = async () => {
    setIsLoading(true)
    vibrate.light()
    try {
      console.log('Refreshing tasks...')
      await loadTasks()
      success('Tasks Updated! 🔄', `Found ${tasks.length} nearby tasks`)
      console.log('Tasks after refresh:', tasks.length)
    } catch (err) {
      console.error('Failed to refresh tasks:', err)
      error('Refresh Failed', 'Unable to refresh tasks. Please try again.')
      vibrate.error()
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptTask = async (taskId: string) => {
    if (!user) {
      error('Authentication Required', 'Please log in to accept tasks')
      vibrate.warning()
      return
    }
    
    setAcceptingTaskId(taskId)
    vibrate.selection()
    
    try {
      await acceptTask(taskId, user.id, user.name)
      
      // Show success feedback
      setRecentlyAccepted(taskId)
      success('Task Accepted! 🎉', 'You can now coordinate with the task poster')
      vibrate.success()
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setRecentlyAccepted(null)
      }, 3000)
      
      // Reload tasks to update the list
      await loadTasks()
    } catch (err) {
      console.error('Failed to accept task:', err)
      error('Accept Failed', 'Failed to accept task. Please try again.')
      vibrate.error()
    } finally {
      setAcceptingTaskId(null)
    }
  }

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} mins ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const formatTaskTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      const now = new Date()
      
      const isToday = date.toDateString() === now.toDateString()
      const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
      
      const timeFormat = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      
      if (isToday) {
        return `Today at ${timeFormat}`
      } else if (isTomorrow) {
        return `Tomorrow at ${timeFormat}`
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }
    } catch (_error) {
      return timeString
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">📋 Available Tasks</h1>
          <p className="text-gray-600 mt-1">Help your neighbors and earn rewards</p>
        </motion.div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={isLoading}>
      <div className="space-y-6">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Nearby Tasks</h1>
        </div>
        <p className="text-gray-600 mb-3">Help your neighbors and earn rewards</p>
        <AnimatedButton 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          animation="bounce"
          haptic={true}
          disabled={isLoading}
        >
          <RotateCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </AnimatedButton>
      </motion.div>

      {tasks.filter(task => task.poster_id !== user?.id).length === 0 ? (
        <AnimatedCard className="text-center py-12" variant="glass">
          <AnimatedCardContent>
            <motion.div 
              className="text-gray-400 mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <User className="h-16 w-16 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby tasks</h3>
            <p className="text-gray-600">No tasks found within 3km of your location. Check back later!</p>
          </AnimatedCardContent>
        </AnimatedCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.filter(task => task.poster_id !== user?.id).map((task, index) => (
              <AnimatedCard 
                key={task.id} 
                className="border-l-4 border-l-blue-500 overflow-hidden"
                variant="elevated"
                delay={index * 0.1}
                hover={true}
                pressable={false}
              >
                <AnimatedCardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                </div>
                <motion.div 
                  className="flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium ml-3 shadow-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <IndianRupee className="h-3 w-3 mr-1" />
                  ₹{task.reward}
                </motion.div>
              </div>
                </AnimatedCardHeader>
                <AnimatedCardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-600 text-sm">
                  <div className="flex items-center flex-1">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="flex-1">
                      <div className="mb-2">{task.address_details}</div>
                      {task.latitude && task.longitude && (
                        <AnimatedButton
                          onClick={() => window.open(`https://www.google.com/maps?q=${task.latitude},${task.longitude}`, '_blank')}
                          variant="outline"
                          size="sm"
                          animation="scale"
                          haptic={true}
                          className="h-7 px-2 py-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Open in Maps
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                  {task.distance !== undefined && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium">
                      <Navigation className="h-3 w-3 mr-1" />
                      {formatDistance(task.distance)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {formatTaskTime(task.time)} • Posted {formatTimeAgo(task.created_at)}
                </div>
                
                <div className="flex items-center text-gray-600 text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <UserRatingDisplay 
                    userId={task.poster_id} 
                    userName={task.poster_name}
                    size="sm"
                  />
                </div>
                
                {recentlyAccepted === task.id ? (
                  <motion.div 
                    className="mt-4 w-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-3 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    </motion.div>
                    <span className="text-green-800 font-medium">Task accepted successfully!</span>
                  </motion.div>
                ) : (
                  <AnimatedButton 
                    onClick={() => handleAcceptTask(task.id)}
                    disabled={acceptingTaskId === task.id}
                    animation="glow"
                    haptic={true}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 mt-4 text-white shadow-lg"
                    size="lg"
                  >
                    {acceptingTaskId === task.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Accept Task
                      </>
                    )}
                  </AnimatedButton>
                )}
              </div>
                </AnimatedCardContent>
              </AnimatedCard>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatedCard variant="gradient" className="p-4" delay={0.3}>
        <motion.h3 
          className="font-medium text-blue-900 mb-2 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Navigation className="h-4 w-4" />
          Location-Based Matching
        </motion.h3>
        <motion.ul 
          className="text-sm text-blue-800 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <li>• Only tasks within 3km of your location are shown</li>
          <li>• Tasks are sorted by distance (nearest first)</li>
          <li>• Distance helps you choose convenient tasks</li>
        </motion.ul>
      </AnimatedCard>
      </div>
    </PullToRefresh>
  )
}