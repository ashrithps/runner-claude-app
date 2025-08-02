'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DatePicker from 'react-datepicker'
import { useAppStore } from '@/lib/store'
import { createDefaultUser } from '@/lib/utils'
import "react-datepicker/dist/react-datepicker.css"

export default function PostTaskPage() {
  const router = useRouter()
  const { addTask, user, setUser } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    reward: ''
  })
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      // Create a default user if none exists
      const defaultUser = createDefaultUser()
      setUser(defaultUser)
    }

    const currentUser = user || createDefaultUser()

    if (!selectedDateTime) {
      alert('Please select a date and time for the task')
      return
    }

    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      location: formData.location,
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
      location: '',
      reward: ''
    })
    setSelectedDateTime(null)

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

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Tower 12, Flat 1003"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="datetime">When needed? *</Label>
              <div className="relative">
                <DatePicker
                  selected={selectedDateTime}
                  onChange={(date: Date | null) => setSelectedDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  placeholderText="Select date and time"
                  minDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                Choose the exact date and time when you need this task completed
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