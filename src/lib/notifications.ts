import { ReplitDB } from './replitdb'
import type { Notification, Task } from './replitdb'
import { formatCurrency, type CurrencyInfo, FALLBACK_CURRENCY } from './currency'

export type NotificationType = 'task_assigned' | 'task_completed' | 'task_cancelled' | 'payment_confirmed'

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
      // Import Resend directly for server-side usage
      const { Resend } = await import('resend')
      
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        console.error('RESEND_API_KEY environment variable is not set')
        return false
      }
      
      const resend = new Resend(apiKey)
      
      const emailPayload = {
        from: process.env.FROM_EMAIL || 'Runner Community <noreply@runner-app.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
      }

      console.log('Sending email with payload:', {
        to: emailPayload.to,
        subject: emailPayload.subject,
        from: emailPayload.from
      })

      const result = await resend.emails.send(emailPayload)
      
      console.log('Email sent successfully:', result)
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
    assigneePhone?: string,
    assigneeWhatsApp?: string,
    currency: CurrencyInfo = FALLBACK_CURRENCY
  ) {
    // Use environment variable for app URL, fallback to production domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://runner.loop.me'
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

    // Helper function to create Google Maps button
    const createMapsButton = (latitude?: number, longitude?: number) => {
      if (!latitude || !longitude) return ''
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 15px 0;">
          <tr>
            <td style="background-color: #4285f4; border-radius: 6px; padding: 0;">
              <a href="${mapsUrl}" target="_blank" style="display: inline-block; padding: 12px 20px; background-color: #4285f4; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                🗺️ Open in Google Maps
              </a>
            </td>
          </tr>
        </table>
      `
    }

    // Helper function to create WhatsApp button
    const createWhatsAppButton = (phone?: string, message?: string) => {
      if (!phone) return ''
      const cleanPhone = phone.replace(/\D/g, '').startsWith('91') ? phone.replace(/\D/g, '') : `91${phone.replace(/\D/g, '')}`
      const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 15px 0;">
          <tr>
            <td style="background-color: #25d366; border-radius: 6px; padding: 0;">
              <a href="${whatsappUrl}" target="_blank" style="display: inline-block; padding: 12px 20px; background-color: #25d366; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                📱 Contact on WhatsApp
              </a>
            </td>
          </tr>
        </table>
      `
    }

    // Helper function to create payment details section
    const createPaymentSection = (phone?: string, reward?: number) => {
      if (!phone || !reward) return ''
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <h3 style="color: #166534; font-size: 16px; font-weight: 600; margin: 0 0 12px;">💰 Payment Details</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 4px 0; color: #166534; font-size: 14px; font-weight: 500;">📞 Phone:</td>
                  <td style="padding: 4px 0; color: #166534; font-size: 14px; font-weight: 600; font-family: monospace;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #166534; font-size: 14px; font-weight: 500;">💵 Amount:</td>
                  <td style="padding: 4px 0; color: #166534; font-size: 14px; font-weight: 600;">${formatCurrency(reward, currency)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px 0 4px; color: #166534; font-size: 12px;">
                    Pay via mobile payment apps or direct transfer
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
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
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Address:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.address_details || task.location || 'Location not specified'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Time:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(task.time)}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">${formatCurrency(task.reward, currency)}</span>
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
                          
                          <!-- Google Maps Button -->
                          ${createMapsButton(task.latitude, task.longitude)}
                          
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            🎉 <strong>What's next?</strong><br>
                            Contact <strong>${assigneeName}</strong> to coordinate the task details and timing.
                          </p>
                          
                          <!-- WhatsApp Contact Button -->
                          ${createWhatsAppButton(assigneePhone, `Hi! I accepted your task "${task.title}" on Runner app. Let's coordinate the details!`)}
                          
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
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Address:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.address_details || task.location || 'Location not specified'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Completed:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(new Date().toISOString())}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">${formatCurrency(task.reward, currency)}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Google Maps Button -->
                          ${createMapsButton(task.latitude, task.longitude)}
                          
                          <!-- Payment Details Section -->
                          ${createPaymentSection(assigneePhone, task.reward)}
                          
                          <!-- WhatsApp Contact Button -->
                          ${createWhatsAppButton(assigneePhone, `Hi ${assigneeName}! Thank you for completing the task "${task.title}". Payment details are ready. 💰`)}
                          
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

      case 'payment_confirmed':
        return {
          subject: `💰 Payment Confirmed: ${task.title}`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Payment Confirmed</title>
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
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px 12px 0 0;">
                          <div style="color: #ffffff; font-size: 48px; margin-bottom: 10px;">💰</div>
                          <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">Payment Confirmed!</h1>
                          <p style="color: #fef3c7; font-size: 16px; margin: 8px 0 0; opacity: 0.9;">Your reward has been paid</p>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                            Great news! 🎉<br><br>
                            <strong style="color: #1f2937;">${assigneeName}</strong> has confirmed payment for the task you completed:
                          </p>
                          
                          <!-- Task Card -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; border: 2px solid #bbf7d0; margin: 30px 0;">
                            <tr>
                              <td style="padding: 30px;">
                                <h2 style="color: #1f2937; font-size: 22px; font-weight: 600; margin: 0 0 20px; line-height: 1.3;">${task.title}</h2>
                                
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Address:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.address_details || task.location || 'Location not specified'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward Paid:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #059669; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 16px; font-weight: 700;">${formatCurrency(task.reward, currency)}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">✅ Status:</td>
                                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">Payment Confirmed & Archived</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            🌟 <strong>Thank you for helping your community!</strong><br>
                            Your contribution makes a real difference. Keep up the amazing work!
                          </p>
                          
                          <div style="background-color: #f0fdf4; border-radius: 12px; border: 2px solid #bbf7d0; padding: 20px; margin: 30px 0; text-align: center;">
                            <h3 style="color: #059669; font-size: 18px; font-weight: 600; margin: 0 0 10px;">🎯 Ready for your next task?</h3>
                            <p style="color: #16a34a; font-size: 14px; margin: 0 0 20px;">Find more opportunities to help and earn in your community</p>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                              <tr>
                                <td style="text-align: center;">
                                  <a href="${baseUrl}/available-tasks" 
                                     style="background: linear-gradient(135deg, #059669 0%, #047857 100%); 
                                            color: #ffffff; 
                                            text-decoration: none; 
                                            padding: 14px 28px; 
                                            border-radius: 8px; 
                                            font-size: 16px; 
                                            font-weight: 600; 
                                            display: inline-block; 
                                            box-shadow: 0 4px 14px 0 rgba(5, 150, 105, 0.4);">
                                    🔍 Browse Available Tasks
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f0fdf4; border-radius: 0 0 12px 12px; border-top: 1px solid #bbf7d0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                            Keep making a difference! 💪<br>
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
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 100px;">📍 Address:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${task.address_details || task.location || 'Location not specified'}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">🕒 Time:</td>
                                    <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: 600;">${formatDate(task.time)}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">💰 Reward:</td>
                                    <td style="padding: 8px 0;">
                                      <span style="background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">${formatCurrency(task.reward, currency)}</span>
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
                          
                          <!-- Google Maps Button -->
                          ${createMapsButton(task.latitude, task.longitude)}
                          
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
    assigneeName: string,
    assigneePhone?: string
  ): Promise<void> {
    try {
      console.log('=== STARTING TASK ASSIGNED NOTIFICATION ===')
      console.log('Task ID:', task.id)
      console.log('Poster Email:', posterEmail)
      console.log('Assignee Name:', assigneeName)

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

      console.log('Database notification created:', notification.id)

      // Send email
      const emailContent = this.generateEmailContent('task_assigned', task, assigneeName, assigneePhone)
      console.log('Generated email content for task assigned')
      
      const emailSent = await this.sendEmail({
        to: posterEmail,
        ...emailContent
      })

      console.log('Email sending result:', emailSent)

      // Update notification to mark as sent via email
      if (emailSent && notification.id) {
        await ReplitDB.markNotificationAsRead(notification.id)
        console.log('Notification marked as read')
      }
      
      console.log('=== TASK ASSIGNED NOTIFICATION COMPLETE ===')
    } catch (error) {
      console.error('Error in notifyTaskAssigned:', error)
    }
  }

  // Send notification for task completion
  static async notifyTaskCompleted(
    task: Task,
    posterEmail: string,
    assigneeName: string,
    assigneePhone?: string
  ): Promise<void> {
    try {
      console.log('=== STARTING TASK COMPLETED NOTIFICATION ===')
      console.log('Task ID:', task.id)
      console.log('Poster Email:', posterEmail)
      console.log('Assignee Name:', assigneeName)

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

      console.log('Database notification created:', notification.id)

      // Send email
      const emailContent = this.generateEmailContent('task_completed', task, assigneeName, assigneePhone)
      console.log('Generated email content for task completed')
      
      const emailSent = await this.sendEmail({
        to: posterEmail,
        ...emailContent
      })

      console.log('Email sending result:', emailSent)

      // Update notification to mark as sent via email
      if (emailSent && notification.id) {
        await ReplitDB.markNotificationAsRead(notification.id)
        console.log('Notification marked as read')
      }
      
      console.log('=== TASK COMPLETED NOTIFICATION COMPLETE ===')
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

  // Send notification for payment confirmation
  static async notifyPaymentConfirmed(
    task: Task,
    runnerEmail: string,
    posterName: string
  ): Promise<void> {
    try {
      console.log('=== STARTING PAYMENT CONFIRMED NOTIFICATION ===')
      console.log('Task ID:', task.id)
      console.log('Runner Email:', runnerEmail)
      console.log('Poster Name:', posterName)

      // Create notification in database (for the runner who completed the task)
      if (task.runner_id) {
        const notification = await this.createNotification({
          user_id: task.runner_id,
          task_id: task.id,
          type: 'payment_confirmed',
          title: 'Payment Confirmed',
          message: `${posterName} has confirmed payment for task: ${task.title}`
        })

        if (!notification) {
          console.error('Failed to create payment confirmed notification')
          return
        }

        console.log('Database notification created:', notification.id)
      }

      // Send email
      const emailContent = this.generateEmailContent('payment_confirmed', task, posterName)
      console.log('Generated email content for payment confirmed')
      
      const emailSent = await this.sendEmail({
        to: runnerEmail,
        ...emailContent
      })

      console.log('Email sending result:', emailSent)
      
      console.log('=== PAYMENT CONFIRMED NOTIFICATION COMPLETE ===')
    } catch (error) {
      console.error('Error in notifyPaymentConfirmed:', error)
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