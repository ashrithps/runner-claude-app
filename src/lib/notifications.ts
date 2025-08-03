import { ReplitDB } from './replitdb'
import type { Notification, Task } from './replitdb'

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
      const notification = await ReplitDB.createNotification({
        ...data,
        read: false,
        sent_via_email: false
      })
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
    assigneeName?: string
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const formatDate = (dateString: string) => {
      try {
        return new Date(dateString).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      } catch {
        return dateString
      }
    }
    
    switch (type) {
      case 'task_assigned':
        return {
          subject: `🎯 Task Assigned: ${task.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Task Assigned</title>
              <!--[if mso]>
              <noscript>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
              </noscript>
              <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                          <div style="color: #ffffff; font-size: 48px; margin-bottom: 10px;">🎯</div>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">Task Assigned!</h1>
                          <p style="color: #e2e8f0; font-size: 16px; margin: 8px 0 0; opacity: 0.9;">Great news - someone accepted your task</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            Hi there! 👋<br><br>
                            <strong style="color: #1f2937;">${assigneeName}</strong> has accepted your task and is ready to help:
                          </p>
                          
                          <!-- Task Card -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 2px solid #e5e7eb; margin: 30px 0;">
                            <tr>
                              <td style="padding: 30px;">
                                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; line-height: 1.3;">${task.title}</h2>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Location:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.location}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Time:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(task.time)}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">₹${task.reward}</span>
                                    </td>
                                  </tr>
                                  ${task.description ? `
                                  <tr>
                                    <td colspan="2" style="padding: 16px 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">📝 Description:</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="padding: 0 0 8px; color: #374151; font-size: 14px; line-height: 1.5;">${task.description}</td>
                                  </tr>
                                  ` : ''}
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            🎉 <strong>What's next?</strong><br>
                            You can contact <strong>${assigneeName}</strong> directly via WhatsApp to coordinate the task details and timing.
                          </p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                            <tr>
                              <td style="text-align: center;">
                                <a href="${baseUrl}/my-tasks" 
                                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 16px 32px; 
                                          border-radius: 8px; 
                                          font-size: 16px; 
                                          font-weight: 600; 
                                          display: inline-block; 
                                          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);">
                                  📱 View My Tasks
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f8fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                            Happy to help! 🤝<br>
                            <strong style="color: #374151;">Runner Community App</strong>
                          </p>
                          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                            Building stronger communities, one task at a time
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }

      case 'task_completed':
        return {
          subject: `✅ Task Completed: ${task.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Task Completed</title>
              <!--[if mso]>
              <noscript>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
              </noscript>
              <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                          <div style="color: #ffffff; font-size: 48px; margin-bottom: 10px;">✅</div>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">Task Completed!</h1>
                          <p style="color: #d1fae5; font-size: 16px; margin: 8px 0 0; opacity: 0.9;">Your task has been successfully finished</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            Fantastic news! 🎉<br><br>
                            <strong style="color: #1f2937;">${assigneeName}</strong> has successfully completed your task:
                          </p>
                          
                          <!-- Task Card -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; border: 2px solid #bbf7d0; margin: 30px 0;">
                            <tr>
                              <td style="padding: 30px;">
                                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; line-height: 1.3;">${task.title}</h2>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Location:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.location}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Completed:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(new Date().toISOString())}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">₹${task.reward}</span>
                                    </td>
                                  </tr>
                                  ${task.upi_id ? `
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💳 UPI ID:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600; font-family: monospace;">${task.upi_id}</td>
                                  </tr>
                                  ` : ''}
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Payment Reminder -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0 0 8px;">💳 Payment Reminder</p>
                                <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                                  Please remember to pay the agreed reward amount of <strong>₹${task.reward}</strong> to ${assigneeName}${task.upi_id ? ` via UPI: ${task.upi_id}` : ' as agreed'}.
                                </p>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            🌟 <strong>Don't forget to rate your experience!</strong><br>
                            Help build trust in our community by rating your interaction with ${assigneeName}.
                          </p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                            <tr>
                              <td style="text-align: center;">
                                <a href="${baseUrl}/my-tasks" 
                                   style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 16px 32px; 
                                          border-radius: 8px; 
                                          font-size: 16px; 
                                          font-weight: 600; 
                                          display: inline-block; 
                                          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);">
                                  📱 View My Tasks & Rate
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f0fdf4; border-radius: 0 0 12px 12px; border-top: 1px solid #bbf7d0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                            Thank you for using Runner! 🙏<br>
                            <strong style="color: #374151;">Runner Community App</strong>
                          </p>
                          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                            Building stronger communities, one task at a time
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        }

      case 'task_cancelled':
        return {
          subject: `❌ Task Cancelled: ${task.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Task Cancelled</title>
              <!--[if mso]>
              <noscript>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
              </noscript>
              <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 12px 12px 0 0;">
                          <div style="color: #ffffff; font-size: 48px; margin-bottom: 10px;">❌</div>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">Task Cancelled</h1>
                          <p style="color: #fecaca; font-size: 16px; margin: 8px 0 0; opacity: 0.9;">A task has been cancelled</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            We're sorry to inform you that the following task has been cancelled:
                          </p>
                          
                          <!-- Task Card -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef2f2; border-radius: 12px; border: 2px solid #fecaca; margin: 30px 0;">
                            <tr>
                              <td style="padding: 30px;">
                                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; line-height: 1.3;">${task.title}</h2>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Location:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.location}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Time:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(task.time)}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">₹${task.reward}</span>
                                    </td>
                                  </tr>
                                  ${task.description ? `
                                  <tr>
                                    <td colspan="2" style="padding: 16px 0 8px; color: #6b7280; font-size: 14px; font-weight: 500;">📝 Description:</td>
                                  </tr>
                                  <tr>
                                    <td colspan="2" style="padding: 0 0 8px; color: #374151; font-size: 14px; line-height: 1.5;">${task.description}</td>
                                  </tr>
                                  ` : ''}
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            🔍 <strong>Don't worry!</strong><br>
                            There are many other opportunities to help and earn rewards in your community.
                          </p>
                          
                          <!-- CTA Button -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0;">
                            <tr>
                              <td style="text-align: center;">
                                <a href="${baseUrl}/available-tasks" 
                                   style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 16px 32px; 
                                          border-radius: 8px; 
                                          font-size: 16px; 
                                          font-weight: 600; 
                                          display: inline-block; 
                                          box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                                  🔍 Browse Available Tasks
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #fef2f2; border-radius: 0 0 12px 12px; border-top: 1px solid #fecaca;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                            Thanks for being part of our community! 🤝<br>
                            <strong style="color: #374151;">Runner Community App</strong>
                          </p>
                          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
                            Building stronger communities, one task at a time
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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
      if (emailSent && notification.id) {
        await ReplitDB.markNotificationAsRead(notification.id)
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
      if (emailSent && notification.id) {
        await ReplitDB.markNotificationAsRead(notification.id)
      }
    } catch (error) {
      console.error('Error in notifyTaskCompleted:', error)
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await ReplitDB.getNotificationsByUserId(userId)
      return notifications
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const success = await ReplitDB.markNotificationAsRead(notificationId)
      return success
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      return false
    }
  }
}