'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ReplitDB } from './replitdb'
import { NotificationService } from './notifications'

// Utility to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export interface Task {
  id: string
  title: string
  description?: string
  location: string
  time: string
  reward: number
  poster_id: string
  poster_name: string
  poster_mobile?: string
  runner_id?: string
  runner_name?: string
  runner_mobile?: string
  status: 'available' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  tower: string
  flat: string
  mobile: string
  available_for_tasks: boolean
  email_notifications: boolean
  created_at?: string
  updated_at?: string
}

interface AppState {
  user: User | null
  tasks: Task[]
  myPostedTasks: Task[]
  myAcceptedTasks: Task[]
  
  // Actions
  setUser: (user: User) => void
  clearUser: () => void
  ensureUserInDatabase: (user: User) => Promise<boolean>
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  acceptTask: (taskId: string, runnerId: string, runnerName: string) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  loadTasks: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
}

// Generate sample data
const generateSampleTasks = (): Task[] => [
  {
    id: '1',
    title: 'Help carry groceries',
    description: 'Need help carrying heavy grocery bags from car to flat',
    location: 'Tower 12, Flat 1003',
    time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    reward: 50,
    poster_id: 'user1',
    poster_name: 'Priya Sharma',
    status: 'available',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Water plants while away',
    description: 'Going out of town for 3 days, need someone to water balcony plants',
    location: 'Tower 8, Flat 405',
    time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reward: 100,
    poster_id: 'user2',
    poster_name: 'Raj Kumar',
    status: 'available',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: 'Collect parcel delivery',
    description: 'Expecting Amazon delivery, will be in office',
    location: 'Tower 5, Flat 201',
    time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    reward: 30,
    poster_id: 'user3',
    poster_name: 'Anita Desai',
    status: 'available',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      tasks: [],
      myPostedTasks: [],
      myAcceptedTasks: [],

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null, myPostedTasks: [], myAcceptedTasks: [] }),

      signOut: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
          set({ user: null, tasks: [], myPostedTasks: [], myAcceptedTasks: [] })
        } catch (error) {
          console.error('Error signing out:', error)
        }
      },

      refreshUserData: async () => {
        try {
          const response = await fetch('/api/auth/me')
          if (response.ok) {
            const { user } = await response.json()
            set({ user })
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      },

      ensureUserInDatabase: async (user: User): Promise<boolean> => {
        try {
          console.log('Ensuring user exists in Replit DB:', user)
          
          // Check if user exists
          const existingUser = await ReplitDB.getUserById(user.id)
          
          if (!existingUser) {
            // Create user if doesn't exist
            const cleanUser = {
              email: user.email,
              name: user.name,
              tower: user.tower,
              flat: user.flat,
              mobile: user.mobile,
              available_for_tasks: user.available_for_tasks,
              email_notifications: user.email_notifications
            }
            
            await ReplitDB.createUser(cleanUser)
            console.log('User created in Replit DB')
          } else {
            console.log('User already exists in Replit DB')
          }
          
          return true
        } catch (err) {
          console.error('Failed to ensure user in database:', err)
          return false
        }
      },

      addTask: async (taskData) => {
        try {
          const { ensureUserInDatabase } = get()
          
          // Ensure the poster user exists in the database
          const posterUser = get().user
          if (!posterUser) {
            console.error('No user found to create task')
            return
          }

          console.log('Ensuring user exists in database before creating task...')
          const userCreated = await ensureUserInDatabase(posterUser)
          
          if (!userCreated) {
            console.error('Failed to create user in database, cannot create task')
            return
          }

          console.log('User ensured, now creating task...')

          // Remove poster_name from the data sent to DB since it's derived
          const { poster_name, ...dbTaskData } = taskData
          
          const newTask = await ReplitDB.createTask(dbTaskData)
          
          // Get poster name for display
          const poster = await ReplitDB.getUserById(dbTaskData.poster_id)
          const taskWithNames = {
            ...newTask,
            poster_name: poster?.name || poster_name
          }
          
          set((state) => ({
            tasks: [taskWithNames, ...state.tasks],
            myPostedTasks: [...state.myPostedTasks, taskWithNames]
          }))
        } catch (err) {
          console.error('Failed to create task:', err)
        }
      },

      acceptTask: async (taskId, runnerId, runnerName) => {
        try {
          const { ensureUserInDatabase } = get()
          
          // Ensure the runner user exists in the database
          const runnerUser = get().user
          if (!runnerUser) {
            console.error('No user found to accept task')
            return
          }

          console.log('Ensuring runner user exists in database before accepting task...')
          const userCreated = await ensureUserInDatabase(runnerUser)
          
          if (!userCreated) {
            console.error('Failed to create runner user in database, cannot accept task')
            return
          }

          console.log('Runner user ensured, now accepting task...')

          const updatedTask = await ReplitDB.updateTask(taskId, {
            status: 'in_progress',
            runner_id: runnerId
          })

          if (!updatedTask) {
            console.error('Task not found or failed to update')
            return
          }

          // Get user details for display
          const poster = await ReplitDB.getUserById(updatedTask.poster_id)
          const runner = await ReplitDB.getUserById(runnerId)

          const taskWithNames = {
            ...updatedTask,
            poster_name: poster?.name || '',
            poster_mobile: poster?.mobile || '',
            runner_name: runner?.name || runnerName,
            runner_mobile: runner?.mobile || ''
          }

          // Send notification to task poster
          if (poster?.email && poster.email_notifications) {
            NotificationService.notifyTaskAssigned(
              taskWithNames,
              poster.email,
              runnerName
            ).catch(error => console.error('Failed to send task assigned notification:', error))
          }

          set((state) => {
            const task = state.tasks.find(t => t.id === taskId)
            if (!task) return state

            return {
              tasks: state.tasks.filter(t => t.id !== taskId),
              myAcceptedTasks: [...state.myAcceptedTasks, taskWithNames],
              myPostedTasks: state.myPostedTasks.map(t => 
                t.id === taskId ? taskWithNames : t
              )
            }
          })
        } catch (err) {
          console.error('Failed to accept task:', err)
        }
      },

      completeTask: async (taskId) => {
        try {
          const updatedTask = await ReplitDB.updateTask(taskId, { status: 'completed' })

          if (!updatedTask) {
            console.error('Task not found or failed to update')
            return
          }

          // Get user details for display and notifications
          const poster = await ReplitDB.getUserById(updatedTask.poster_id)
          const runner = updatedTask.runner_id ? await ReplitDB.getUserById(updatedTask.runner_id) : null

          const taskWithNames = {
            ...updatedTask,
            poster_name: poster?.name || '',
            poster_mobile: poster?.mobile || '',
            runner_name: runner?.name || '',
            runner_mobile: runner?.mobile || ''
          }

          // Send notification to task poster
          if (poster?.email && poster.email_notifications) {
            NotificationService.notifyTaskCompleted(
              taskWithNames,
              poster.email,
              runner?.name || 'Anonymous'
            ).catch(error => console.error('Failed to send task completed notification:', error))
          }

          set((state) => ({
            myAcceptedTasks: state.myAcceptedTasks.map(task =>
              task.id === taskId
                ? { ...taskWithNames, status: 'completed' as const }
                : task
            ),
            myPostedTasks: state.myPostedTasks.map(task =>
              task.id === taskId
                ? { ...taskWithNames, status: 'completed' as const }
                : task
            )
          }))
        } catch (err) {
          console.error('Failed to complete task:', err)
        }
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, status, updated_at: new Date().toISOString() }
              : task
          ),
          myPostedTasks: state.myPostedTasks.map(task =>
            task.id === taskId
              ? { ...task, status, updated_at: new Date().toISOString() }
              : task
          ),
          myAcceptedTasks: state.myAcceptedTasks.map(task =>
            task.id === taskId
              ? { ...task, status, updated_at: new Date().toISOString() }
              : task
          )
        }))
      },

      loadTasks: async () => {
        try {
          const availableTasks = await ReplitDB.getTasksByStatus('available')
          
          // Get poster names for each task
          const tasksWithNames = await Promise.all(
            availableTasks.map(async (task) => {
              const poster = await ReplitDB.getUserById(task.poster_id)
              return {
                ...task,
                poster_name: poster?.name || 'Unknown User'
              }
            })
          )

          // Sort by created_at descending
          tasksWithNames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

          set({ tasks: tasksWithNames })
        } catch (err) {
          console.error('Failed to load tasks:', err)
          // Fallback to sample data
          const { tasks } = get()
          if (tasks.length === 0) {
            set({ tasks: generateSampleTasks() })
          }
        }
      }
    }),
    {
      name: 'runner-app-storage',
      partialize: (state) => ({
        user: state.user,
        myPostedTasks: state.myPostedTasks,
        myAcceptedTasks: state.myAcceptedTasks
      }),
      onRehydrateStorage: () => (state) => {
        // Validate and clean up any invalid UUIDs from old data
        if (state?.user && !isValidUUID(state.user.id)) {
          console.log('Clearing invalid user ID from storage:', state.user.id)
          state.user = null
        }
        
        // Clean up tasks with invalid poster/runner IDs
        if (state?.myPostedTasks) {
          state.myPostedTasks = state.myPostedTasks.filter(task => 
            isValidUUID(task.poster_id) && (!task.runner_id || isValidUUID(task.runner_id))
          )
        }
        
        if (state?.myAcceptedTasks) {
          state.myAcceptedTasks = state.myAcceptedTasks.filter(task => 
            isValidUUID(task.poster_id) && (!task.runner_id || isValidUUID(task.runner_id))
          )
        }
        
        console.log('Storage rehydrated and cleaned')
      }
    }
  )
)