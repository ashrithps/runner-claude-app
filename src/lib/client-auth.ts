// Client-side authentication utilities

export class ClientAuth {
  // Send OTP to email
  static async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to send OTP' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string): Promise<{ 
    success: boolean; 
    user?: any; 
    isNewUser?: boolean; 
    error?: string 
  }> {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Invalid OTP' }
      }

      return {
        success: true,
        user: data.user,
        isNewUser: data.isNewUser
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user?: any; error?: string }> {
    try {
      const response = await fetch('/api/auth/me')

      if (!response.ok) {
        return { error: 'Not authenticated' }
      }

      const data = await response.json()
      return { user: data.user }
    } catch (error) {
      return { error: 'Network error' }
    }
  }

  // Logout
  static async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        return { success: false, error: 'Failed to logout' }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  // Update user profile
  static async updateProfile(updates: any): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update profile' }
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }
}