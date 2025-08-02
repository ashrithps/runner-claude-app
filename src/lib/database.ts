import { v4 as uuidv4 } from 'uuid'

// Conditionally import better-sqlite3 only on server-side
let Database: any = null
let path: any = null
let fs: any = null

if (typeof window === 'undefined') {
  Database = require('better-sqlite3')
  path = require('path')
  fs = require('fs')
}

// Database types
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
  email: string
  otp: string
  expires_at: string
  verified: boolean
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  email: string
  expires_at: string
  created_at: string
}

// Database connection
class SQLiteDatabase {
  private static instance: SQLiteDatabase | null = null
  private db: any = null

  private constructor() {
    this.connect()
  }

  static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase()
    }
    return SQLiteDatabase.instance
  }

  private connect() {
    // Only connect on server-side
    if (typeof window !== 'undefined' || !Database) {
      console.log('Database connection skipped on client-side')
      return
    }

    try {
      // Use environment variable for database path or default to data directory
      const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.sqlite')
      
      // Ensure data directory exists
      const dataDir = path.dirname(dbPath)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      this.db = new Database(dbPath)
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('foreign_keys = ON')
      
      console.log(`SQLite database connected at: ${dbPath}`)
      this.initializeSchema()
    } catch (error) {
      console.error('Failed to connect to SQLite database:', error)
      throw error
    }
  }

  private initializeSchema() {
    if (!this.db) throw new Error('Database not connected')

    try {
      // Create tables
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          tower TEXT NOT NULL,
          flat TEXT NOT NULL,
          mobile TEXT NOT NULL,
          available_for_tasks BOOLEAN DEFAULT TRUE,
          email_notifications BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          location TEXT NOT NULL,
          time TEXT NOT NULL,
          reward INTEGER NOT NULL,
          upi_id TEXT,
          poster_id TEXT NOT NULL,
          runner_id TEXT,
          status TEXT CHECK(status IN ('available', 'in_progress', 'completed')) DEFAULT 'available',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (poster_id) REFERENCES users(id),
          FOREIGN KEY (runner_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          task_id TEXT NOT NULL,
          type TEXT CHECK(type IN ('task_assigned', 'task_completed', 'task_cancelled')) NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          sent_via_email BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (task_id) REFERENCES tasks(id)
        );

        CREATE TABLE IF NOT EXISTS otp_sessions (
          email TEXT PRIMARY KEY,
          otp TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          email TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_poster_id ON tasks(poster_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_runner_id ON tasks(runner_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
      `)

      console.log('Database schema initialized successfully')
      this.loadSampleData()
    } catch (error) {
      console.error('Failed to initialize database schema:', error)
      throw error
    }
  }

  private loadSampleData() {
    if (!this.db) return

    try {
      // Check if we already have users
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
      
      if (userCount.count > 0) {
        console.log('Sample data already exists, skipping load')
        return
      }

      console.log('Loading sample data...')

      // Sample users
      const sampleUsers = [
        {
          id: uuidv4(),
          email: 'priya@example.com',
          name: 'Priya Sharma',
          tower: 'Tower 12',
          flat: 'Flat 1003',
          mobile: '+91 98765 43210',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          id: uuidv4(),
          email: 'raj@example.com',
          name: 'Raj Kumar',
          tower: 'Tower 8',
          flat: 'Flat 405',
          mobile: '+91 98765 43211',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          id: uuidv4(),
          email: 'anita@example.com',
          name: 'Anita Desai',
          tower: 'Tower 5',
          flat: 'Flat 201',
          mobile: '+91 98765 43212',
          available_for_tasks: true,
          email_notifications: true
        }
      ]

      // Insert users
      const insertUser = this.db.prepare(`
        INSERT INTO users (id, email, name, tower, flat, mobile, available_for_tasks, email_notifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const user of sampleUsers) {
        insertUser.run(
          user.id, user.email, user.name, user.tower, user.flat, 
          user.mobile, user.available_for_tasks ? 1 : 0, user.email_notifications ? 1 : 0
        )
      }

      // Sample tasks
      const sampleTasks = [
        {
          id: uuidv4(),
          title: 'Help carry groceries',
          description: 'Need help carrying heavy grocery bags from car to flat',
          location: 'Tower 12, Flat 1003',
          time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reward: 50,
          poster_id: sampleUsers[0].id,
          status: 'available'
        },
        {
          id: uuidv4(),
          title: 'Water plants while away',
          description: 'Going out of town for 3 days, need someone to water balcony plants',
          location: 'Tower 8, Flat 405',
          time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reward: 100,
          poster_id: sampleUsers[1].id,
          status: 'available'
        },
        {
          id: uuidv4(),
          title: 'Collect parcel delivery',
          description: 'Expecting Amazon delivery, will be in office',
          location: 'Tower 5, Flat 201',
          time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          reward: 30,
          poster_id: sampleUsers[2].id,
          status: 'available'
        }
      ]

      // Insert tasks
      const insertTask = this.db.prepare(`
        INSERT INTO tasks (id, title, description, location, time, reward, poster_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const task of sampleTasks) {
        insertTask.run(
          task.id, task.title, task.description, task.location, 
          task.time, task.reward, task.poster_id, task.status
        )
      }

      console.log('Sample data loaded successfully')
    } catch (error) {
      console.error('Failed to load sample data:', error)
    }
  }

  // Get database instance
  getDB(): any {
    if (!this.db) {
      throw new Error('Database not connected')
    }
    return this.db
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Export singleton instance
export const database = SQLiteDatabase.getInstance()