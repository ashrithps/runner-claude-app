'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { User, MapPin, Phone, Edit, Save, Mail, LogOut, Bell } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createDefaultUser } from '@/lib/utils'

const DEFAULT_PROFILE = createDefaultUser()

export default function ProfilePage() {
  const { user, setUser, myPostedTasks, myAcceptedTasks, signOut } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const [editedProfile, setEditedProfile] = useState(user || DEFAULT_PROFILE)

  useEffect(() => {
    if (!user) {
      const newUser = createDefaultUser()
      setUser(newUser)
    } else {
      setEditedProfile(user)
    }
  }, [user, setUser])

  const handleSave = () => {
    if (user) {
      const updatedUser = { ...user, ...editedProfile }
      setUser(updatedUser)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(user || DEFAULT_PROFILE)
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">👤 Profile</h1>
        <p className="text-gray-600 mt-1">Manage your community details</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              <span>{user?.email || DEFAULT_PROFILE.email}</span>
            </div>
            <p className="text-xs text-gray-500">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={editedProfile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="h-4 w-4 mr-3 text-gray-400" />
                <span>{user?.name || DEFAULT_PROFILE.name}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tower">Tower</Label>
              {isEditing ? (
                <Input
                  id="tower"
                  value={editedProfile.tower}
                  onChange={(e) => handleInputChange('tower', e.target.value)}
                  placeholder="e.g., Tower 12"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{user?.tower || DEFAULT_PROFILE.tower}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="flat">Flat</Label>
              {isEditing ? (
                <Input
                  id="flat"
                  value={editedProfile.flat}
                  onChange={(e) => handleInputChange('flat', e.target.value)}
                  placeholder="e.g., Flat 1003"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <span>{user?.flat || DEFAULT_PROFILE.flat}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            {isEditing ? (
              <Input
                id="mobile"
                value={editedProfile.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="+91 98765 43210"
              />
            ) : (
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span>{user?.mobile || DEFAULT_PROFILE.mobile}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Available for Tasks</Label>
              <p className="text-sm text-gray-600">
                Let others know you can help with community tasks
              </p>
            </div>
            <Switch
              checked={isEditing ? editedProfile.available_for_tasks : (user?.available_for_tasks ?? DEFAULT_PROFILE.available_for_tasks)}
              onCheckedChange={(checked) => 
                isEditing 
                  ? handleInputChange('available_for_tasks', checked)
                  : user && setUser({ ...user, available_for_tasks: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive email updates about your tasks
              </p>
            </div>
            <Switch
              checked={isEditing ? editedProfile.email_notifications : (user?.email_notifications ?? DEFAULT_PROFILE.email_notifications)}
              onCheckedChange={(checked) => 
                isEditing 
                  ? handleInputChange('email_notifications', checked)
                  : user && setUser({ ...user, email_notifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{myPostedTasks.length}</div>
              <div className="text-sm text-blue-800">Tasks Posted</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {myAcceptedTasks.filter(task => task.status === 'completed').length}
              </div>
              <div className="text-sm text-green-800">Tasks Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-medium text-orange-900 mb-2">🌟 Community Guidelines</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Be respectful and courteous to all neighbors</li>
          <li>• Complete tasks as promised and on time</li>
          <li>• Communicate clearly about availability and expectations</li>
          <li>• Report any issues to community management</li>
        </ul>
      </div>
    </div>
  )
}