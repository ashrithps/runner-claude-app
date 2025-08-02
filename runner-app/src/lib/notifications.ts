import { supabase } from './supabase'
import type { Notification, Task, User } from './supabase'

export type NotificationType = 'task_assigned' | 'task_completed' | 'task_cancelled'

interface EmailData {
  to: string
  subject: string
  html: string
}

interface NotificationData {
  user_id: string
  task_id: string
  type: NotificationType
  title: string
  message: string
}

export class NotificationService {
  // Create notification in database
  static async createNotification(data: NotificationData): Promise<Notification | null> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(data)
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        return null
      }

      return notification
    } catch (error) {
      console.error('Failed to create notification:', error)
      return null
    }
  }

  // Send email notification using Resend API
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        throw new Error(`Email API responded with status: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Generate email content for different notification types
  static generateEmailContent(
    type: NotificationType,
    task: Task,
    assigneeName?: string,
    posterName?: string
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    switch (type) {
      case 'task_assigned':
        return {
          subject: `Task Assigned: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">🎯 Task Assigned</h2>
              <p>Hi there!</p>
              <p><strong>${assigneeName}</strong> has accepted your task:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h3>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${task.location}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${task.time}</p>
                <p style="margin: 5px 0;"><strong>Reward:</strong> ₹${task.reward}</p>
                ${task.description ? `<p style="margin: 10px 0 0 0;"><strong>Description:</strong> ${task.description}</p>` : ''}
              </div>
              
              <p>You can contact ${assigneeName} directly via WhatsApp to coordinate the task.</p>
              
              <a href="${baseUrl}/my-tasks" 
                 style="display: inline-block; background-color: #2563eb; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        margin: 20px 0;">
                View My Tasks
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                Runner Community App
              </p>
            </div>
          `
        }

      case 'task_completed':
        return {
          subject: `Task Completed: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">✅ Task Completed</h2>
              <p>Great news!</p>
              <p>Your task has been completed by <strong>${assigneeName}</strong>:</p>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h3>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${task.location}</p>
                <p style="margin: 5px 0;"><strong>Reward:</strong> ₹${task.reward}</p>
              </div>
              
              <p>Please remember to pay the agreed reward amount via UPI${task.upi_id ? ` to ${task.upi_id}` : ''}.</p>
              
              <a href="${baseUrl}/my-tasks" 
                 style="display: inline-block; background-color: #16a34a; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        margin: 20px 0;">
                View My Tasks
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Thank you for using Runner!<br>
                Runner Community App
              </p>
            </div>
          `
        }

      case 'task_cancelled':
        return {
          subject: `Task Cancelled: ${task.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Task Cancelled</h2>
              <p>We're sorry to inform you that a task has been cancelled:</p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">${task.title}</h3>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${task.location}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${task.time}</p>
                <p style="margin: 5px 0;"><strong>Reward:</strong> ₹${task.reward}</p>
              </div>
              
              <p>The task poster has cancelled this task. You can browse other available tasks in the app.</p>
              
              <a href="${baseUrl}/available-tasks" 
                 style="display: inline-block; background-color: #2563eb; color: white; 
                        padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                        margin: 20px 0;">
                Browse Available Tasks
              </a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Best regards,<br>
                Runner Community App
              </p>
            </div>
          `
        }

      default:
        return {
          subject: 'Notification from Runner',
          html: '<p>You have a new notification from Runner.</p>'
        }
    }
  }

  // Send notification for task assignment
  static async notifyTaskAssigned(
    task: Task,
    posterEmail: string,
    assigneeName: string
  ): Promise<void> {
    try {
      // Create notification in database
      const notification = await this.createNotification({
        user_id: task.poster_id,
        task_id: task.id,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${assigneeName} has accepted your task: ${task.title}`
      })

      if (!notification) {
        console.error('Failed to create task assigned notification')
        return
      }

      // Send email
      const emailContent = this.generateEmailContent('task_assigned', task, assigneeName)
      const emailSent = await this.sendEmail({
        to: posterEmail,
        ...emailContent
      })

      // Update notification to mark as sent via email
      if (emailSent) {
        await supabase
          .from('notifications')
          .update({ sent_via_email: true })
          .eq('id', notification.id)
      }
    } catch (error) {
      console.error('Error in notifyTaskAssigned:', error)
    }
  }

  // Send notification for task completion
  static async notifyTaskCompleted(
    task: Task,
    posterEmail: string,
    assigneeName: string
  ): Promise<void> {
    try {
      // Create notification in database
      const notification = await this.createNotification({
        user_id: task.poster_id,
        task_id: task.id,
        type: 'task_completed',
        title: 'Task Completed',
        message: `${assigneeName} has completed your task: ${task.title}`
      })

      if (!notification) {
        console.error('Failed to create task completed notification')
        return
      }

      // Send email
      const emailContent = this.generateEmailContent('task_completed', task, assigneeName)
      const emailSent = await this.sendEmail({
        to: posterEmail,
        ...emailContent
      })

      // Update notification to mark as sent via email
      if (emailSent) {
        await supabase
          .from('notifications')
          .update({ sent_via_email: true })
          .eq('id', notification.id)
      }
    } catch (error) {
      console.error('Error in notifyTaskCompleted:', error)
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }
}