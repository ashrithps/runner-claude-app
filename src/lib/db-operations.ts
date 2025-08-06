import { database, User, Task, Notification, OTPSession, Session, Rating } from './database'
import { v4 as uuidv4 } from 'uuid'

export class DatabaseOperations {
  // User operations
  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const db = database.getDB()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id, userData.email, userData.name, userData.latitude, userData.longitude, userData.address_details,
      userData.mobile, userData.available_for_tasks ? 1 : 0, userData.email_notifications ? 1 : 0,
      now, now
    )
    
    return this.getUserById(id)!
  }

  static getUserById(id: string): User | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = stmt.get(id) as User | undefined
    return user || null
  }

  static getUserByEmail(email: string): User | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const user = stmt.get(email) as User | undefined
    return user || null
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const db = database.getDB()
    const existingUser = this.getUserById(id)
    if (!existingUser) return null

    const updateFields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at')
    if (updateFields.length === 0) return existingUser

    const setClause = updateFields.map(field => `${field} = ?`).join(', ')
    const values = updateFields.map(field => {
      const value = (updates as Record<string, unknown>)[field]
      // Convert booleans to integers for SQLite
      if (typeof value === 'boolean') {
        return value ? 1 : 0
      }
      return value
    })
    values.push(new Date().toISOString()) // updated_at
    values.push(id) // WHERE clause

    const stmt = db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = ? 
      WHERE id = ?
    `)
    
    stmt.run(...values)
    return this.getUserById(id)
  }

  static getAllUsers(): User[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
    return stmt.all() as User[]
  }

  // Task operations
  static async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const db = database.getDB()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, latitude, longitude, address_details, time, reward, upi_id, poster_id, runner_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id, taskData.title, taskData.description, taskData.latitude, taskData.longitude, taskData.address_details, taskData.time,
      taskData.reward, taskData.upi_id, taskData.poster_id, taskData.runner_id,
      taskData.status, now, now
    )
    
    return this.getTaskById(id)!
  }

  static getTaskById(id: string): Task | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?')
    const task = stmt.get(id) as Task | undefined
    return task || null
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const db = database.getDB()
    const existingTask = this.getTaskById(id)
    if (!existingTask) return null

    const updateFields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at')
    if (updateFields.length === 0) return existingTask

    const setClause = updateFields.map(field => `${field} = ?`).join(', ')
    const values = updateFields.map(field => {
      const value = (updates as Record<string, unknown>)[field]
      // Convert booleans to integers for SQLite
      if (typeof value === 'boolean') {
        return value ? 1 : 0
      }
      return value
    })
    values.push(new Date().toISOString()) // updated_at
    values.push(id) // WHERE clause

    const stmt = db.prepare(`
      UPDATE tasks 
      SET ${setClause}, updated_at = ? 
      WHERE id = ?
    `)
    
    stmt.run(...values)
    return this.getTaskById(id)
  }

  static getAllTasks(): Task[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC')
    return stmt.all() as Task[]
  }

  static getTasksByStatus(status: Task['status']): Task[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC')
    return stmt.all(status) as Task[]
  }

  static getTasksByPosterId(posterId: string): Task[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE poster_id = ? ORDER BY created_at DESC')
    return stmt.all(posterId) as Task[]
  }

  static getTasksByRunnerId(runnerId: string): Task[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM tasks WHERE runner_id = ? ORDER BY created_at DESC')
    return stmt.all(runnerId) as Task[]
  }

  static deleteTask(id: string): boolean {
    const db = database.getDB()
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  // OTP session operations
  static async createOTPSession(email: string, otp: string, expiresInMinutes: number = 10): Promise<OTPSession> {
    const db = database.getDB()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000)
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO otp_sessions (email, otp, expires_at, verified, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(email, otp, expiresAt.toISOString(), 0, now.toISOString())
    
    return {
      email,
      otp,
      expires_at: expiresAt.toISOString(),
      verified: false,
      created_at: now.toISOString()
    }
  }

  static getOTPSession(email: string): OTPSession | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM otp_sessions WHERE email = ?')
    const session = stmt.get(email) as OTPSession | undefined
    return session || null
  }

  static async verifyOTP(email: string, otp: string): Promise<boolean> {
    const db = database.getDB()
    const session = this.getOTPSession(email)
    if (!session) return false
    
    const now = new Date()
    const expiresAt = new Date(session.expires_at)
    
    if (now > expiresAt) {
      // Session expired, clean it up
      this.deleteOTPSession(email)
      return false
    }
    
    if (session.otp !== otp) return false
    
    // Mark as verified
    const stmt = db.prepare('UPDATE otp_sessions SET verified = ? WHERE email = ?')
    stmt.run(1, email)
    
    return true
  }

  static deleteOTPSession(email: string): void {
    const db = database.getDB()
    const stmt = db.prepare('DELETE FROM otp_sessions WHERE email = ?')
    stmt.run(email)
  }

  // Session operations
  static async createSession(userId: string, email: string, expiresInHours: number = 24): Promise<Session> {
    const db = database.getDB()
    const id = uuidv4()
    const now = new Date()
    // Set expiration to far future (year 2099) to effectively never expire
    const expiresAt = new Date('2099-12-31T23:59:59.999Z')
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, email, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, userId, email, expiresAt.toISOString(), now.toISOString())
    
    return {
      id,
      user_id: userId,
      email,
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString()
    }
  }

  static getSession(sessionId: string): Session | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?')
    const session = stmt.get(sessionId) as Session | undefined
    return session || null
  }

  static validateSession(sessionId: string): { valid: boolean; userId?: string; email?: string } {
    const session = this.getSession(sessionId)
    if (!session) return { valid: false }

    // Sessions never expire - always return valid if session exists
    return {
      valid: true,
      userId: session.user_id,
      email: session.email
    }
  }

  static deleteSession(sessionId: string): void {
    const db = database.getDB()
    const stmt = db.prepare('DELETE FROM sessions WHERE id = ?')
    stmt.run(sessionId)
  }

  static deleteUserSessions(userId: string): void {
    const db = database.getDB()
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?')
    stmt.run(userId)
  }

  static cleanupExpiredSessions(): void {
    // Sessions never expire, so no cleanup needed
    return
  }

  static cleanupExpiredOTPSessions(): void {
    const db = database.getDB()
    const now = new Date().toISOString()
    const stmt = db.prepare('DELETE FROM otp_sessions WHERE expires_at < ?')
    const result = stmt.run(now)
    
    if (result.changes > 0) {
      console.log(`Cleaned up ${result.changes} expired OTP sessions`)
    }
  }

  // Notification operations
  static async createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const db = database.getDB()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, task_id, type, title, message, read, sent_via_email, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id, notificationData.user_id, notificationData.task_id, notificationData.type,
      notificationData.title, notificationData.message, notificationData.read,
      notificationData.sent_via_email, now
    )
    
    return {
      id,
      ...notificationData,
      created_at: now
    }
  }

  static getNotificationsByUserId(userId: string): Notification[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
    return stmt.all(userId) as Notification[]
  }

  static markNotificationAsRead(id: string): boolean {
    const db = database.getDB()
    const stmt = db.prepare('UPDATE notifications SET read = ? WHERE id = ?')
    const result = stmt.run(1, id)
    return result.changes > 0
  }

  // Utility functions
  static getStats(): {
    users: number
    tasks: number
    notifications: number
    otpSessions: number
    sessions: number
  } {
    const db = database.getDB()
    
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
    const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }
    const notificationCount = db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number }
    const otpSessionCount = db.prepare('SELECT COUNT(*) as count FROM otp_sessions').get() as { count: number }
    const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number }
    
    return {
      users: userCount.count,
      tasks: taskCount.count,
      notifications: notificationCount.count,
      otpSessions: otpSessionCount.count,
      sessions: sessionCount.count
    }
  }

  static clearAllData(): void {
    const db = database.getDB()
    db.exec(`
      DELETE FROM ratings;
      DELETE FROM notifications;
      DELETE FROM sessions;
      DELETE FROM otp_sessions;
      DELETE FROM tasks;
      DELETE FROM users;
    `)
  }

  // Rating operations
  static async createRating(ratingData: Omit<Rating, 'id' | 'created_at'>): Promise<Rating> {
    const db = database.getDB()
    const id = uuidv4()
    const now = new Date().toISOString()
    
    const stmt = db.prepare(`
      INSERT INTO ratings (id, task_id, rater_id, rated_id, rating, feedback, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(id, ratingData.task_id, ratingData.rater_id, ratingData.rated_id, 
             ratingData.rating, ratingData.feedback || null, now)
    
    return {
      id,
      ...ratingData,
      created_at: now
    }
  }

  static getRatingsByTaskId(taskId: string): Rating[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM ratings WHERE task_id = ? ORDER BY created_at DESC')
    return stmt.all(taskId) as Rating[]
  }

  static getRatingsByUserId(userId: string): Rating[] {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM ratings WHERE rated_id = ? ORDER BY created_at DESC')
    return stmt.all(userId) as Rating[]
  }

  static getRatingForTask(taskId: string, raterId: string, ratedId: string): Rating | null {
    const db = database.getDB()
    const stmt = db.prepare('SELECT * FROM ratings WHERE task_id = ? AND rater_id = ? AND rated_id = ?')
    const rating = stmt.get(taskId, raterId, ratedId) as Rating | undefined
    return rating || null
  }

  static getUserAverageRating(userId: string): { average: number; count: number } {
    const db = database.getDB()
    const stmt = db.prepare('SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE rated_id = ?')
    const result = stmt.get(userId) as { average: number; count: number } | undefined
    return result || { average: 0, count: 0 }
  }

  static getTaskRatings(taskId: string): { posterRating?: Rating; runnerRating?: Rating } {
    const ratings = this.getRatingsByTaskId(taskId)
    const posterRating = ratings.find(r => r.rater_id !== r.rated_id) // Rating given by runner to poster
    const runnerRating = ratings.find(r => r.rater_id !== r.rated_id) // Rating given by poster to runner
    
    return { posterRating, runnerRating }
  }
}

// Setup periodic cleanup (server-side only) - only for OTP sessions
if (typeof window === 'undefined') {
  setInterval(() => {
    // Only cleanup OTP sessions, not user sessions
    DatabaseOperations.cleanupExpiredOTPSessions()
  }, 60 * 60 * 1000) // Every hour
}