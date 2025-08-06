import { v4 as uuidv4 } from 'uuid'

// Interface for better-sqlite3 database
interface SQLiteDB {
  prepare(sql: string): SQLiteStatement
  close(): void
  exec(sql: string): void
}

interface SQLiteStatement {
  run(...params: unknown[]): { changes: number; lastInsertRowid: number }
  get(...params: unknown[]): unknown
  all(...params: unknown[]): unknown[]
}

// Conditionally import better-sqlite3 only on server-side
let Database: ((path: string) => SQLiteDB) | null = null
let path: { join: (...paths: string[]) => string } | null = null
let fs: { existsSync: (path: string) => boolean; mkdirSync: (path: string, options?: { recursive?: boolean }) => void } | null = null

if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Database = require('better-sqlite3')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require('path')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require('fs')
  } catch (error) {
    console.warn('Failed to load server-side dependencies:', error)
  }
}

// Database types
export type User = {
  id: string
  email: string
  name: string
  latitude: number
  longitude: number
  address_details: string
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
  latitude: number
  longitude: number
  address_details: string
  time: string
  reward: number
  upi_id?: string
  poster_id: string
  runner_id?: string
  status: 'available' | 'in_progress' | 'completed'
  is_paid?: boolean
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

export type Rating = {
  id: string
  task_id: string
  rater_id: string
  rated_id: string
  rating: number // 1-5 stars
  feedback?: string
  created_at: string
}

// Database connection
class SQLiteDatabase {
  private static instance: SQLiteDatabase | null = null
  private db: SQLiteDB | null = null

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
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          address_details TEXT NOT NULL,
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
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          address_details TEXT NOT NULL,
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

        CREATE TABLE IF NOT EXISTS ratings (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          rater_id TEXT NOT NULL,
          rated_id TEXT NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
          feedback TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (rater_id) REFERENCES users(id),
          FOREIGN KEY (rated_id) REFERENCES users(id),
          UNIQUE(task_id, rater_id, rated_id)
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_poster_id ON tasks(poster_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_runner_id ON tasks(runner_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_ratings_task_id ON ratings(task_id);
        CREATE INDEX IF NOT EXISTS idx_ratings_rater_id ON ratings(rater_id);
        CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON ratings(rated_id);
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
          latitude: 12.9716,
          longitude: 77.5946,
          address_details: 'Tower 12, Flat 1003, 2nd Floor',
          mobile: '+91 98765 43210',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          id: uuidv4(),
          email: 'raj@example.com',
          name: 'Raj Kumar',
          latitude: 12.9720,
          longitude: 77.5950,
          address_details: 'Tower 8, Flat 405, 4th Floor',
          mobile: '+91 98765 43211',
          available_for_tasks: true,
          email_notifications: true
        },
        {
          id: uuidv4(),
          email: 'anita@example.com',
          name: 'Anita Desai',
          latitude: 12.9710,
          longitude: 77.5940,
          address_details: 'Tower 5, Flat 201, Ground Floor',
          mobile: '+91 98765 43212',
          available_for_tasks: true,
          email_notifications: true
        }
      ]

      // Insert users
      const insertUser = this.db.prepare(`
        INSERT INTO users (id, email, name, latitude, longitude, address_details, mobile, available_for_tasks, email_notifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const user of sampleUsers) {
        insertUser.run(
          user.id, user.email, user.name, user.latitude, user.longitude, user.address_details,
          user.mobile, user.available_for_tasks ? 1 : 0, user.email_notifications ? 1 : 0
        )
      }

      // Sample tasks
      const sampleTasks = [
        {
          id: uuidv4(),
          title: 'Help carry groceries',
          description: 'Need help carrying heavy grocery bags from car to flat',
          latitude: sampleUsers[0].latitude,
          longitude: sampleUsers[0].longitude,
          address_details: sampleUsers[0].address_details,
          time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reward: 50,
          poster_id: sampleUsers[0].id,
          status: 'available'
        },
        {
          id: uuidv4(),
          title: 'Water plants while away',
          description: 'Going out of town for 3 days, need someone to water balcony plants',
          latitude: sampleUsers[1].latitude,
          longitude: sampleUsers[1].longitude,
          address_details: sampleUsers[1].address_details,
          time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          reward: 100,
          poster_id: sampleUsers[1].id,
          status: 'available'
        },
        {
          id: uuidv4(),
          title: 'Collect parcel delivery',
          description: 'Expecting Amazon delivery, will be in office',
          latitude: sampleUsers[2].latitude,
          longitude: sampleUsers[2].longitude,
          address_details: sampleUsers[2].address_details,
          time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          reward: 30,
          poster_id: sampleUsers[2].id,
          status: 'available'
        }
      ]

      // Insert tasks
      const insertTask = this.db.prepare(`
        INSERT INTO tasks (id, title, description, latitude, longitude, address_details, time, reward, poster_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const task of sampleTasks) {
        insertTask.run(
          task.id, task.title, task.description, task.latitude, task.longitude, task.address_details,
          task.time, task.reward, task.poster_id, task.status
        )
      }

      console.log('Sample data loaded successfully')
    } catch (error) {
      console.error('Failed to load sample data:', error)
    }
  }

  // Get database instance
  getDB(): SQLiteDB {
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