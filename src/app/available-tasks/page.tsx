'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, Clock, IndianRupee, User, Loader2, RotateCcw, CheckCircle2, Navigation } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { UserRatingDisplay } from '@/components/user-rating-display'
import { formatDistance } from '@/lib/geolocation'

export default function AvailableTasksPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null)
  const [recentlyAccepted, setRecentlyAccepted] = useState<string | null>(null)
  const { tasks, loadTasks, acceptTask, user } = useAppStore()

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
    try {
      console.log('Refreshing tasks...')
      await loadTasks()
      console.log('Tasks after refresh:', tasks.length)
    } catch (error) {
      console.error('Failed to refresh tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptTask = async (taskId: string) => {
    if (!user) {
      alert('Please log in to accept tasks')
      return
    }
    
    setAcceptingTaskId(taskId)
    
    try {
      await acceptTask(taskId, user.id, user.name)
      
      // Show success feedback
      setRecentlyAccepted(taskId)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setRecentlyAccepted(null)
      }, 3000)
      
      // Reload tasks to update the list
      await loadTasks()
    } catch (error) {
      console.error('Failed to accept task:', error)
      alert('Failed to accept task. Please try again.')
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">📋 Available Tasks</h1>
          <p className="text-gray-600 mt-1">Help your neighbors and earn rewards</p>
        </div>
        <Card className="text-center py-12">
          <CardContent>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading available tasks...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📋 Nearby Tasks</h1>
        <p className="text-gray-600 mt-1">Tasks within 3km of your location</p>
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {tasks.filter(task => task.poster_id !== user?.id).length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <User className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No nearby tasks</h3>
            <p className="text-gray-600">No tasks found within 3km of your location. Check back later!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.filter(task => task.poster_id !== user?.id).map((task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                </div>
                <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium ml-3">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {task.reward}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-600 text-sm">
                  <div className="flex items-center flex-1">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <div className="flex-1">
                      <div>{task.address_details}</div>
                      {task.latitude && task.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline mt-1 inline-block"
                        >
                          📍 View on Google Maps
                        </a>
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
                  <div className="mt-4 w-full bg-green-100 border border-green-300 rounded-lg p-3 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Task accepted successfully!</span>
                  </div>
                ) : (
                  <Button 
                    onClick={() => handleAcceptTask(task.id)}
                    disabled={acceptingTaskId === task.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {acceptingTaskId === task.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Task'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📍 Location-Based Matching</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Only tasks within 3km of your location are shown</li>
          <li>• Tasks are sorted by distance (nearest first)</li>
          <li>• Distance helps you choose convenient tasks</li>
        </ul>
      </div>
    </div>
  )
}