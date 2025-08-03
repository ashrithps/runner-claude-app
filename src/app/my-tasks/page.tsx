'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Clock, IndianRupee, User, CheckCircle, PlayCircle, MessageCircle, Phone } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { WhatsAppService } from '@/lib/whatsapp'

export default function MyTasksPage() {
  const { myPostedTasks, myAcceptedTasks, completeTask, user, loadMyTasks } = useAppStore()

  useEffect(() => {
    loadMyTasks()
  }, [loadMyTasks])

  const handleMarkCompleted = (taskId: string) => {
    completeTask(taskId)
  }

  const handleContactPoster = (task: any) => {
    if (!user || !task.poster_mobile) return
    WhatsAppService.contactTaskPoster(task, user.name, task.poster_mobile)
  }

  const handleContactRunner = (task: any) => {
    if (!user || !task.runner_mobile) return
    WhatsAppService.contactTaskAccepter(task, user.name, task.runner_mobile)
  }

  const handleNotifyCompletion = (task: any) => {
    if (!task.poster_mobile) return
    WhatsAppService.notifyTaskCompletion(task, task.poster_mobile)
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
    } catch (error) {
      return timeString
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Available</span>
      case 'in_progress':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">In Progress</span>
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Completed</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">🚀 My Tasks</h1>
        <p className="text-gray-600 mt-1">Track your posted and accepted tasks</p>
      </div>

      <Tabs defaultValue="accepted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accepted">Running Tasks</TabsTrigger>
          <TabsTrigger value="posted">Posted Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {myAcceptedTasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted tasks</h3>
                <p className="text-gray-600">Start helping your community by accepting tasks!</p>
              </CardContent>
            </Card>
          ) : (
            myAcceptedTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(task.status)}
                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {task.reward}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {task.location}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatTaskTime(task.time)} • Accepted {formatTimeAgo(task.created_at)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      Task by {task.poster_name}
                    </div>

                    {task.poster_mobile && WhatsAppService.isValidPhoneNumber(task.poster_mobile) && (
                      <Button 
                        onClick={() => handleContactPoster(task)}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 mt-3"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact {task.poster_name} on WhatsApp
                      </Button>
                    )}

                    {task.status === 'in_progress' && (
                      <div className="space-y-2 mt-4">
                        <Button 
                          onClick={() => handleMarkCompleted(task.id)}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                        
                        {task.poster_mobile && (
                          <Button 
                            onClick={() => handleNotifyCompletion(task)}
                            variant="outline"
                            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                            size="sm"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Notify Completion via WhatsApp
                          </Button>
                        )}
                      </div>
                    )}

                    {task.status === 'completed' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                        <h4 className="font-medium text-green-900 mb-1">🎉 Task Completed!</h4>
                        <p className="text-sm text-green-800">
                          Contact {task.poster_name} for payment of ₹{task.reward}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="posted" className="space-y-4 mt-6">
          {myPostedTasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posted tasks</h3>
                <p className="text-gray-600">Post your first task to get help from neighbors!</p>
              </CardContent>
            </Card>
          ) : (
            myPostedTasks.map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(task.status)}
                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          {task.reward}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {task.location}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatTaskTime(task.time)} • Posted {formatTimeAgo(task.created_at)}
                    </div>
                    
                    {task.runner_name && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        Accepted by {task.runner_name}
                      </div>
                    )}

                    {task.runner_name && task.runner_mobile && WhatsAppService.isValidPhoneNumber(task.runner_mobile) && (
                      <Button 
                        onClick={() => handleContactRunner(task)}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 mt-3"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact {task.runner_name} on WhatsApp
                      </Button>
                    )}

                    {task.status === 'available' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                        <p className="text-sm text-blue-800">
                          ⏳ Waiting for someone to accept this task
                        </p>
                      </div>
                    )}

                    {task.status === 'completed' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                        <h4 className="font-medium text-green-900 mb-1">✅ Task Completed</h4>
                        <p className="text-sm text-green-800">
                          Completed by {task.runner_name}. Remember to pay the reward amount!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}