import type { Task, User } from './store'

export class WhatsAppService {
  // Clean phone number to international format
  static cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // If starts with +91, remove the +
    if (phone.startsWith('+91')) {
      return cleaned
    }
    
    // If starts with 91 and has 12 digits, it's already in international format
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned
    }
    
    // If it's a 10-digit Indian number, add 91 prefix
    if (cleaned.length === 10) {
      return '91' + cleaned
    }
    
    // Return as is if we can't determine the format
    return cleaned
  }

  // Generate WhatsApp message for task assignment
  static generateTaskAssignmentMessage(task: Task, posterName: string): string {
    return `Hi ${posterName}! 👋

I've accepted your task on the Runner app:

📝 *${task.title}*
📍 Location: ${task.location}
⏰ Time: ${task.time}
💰 Reward: ₹${task.reward}

${task.description ? `Description: ${task.description}\n\n` : ''}I'm ready to help! Please let me know any additional details or instructions.

Thanks!`
  }

  // Generate WhatsApp message for task completion
  static generateTaskCompletionMessage(task: Task): string {
    return `Hi! 👋

I've completed the task: *${task.title}*

The task has been marked as complete in the Runner app. Please confirm once you've verified everything is done to your satisfaction.

${task.upi_id ? `For payment, my UPI ID is: ${task.upi_id}` : 'Please let me know your preferred payment method.'}

Thank you! 😊`
  }

  // Generate WhatsApp message for coordinating task details
  static generateCoordinationMessage(task: Task, senderName: string): string {
    return `Hi! This is ${senderName} 👋

I wanted to coordinate with you about the task: *${task.title}*

📍 Location: ${task.location}
⏰ Time: ${task.time}

Let me know if you have any questions or need to discuss any details!

Thanks!`
  }

  // Custom encoder that preserves emojis but encodes other special characters
  static encodeWhatsAppMessage(message: string): string {
    // Only encode specific characters that could break URLs, but preserve emojis
    return message
      .replace(/#/g, '%23')  // Hash
      .replace(/&/g, '%26')  // Ampersand
      .replace(/\+/g, '%2B') // Plus
      .replace(/=/g, '%3D')  // Equals
      // Leave emojis and other Unicode characters unencoded
  }

  // Create WhatsApp URL
  static createWhatsAppUrl(phoneNumber: string, message: string): string {
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber)
    const encodedMessage = this.encodeWhatsAppMessage(message)
    
    // Use wa.me for universal WhatsApp links
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
  }

  // Open WhatsApp with message
  static openWhatsApp(phoneNumber: string, message: string): void {
    const url = this.createWhatsAppUrl(phoneNumber, message)
    window.open(url, '_blank')
  }

  // Contact task poster (used by task accepter)
  static contactTaskPoster(task: Task, accepterName: string, posterPhone: string): void {
    const message = this.generateTaskAssignmentMessage(task, task.poster_name || 'Task Poster')
    this.openWhatsApp(posterPhone, message)
  }

  // Contact task accepter (used by task poster)
  static contactTaskAccepter(task: Task, posterName: string, runnerPhone: string): void {
    const message = this.generateCoordinationMessage(task, posterName)
    this.openWhatsApp(runnerPhone, message)
  }

  // Notify task completion (used by task accepter)
  static notifyTaskCompletion(task: Task, posterPhone: string): void {
    const message = this.generateTaskCompletionMessage(task)
    this.openWhatsApp(posterPhone, message)
  }

  // Check if phone number is valid for WhatsApp
  static isValidPhoneNumber(phone: string): boolean {
    const cleaned = this.cleanPhoneNumber(phone)
    // Basic validation: should be at least 10 digits
    return cleaned.length >= 10 && /^\d+$/.test(cleaned)
  }

  // Format phone number for display
  static formatPhoneForDisplay(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone)
    
    // Format Indian numbers as +91 XXXXX XXXXX
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      const without91 = cleaned.substring(2)
      return `+91 ${without91.substring(0, 5)} ${without91.substring(5)}`
    }
    
    // Return with + prefix for international numbers
    return `+${cleaned}`
  }
}