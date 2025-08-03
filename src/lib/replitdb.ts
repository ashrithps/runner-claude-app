import { v4 as uuidv4 } from 'uuid'

// Interface for Replit database
interface ReplitDBInterface {
  set(key: string, value: unknown): Promise<void>
  get(key: string): Promise<unknown>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
  keys(): IterableIterator<string>
}

// Replit Database implementation
// This uses Replit's built-in database service
class ReplitDatabase {
  private db: ReplitDBInterface | Map<string, unknown> | null = null

  constructor() {
    // Initialize Replit database
    if (typeof window === 'undefined') {
      // Server-side only
      this.initDatabase()
    }
  }

  private async initDatabase() {
    try {
      // Replit provides a global database object
      if (typeof globalThis !== 'undefined' && (globalThis as { Database?: new () => ReplitDBInterface }).Database) {
        this.db = new (globalThis as { Database: new () => ReplitDBInterface }).Database()
      } else {
        // Fallback to in-memory storage for development
        console.warn('Replit Database not available, using in-memory storage')
        this.db = new Map()
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
      this.db = new Map()
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.initDatabase()
    
    try {
      if (this.db.set) {
        await this.db.set(key, JSON.stringify(value))
      } else {
        this.db.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error('Database set error:', error)
    }
  }

  async get(key: string): Promise<unknown> {
    if (!this.db) await this.initDatabase()
    
    try {
      let value
      if (this.db.get) {
        value = await this.db.get(key)
      } else {
        value = this.db.get(key)
      }
      
      if (value) {
        return JSON.parse(value)
      }
      return null
    } catch (error) {
      console.error('Database get error:', error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.initDatabase()
    
    try {
      if (this.db.delete) {
        await this.db.delete(key)
      } else {
        this.db.delete(key)
      }
    } catch (error) {
      console.error('Database delete error:', error)
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (!this.db) await this.initDatabase()
    
    try {
      let keys
      if (this.db.list) {
        keys = await this.db.list(prefix || '')
      } else {
        // Fallback for in-memory storage
        keys = Array.from(this.db.keys())
        if (prefix) {
          keys = keys.filter((key: string) => key.startsWith(prefix))
        }
      }
      return keys || []
    } catch (error) {
      console.error('Database list error:', error)
      return []
    }
  }

  async clear(): Promise<void> {
    if (!this.db) await this.initDatabase()
    
    try {
      if (this.db.empty) {
        await this.db.empty()
      } else {
        this.db.clear()
      }
    } catch (error) {
      console.error('Database clear error:', error)
    }
  }
}

// Initialize database instance
export const db = new ReplitDatabase()

// Types (same as before but for our new database)
export type Task = {
  id: string
  title: string
  description?: string
  location: string
  time: string
  reward: number
  upi_id?: string
  poster_id: string
  runner_id?: string
  status: 'available' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
  poster_name?: string
  runner_name?: string
}

export type User = {
  id: string
  email: string
  name: string
  tower: string
  flat: string
  mobile: string
  available_for_tasks: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export type Notification = {
  id: string
  user_id: string
  task_id: string
  type: 'task_assigned' | 'task_completed' | 'task_cancelled'
  title: string
  message: string
  read: boolean
  sent_via_email: boolean
  created_at: string
}

export type OTPSession = {
  id: string
  email: string
  otp: string
  expires_at: string
  verified: boolean
  created_at: string
}

// Database helper functions
export class ReplitDB {
  // Users
  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newUser: User = {
      ...user,
      id,
      created_at: now,
      updated_at: now
    }
    
    await db.set(`user:${id}`, newUser)
    await db.set(`user_email:${user.email}`, id) // Index for email lookup
    
    return newUser
  }

  static async getUserById(id: string): Promise<User | null> {
    const user = await db.get(`user:${id}`)
    return user as User | null
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const userId = await db.get(`user_email:${email}`)
    if (!userId) return null
    return this.getUserById(userId as string)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const existingUser = await this.getUserById(id)
    if (!existingUser) return null

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updated_at: new Date().toISOString()
    }

    await db.set(`user:${id}`, updatedUser)
    return updatedUser
  }

  static async getAllUsers(): Promise<User[]> {
    const keys = await db.list('user:')
    const users: User[] = []
    
    for (const key of keys) {
      if (typeof key === 'string' && key.startsWith('user:') && !key.includes('_email:')) {
        const user = await db.get(key)
        if (user) users.push(user as User)
      }
    }
    
    return users
  }

  // Tasks
  static async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newTask: Task = {
      ...task,
      id,
      created_at: now,
      updated_at: now
    }
    
    await db.set(`task:${id}`, newTask)
    
    return newTask
  }

  static async getTaskById(id: string): Promise<Task | null> {
    const task = await db.get(`task:${id}`)
    return task as Task | null
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const existingTask = await this.getTaskById(id)
    if (!existingTask) return null

    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      updated_at: new Date().toISOString()
    }

    await db.set(`task:${id}`, updatedTask)
    return updatedTask
  }

  static async getAllTasks(): Promise<Task[]> {
    const keys = await db.list('task:')
    const tasks: Task[] = []
    
    for (const key of keys) {
      if (typeof key === 'string') {
        const task = await db.get(key)
        if (task) tasks.push(task as Task)
      }
    }
    
    return tasks
  }

  static async getTasksByStatus(status: Task['status']): Promise<Task[]> {
    const allTasks = await this.getAllTasks()
    return allTasks.filter(task => task.status === status)
  }

  static async getTasksByPosterId(posterId: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks()
    return allTasks.filter(task => task.poster_id === posterId)
  }

  static async getTasksByRunnerId(runnerId: string): Promise<Task[]> {
    const allTasks = await this.getAllTasks()
    return allTasks.filter(task => task.runner_id === runnerId)
  }

  // OTP Sessions
  static async createOTPSession(email: string, otp: string, expiresInMinutes: number = 10): Promise<OTPSession> {
    const id = uuidv4()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000)
    
    const session: OTPSession = {
      id,
      email,
      otp,
      expires_at: expiresAt.toISOString(),
      verified: false,
      created_at: now.toISOString()
    }
    
    await db.set(`otp:${email}`, session) // Store by email for easy lookup
    
    return session
  }

  static async getOTPSession(email: string): Promise<OTPSession | null> {
    const session = await db.get(`otp:${email}`)
    return session as OTPSession | null
  }

  static async verifyOTP(email: string, otp: string): Promise<boolean> {
    const session = await this.getOTPSession(email)
    if (!session) return false
    
    const now = new Date()
    const expiresAt = new Date(session.expires_at)
    
    if (now > expiresAt) {
      // Session expired, clean it up
      await db.delete(`otp:${email}`)
      return false
    }
    
    if (session.otp !== otp) return false
    
    // Mark as verified
    session.verified = true
    await db.set(`otp:${email}`, session)
    
    return true
  }

  static async deleteOTPSession(email: string): Promise<void> {
    await db.delete(`otp:${email}`)
  }

  // Notifications
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const id = uuidv4()
    const now = new Date().toISOString()
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: now
    }
    
    await db.set(`notification:${id}`, newNotification)
    
    return newNotification
  }

  static async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const keys = await db.list('notification:')
    const notifications: Notification[] = []
    
    for (const key of keys) {
      if (typeof key === 'string') {
        const notification = await db.get(key)
        if (notification && (notification as Notification).user_id === userId) {
          notifications.push(notification as Notification)
        }
      }
    }
    
    return notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = await db.get(`notification:${id}`)
    if (!notification) return false
    
    const updatedNotification = { ...notification as Notification, read: true }
    await db.set(`notification:${id}`, updatedNotification)
    
    return true
  }

  // Utility functions
  static async clearAllData(): Promise<void> {
    const keys = await db.list()
    for (const key of keys) {
      if (typeof key === 'string') {
        await db.delete(key)
      }
    }
  }

  static async getStats(): Promise<{
    users: number
    tasks: number
    notifications: number
    otpSessions: number
  }> {
    const keys = await db.list()
    
    return {
      users: keys.filter(key => typeof key === 'string' && key.startsWith('user:') && !key.includes('_email:')).length,
      tasks: keys.filter(key => typeof key === 'string' && key.startsWith('task:')).length,
      notifications: keys.filter(key => typeof key === 'string' && key.startsWith('notification:')).length,
      otpSessions: keys.filter(key => typeof key === 'string' && key.startsWith('otp:')).length
    }
  }

  // Load initial sample data for demo
  static async loadSampleData(): Promise<void> {
    try {
      // Check if we already have data
      const existingUsers = await this.getAllUsers()
      if (existingUsers.length > 0) return

      console.log('Loading sample data...')
      
      // Create sample users
      const sampleUsers = [
        {
          email: 'priya@example.com',
          name: 'Priya Sharma',
          tower: 'Tower 12',
          flat: 'Flat 1003',
          mobile: '+91 98765 43210',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          email: 'raj@example.com',
          name: 'Raj Kumar',
          tower: 'Tower 8',
          flat: 'Flat 405',
          mobile: '+91 98765 43211',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          email: 'anita@example.com',
          name: 'Anita Desai',
          tower: 'Tower 5',
          flat: 'Flat 201',
          mobile: '+91 98765 43212',
          available_for_tasks: true,
          email_notifications: true
        }
      ]

      const createdUsers = []
      for (const userData of sampleUsers) {
        const user = await this.createUser(userData)
        createdUsers.push(user)
      }

      // Create sample tasks
      const sampleTasks = [
        {
          title: 'Help carry groceries',
          description: 'Need help carrying heavy grocery bags from car to flat',
          location: 'Tower 12, Flat 1003',
          time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reward: 50,
          poster_id: createdUsers[0].id,
          status: 'available' as const
        },
        {
          title: 'Water plants while away',
          description: 'Going out of town for 3 days, need someone to water balcony plants',
          location: 'Tower 8, Flat 405',
          time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reward: 100,
          poster_id: createdUsers[1].id,
          status: 'available' as const
        },
        {
          title: 'Collect parcel delivery',
          description: 'Expecting Amazon delivery, will be in office',
          location: 'Tower 5, Flat 201',
          time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          reward: 30,
          poster_id: createdUsers[2].id,
          status: 'available' as const
        }
      ]

      for (const taskData of sampleTasks) {
        await this.createTask(taskData)
      }

      console.log('Sample data loaded successfully')
    } catch (error) {
      console.error('Failed to load sample data:', error)
    }
  }
}

// Initialize sample data when the module loads (server-side only)
if (typeof window === 'undefined') {
  // Run initialization after a short delay to ensure everything is set up
  setTimeout(() => {
    ReplitDB.loadSampleData().catch(console.error)
  }, 1000)
}