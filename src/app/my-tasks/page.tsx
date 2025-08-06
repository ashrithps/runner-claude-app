'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MapPin, Clock, Coins, User, CheckCircle, PlayCircle, MessageCircle, Phone, Trash2, Archive } from 'lucide-react'
import { useAppStore, Task } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'
import { WhatsAppService } from '@/lib/whatsapp'
import { TaskRating } from '@/components/rating-system'
import { UserRatingDisplay } from '@/components/user-rating-display'
import { useToast } from '@/components/ui/toast'

export default function MyTasksPage() {
  const { myPostedTasks, myAcceptedTasks, completeTask, deleteTask, markAsPaid, user, loadMyTasks, currency } = useAppStore()
  const { showToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  useEffect(() => {
    loadMyTasks()
  }, [loadMyTasks])

  const handleMarkCompleted = (taskId: string) => {
    completeTask(taskId)
  }

  const handleMarkAsPaid = async (taskId: string) => {
    try {
      await markAsPaid(taskId)
      showToast('Task marked as paid and archived!', 'success')
    } catch (error) {
      showToast('Failed to mark task as paid', 'error')
    }
  }

  const handleContactPoster = (task: Task) => {
    if (!user || !task.poster_mobile) return
    WhatsAppService.contactTaskPoster(task, user.name, task.poster_mobile, currency)
  }

  const handleContactRunner = (task: Task) => {
    if (!user || !task.runner_mobile) return
    WhatsAppService.contactTaskAccepter(task, user.name, task.runner_mobile)
  }

  const handleNotifyCompletion = (task: Task) => {
    if (!task.poster_mobile) return
    WhatsAppService.notifyTaskCompletion(task, task.poster_mobile, currency)
  }

  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return
    
    console.log('Attempting to delete task:', taskToDelete.id)
    try {
      await deleteTask(taskToDelete.id)
      console.log('Task deleted successfully')
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
      // Refresh the tasks to see the updated list
      await loadMyTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTaskToDelete(null)
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

  const getStatusBadge = (status: string, isPaid?: boolean) => {
    if (isPaid) {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Paid & Archived</span>
    }
    
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accepted">Running Tasks</TabsTrigger>
          <TabsTrigger value="posted">Posted Tasks</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {myAcceptedTasks.filter(task => !task.is_paid).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accepted tasks</h3>
                <p className="text-gray-600">Start helping your community by accepting tasks!</p>
              </CardContent>
            </Card>
          ) : (
            myAcceptedTasks.filter(task => !task.is_paid).map((task) => (
              <Card key={task.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(task.status, task.is_paid)}
                        <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          <Coins className="h-3 w-3 mr-1" />
                          {formatCurrency(task.reward, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="flex-1">
                        <div className="mb-2">{task.address_details}</div>
                        {task.latitude && task.longitude && (
                          <Button
                            onClick={() => window.open(`https://www.google.com/maps?q=${task.latitude},${task.longitude}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Open in Maps
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatTaskTime(task.time)} • Accepted {formatTimeAgo(task.created_at)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      Task by <UserRatingDisplay 
                        userId={task.poster_id} 
                        userName={task.poster_name}
                        size="sm"
                        className="ml-1"
                      />
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
                          Contact {task.poster_name} for payment of {formatCurrency(task.reward, currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {task.status === 'completed' && (
                  <div className="p-4 border-t">
                    <TaskRating task={task} />
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="posted" className="space-y-4 mt-6">
          {myPostedTasks.filter(task => !task.is_paid).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posted tasks</h3>
                <p className="text-gray-600">Post your first task to get help from neighbors!</p>
              </CardContent>
            </Card>
          ) : (
            myPostedTasks.filter(task => !task.is_paid).map((task) => (
              <Card key={task.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(task.status, task.is_paid)}
                        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          <Coins className="h-3 w-3 mr-1" />
                          {formatCurrency(task.reward, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="flex-1">
                        <div className="mb-2">{task.address_details}</div>
                        {task.latitude && task.longitude && (
                          <Button
                            onClick={() => window.open(`https://www.google.com/maps?q=${task.latitude},${task.longitude}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Open in Maps
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatTaskTime(task.time)} • Posted {formatTimeAgo(task.created_at)}
                    </div>
                    
                    {task.runner_name && task.runner_id && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        Accepted by <UserRatingDisplay 
                          userId={task.runner_id} 
                          userName={task.runner_name}
                          size="sm"
                          className="ml-1"
                        />
                      </div>
                    )}

                    {task.runner_name && task.runner_mobile && WhatsAppService.isValidPhoneNumber(task.runner_mobile) && task.status !== 'completed' && (
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

                    {/* Show runner's phone number when task is completed for payment */}
                    {task.status === 'completed' && task.runner_name && task.runner_mobile && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-3">
                        <h4 className="font-medium text-green-900 mb-2">💰 Task Completed - Payment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-green-800">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{task.runner_name}</span>
                          </div>
                          <div className="flex items-center text-green-800">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="font-mono">{task.runner_mobile}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(task.runner_mobile)}
                              className="ml-2 text-green-600 hover:text-green-800 underline text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="flex items-center text-green-800">
                            <Coins className="h-4 w-4 mr-2" />
                            <span>Pay {formatCurrency(task.reward, currency)} via mobile payment apps</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {task.status === 'available' && (
                      <div className="space-y-3 mt-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            ⏳ Waiting for someone to accept this task
                          </p>
                        </div>
                        <Button 
                          onClick={() => openDeleteDialog(task)}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Task
                        </Button>
                      </div>
                    )}

                    {task.status === 'completed' && (
                      <div className="space-y-3 mt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="font-medium text-green-900 mb-1">✅ Task Completed</h4>
                          <p className="text-sm text-green-800">
                            Completed by {task.runner_name}. Remember to pay the reward amount!
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleMarkAsPaid(task.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          size="lg"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {task.status === 'completed' && (
                  <div className="p-4 border-t">
                    <TaskRating task={task} />
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          {[...myPostedTasks, ...myAcceptedTasks].filter(task => task.is_paid).length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Archive className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No archived tasks</h3>
                <p className="text-gray-600">Completed and paid tasks will appear here</p>
              </CardContent>
            </Card>
          ) : (
            [...myPostedTasks, ...myAcceptedTasks]
              .filter(task => task.is_paid)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
              .map((task) => (
              <Card key={task.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(task.status, task.is_paid)}
                        <div className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                          <Coins className="h-3 w-3 mr-1" />
                          {formatCurrency(task.reward, currency)}
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {task.poster_id === user?.id ? 'Posted by me' : 'Completed by me'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="flex-1">
                        <div className="mb-2">{task.address_details}</div>
                        {task.latitude && task.longitude && (
                          <Button
                            onClick={() => window.open(`https://www.google.com/maps?q=${task.latitude},${task.longitude}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 py-1 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Open in Maps
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Archived {formatTimeAgo(task.updated_at)} • Originally for {formatTaskTime(task.time)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {task.poster_id === user?.id ? (
                        <span>Completed by <UserRatingDisplay 
                          userId={task.runner_id || ''} 
                          userName={task.runner_name || 'Unknown'}
                          size="sm"
                          className="ml-1"
                        /></span>
                      ) : (
                        <span>Task by <UserRatingDisplay 
                          userId={task.poster_id} 
                          userName={task.poster_name}
                          size="sm"
                          className="ml-1"
                        /></span>
                      )}
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                      <h4 className="font-medium text-purple-900 mb-1">💰 Payment Completed</h4>
                      <p className="text-sm text-purple-800">
                        This task has been completed and payment has been confirmed. 
                        {task.poster_id === user?.id ? ' Thank you for using our community!' : ' Great job helping your neighbor!'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{taskToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}