'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { filterTasksByRadius, sortTasksByDistance } from './geolocation'
import { detectCurrencyFromLocation, type CurrencyInfo, FALLBACK_CURRENCY } from './currency'

// Utility to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export interface Task {
  id: string
  title: string
  description?: string
  latitude: number
  longitude: number
  address_details: string
  time: string
  reward: number
  upi_id?: string
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

export interface Rating {
  id: string
  task_id: string
  rater_id: string
  rated_id: string
  rating: number // 1-5 stars
  feedback?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string
  latitude: number
  longitude: number
  address_details: string
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
  currency: CurrencyInfo
  currencyLoading: boolean
  
  // Actions
  setUser: (user: User) => void
  clearUser: () => void
  initializeCurrency: () => Promise<void>
  setCurrency: (currency: CurrencyInfo) => void
  ensureUserInDatabase: (user: User) => Promise<boolean>
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  acceptTask: (taskId: string, runnerId: string, runnerName: string) => Promise<void>
  completeTask: (taskId: string) => Promise<void>
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  loadTasks: () => Promise<void>
  loadMyTasks: () => Promise<void>
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void>
  
  // Computed values for task counts
  getTaskCounts: () => {
    availableTasks: number
    myInProgressTasks: number
    myPendingPostedTasks: number
    totalActiveMyTasks: number
  }
}

// Generate sample data with GPS coordinates
const generateSampleTasks = (): Task[] => [
  {
    id: '1',
    title: 'Help carry groceries',
    description: 'Need help carrying heavy grocery bags from car to flat',
    latitude: 12.9716,
    longitude: 77.5946,
    address_details: 'Tower 12, Flat 1003, 2nd Floor',
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
    latitude: 12.9720,
    longitude: 77.5950,
    address_details: 'Tower 8, Flat 405, 4th Floor',
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
    latitude: 12.9710,
    longitude: 77.5940,
    address_details: 'Tower 5, Flat 201, Ground Floor',
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
      currency: FALLBACK_CURRENCY,
      currencyLoading: false,

      setUser: (user) => {
        set({ user })
        // Initialize currency when user is set
        get().initializeCurrency()
      },

      clearUser: () => set({ user: null, myPostedTasks: [], myAcceptedTasks: [] }),

      initializeCurrency: async () => {
        const state = get()
        if (state.currencyLoading) return

        set({ currencyLoading: true })
        
        try {
          const user = state.user
          const currency = await detectCurrencyFromLocation(user?.latitude, user?.longitude)
          set({ currency, currencyLoading: false })
        } catch (error) {
          console.error('Failed to detect currency:', error)
          set({ currency: FALLBACK_CURRENCY, currencyLoading: false })
        }
      },

      setCurrency: (currency) => set({ currency }),

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

      ensureUserInDatabase: async (_user: User): Promise<boolean> => {
        try {
          // This will be handled by API routes on the server side
          console.log('User management handled by server-side API routes')
          return true
        } catch (err) {
          console.error('Failed to ensure user in database:', err)
          return false
        }
      },

      addTask: async (taskData) => {
        try {
          const posterUser = get().user
          if (!posterUser) {
            console.error('No user found to create task')
            return
          }

          console.log('Creating task via API...')

          // Remove poster_name from the data sent to API since it's derived
          const { poster_name: _, ...dbTaskData } = taskData
          
          // Call API to create task
          const response = await fetch('/api/tasks/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dbTaskData),
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to create task:', error)
            return
          }

          const { task: newTask } = await response.json()
          const taskWithNames = {
            ...newTask,
            poster_name: posterUser.name
          }
          
          set((state) => ({
            tasks: [taskWithNames, ...state.tasks],
            myPostedTasks: [...state.myPostedTasks, taskWithNames]
          }))
        } catch (err) {
          console.error('Failed to create task:', err)
        }
      },

      deleteTask: async (taskId) => {
        try {
          console.log('Deleting task via API...')

          const response = await fetch('/api/tasks/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId }),
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to delete task:', error)
            return
          }

          // Remove task from all relevant arrays
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== taskId),
            myPostedTasks: state.myPostedTasks.filter(t => t.id !== taskId),
            myAcceptedTasks: state.myAcceptedTasks.filter(t => t.id !== taskId)
          }))
        } catch (err) {
          console.error('Failed to delete task:', err)
        }
      },

      acceptTask: async (taskId, runnerId, runnerName) => {
        try {
          console.log('Accepting task via API...')

          const response = await fetch('/api/tasks/accept', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId, runnerId, runnerName }),
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to accept task:', error)
            return
          }

          const { task: updatedTask } = await response.json()

          set((state) => {
            const task = state.tasks.find(t => t.id === taskId)
            if (!task) return state

            return {
              tasks: state.tasks.filter(t => t.id !== taskId),
              myAcceptedTasks: [...state.myAcceptedTasks, updatedTask],
              myPostedTasks: state.myPostedTasks.map(t => 
                t.id === taskId ? updatedTask : t
              )
            }
          })

          // Refresh my tasks to get updated status
          await get().loadMyTasks()
        } catch (err) {
          console.error('Failed to accept task:', err)
        }
      },

      completeTask: async (taskId) => {
        try {
          console.log('Completing task via API...')

          const response = await fetch('/api/tasks/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId }),
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('Failed to complete task:', error)
            return
          }

          const { task: updatedTask } = await response.json()

          set((state) => ({
            myAcceptedTasks: state.myAcceptedTasks.map(task =>
              task.id === taskId
                ? { ...updatedTask, status: 'completed' as const }
                : task
            ),
            myPostedTasks: state.myPostedTasks.map(task =>
              task.id === taskId
                ? { ...updatedTask, status: 'completed' as const }
                : task
            )
          }))

          // Refresh my tasks to get updated status
          await get().loadMyTasks()
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
          const response = await fetch('/api/tasks/available')
          
          if (!response.ok) {
            console.error('Failed to load tasks')
            // Fallback to sample data with location filtering
            const { tasks, user } = get()
            if (tasks.length === 0) {
              const sampleTasks = generateSampleTasks()
              if (user?.latitude && user?.longitude) {
                const nearbyTasks = filterTasksByRadius(user.latitude, user.longitude, sampleTasks, 3)
                const sortedTasks = sortTasksByDistance(user.latitude, user.longitude, nearbyTasks)
                set({ tasks: sortedTasks })
              } else {
                set({ tasks: sampleTasks })
              }
            }
            return
          }

          const { tasks: allTasks } = await response.json()
          const { user } = get()
          
          // Apply 3km radius filter if user has location
          if (user?.latitude && user?.longitude) {
            const nearbyTasks = filterTasksByRadius(user.latitude, user.longitude, allTasks, 3)
            const sortedTasks = sortTasksByDistance(user.latitude, user.longitude, nearbyTasks)
            set({ tasks: sortedTasks })
          } else {
            // No user location available, show all tasks
            set({ tasks: allTasks })
          }
        } catch (err) {
          console.error('Failed to load tasks:', err)
          // Fallback to sample data with location filtering
          const { tasks, user } = get()
          if (tasks.length === 0) {
            const sampleTasks = generateSampleTasks()
            if (user?.latitude && user?.longitude) {
              const nearbyTasks = filterTasksByRadius(user.latitude, user.longitude, sampleTasks, 3)
              const sortedTasks = sortTasksByDistance(user.latitude, user.longitude, nearbyTasks)
              set({ tasks: sortedTasks })
            } else {
              set({ tasks: sampleTasks })
            }
          }
        }
      },

      loadMyTasks: async () => {
        try {
          const [postedResponse, acceptedResponse] = await Promise.all([
            fetch('/api/tasks/my-posted'),
            fetch('/api/tasks/my-accepted')
          ])

          if (postedResponse.ok) {
            const { tasks: postedTasks } = await postedResponse.json()
            set((state) => ({ ...state, myPostedTasks: postedTasks }))
          }

          if (acceptedResponse.ok) {
            const { tasks: acceptedTasks } = await acceptedResponse.json()
            set((state) => ({ ...state, myAcceptedTasks: acceptedTasks }))
          }
        } catch (err) {
          console.error('Failed to load my tasks:', err)
        }
      },

      getTaskCounts: () => {
        const state = get()
        
        const availableTasks = state.tasks.filter(task => task.status === 'available').length
        
        const myInProgressTasks = state.myAcceptedTasks.filter(task => task.status === 'in_progress').length
        
        const myPendingPostedTasks = state.myPostedTasks.filter(task => 
          task.status === 'available' || task.status === 'in_progress'
        ).length
        
        const totalActiveMyTasks = myInProgressTasks + myPendingPostedTasks
        
        return {
          availableTasks,
          myInProgressTasks,
          myPendingPostedTasks,
          totalActiveMyTasks
        }
      }
    }),
    {
      name: 'runner-app-storage',
      partialize: (state) => ({
        user: state.user,
        myPostedTasks: state.myPostedTasks,
        myAcceptedTasks: state.myAcceptedTasks,
        currency: state.currency
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