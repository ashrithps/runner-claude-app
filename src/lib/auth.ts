import { Resend } from 'resend'
import { ReplitDB } from './replitdb'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Simple in-memory session store for demo purposes
// In production, you'd use Redis or a proper session store
const sessions = new Map<string, { userId: string, email: string, expiresAt: Date }>()

export class AuthService {
  // Generate a 4-digit OTP
  static generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  // Send OTP via email using Resend
  static async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const otp = this.generateOTP()
      
      // Store OTP in database with 10-minute expiration
      await ReplitDB.createOTPSession(email, otp, 10)
      
      // Send email via Resend
      const { error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@runner.community',
        to: email,
        subject: 'Your Runner App Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">🏠 Runner Community</h1>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 20px 0;">
              <h2 style="color: #1e293b; margin-top: 0;">Your Login Code</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                Enter this 4-digit code to sign in to your Runner account:
              </p>
              <div style="background-color: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">
                This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Runner Community - Neighbors helping neighbors
            </p>
          </div>
        `
      })

      if (error) {
        console.error('Email send error:', error)
        return { success: false, error: 'Failed to send email' }
      }

      return { success: true }
    } catch (error) {
      console.error('OTP send error:', error)
      return { success: false, error: 'Failed to send OTP' }
    }
  }

  // Verify OTP and create session
  static async verifyOTP(email: string, otp: string): Promise<{ 
    success: boolean; 
    sessionId?: string; 
    user?: any; 
    isNewUser?: boolean;
    error?: string;
  }> {
    try {
      // Verify OTP
      const isValid = await ReplitDB.verifyOTP(email, otp)
      if (!isValid) {
        return { success: false, error: 'Invalid or expired OTP' }
      }

      // Check if user exists
      let user = await ReplitDB.getUserByEmail(email)
      let isNewUser = false

      if (!user) {
        // Create new user
        user = await ReplitDB.createUser({
          email,
          name: '',
          tower: '',
          flat: '',
          mobile: '',
          available_for_tasks: true,
          email_notifications: true
        })
        isNewUser = true
      }

      // Create session
      const sessionId = this.generateSessionId()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      sessions.set(sessionId, {
        userId: user.id,
        email: user.email,
        expiresAt
      })

      // Clean up OTP session
      await ReplitDB.deleteOTPSession(email)

      return {
        success: true,
        sessionId,
        user,
        isNewUser
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'Verification failed' }
    }
  }

  // Generate session ID
  static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  // Validate session
  static validateSession(sessionId: string): { valid: boolean; userId?: string; email?: string } {
    const session = sessions.get(sessionId)
    if (!session) return { valid: false }

    if (new Date() > session.expiresAt) {
      sessions.delete(sessionId)
      return { valid: false }
    }

    return {
      valid: true,
      userId: session.userId,
      email: session.email
    }
  }

  // Invalidate session (logout)
  static invalidateSession(sessionId: string): void {
    sessions.delete(sessionId)
  }

  // Get user from session
  static async getUserFromSession(sessionId: string): Promise<any | null> {
    const sessionInfo = this.validateSession(sessionId)
    if (!sessionInfo.valid || !sessionInfo.userId) return null

    return await ReplitDB.getUserById(sessionInfo.userId)
  }

  // Clean up expired sessions (call periodically)
  static cleanupExpiredSessions(): void {
    const now = new Date()
    for (const [sessionId, session] of sessions.entries()) {
      if (now > session.expiresAt) {
        sessions.delete(sessionId)
      }
    }
  }
}

// Clean up expired sessions every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    AuthService.cleanupExpiredSessions()
  }, 60 * 60 * 1000)
}