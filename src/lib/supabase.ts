// Types only - no Supabase client needed for SQLite

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