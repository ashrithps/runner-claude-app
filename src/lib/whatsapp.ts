import type { Task } from './store'
import { formatCurrency, type CurrencyInfo, FALLBACK_CURRENCY } from './currency'

export class WhatsAppService {
  // Clean phone number to international format
  static cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Handle various international formats
    if (phone.startsWith('+')) {
      return cleaned
    }
    
    // If starts with 91 and has 12 digits (Indian format)
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned
    }
    
    // If starts with 1 and has 11 digits (US/Canada format)
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned
    }
    
    // If it's a 10-digit number, assume it needs country code (default to India for backward compatibility)
    if (cleaned.length === 10) {
      return '91' + cleaned
    }
    
    // Return as is for other international formats
    return cleaned
  }

  // Generate WhatsApp message for task assignment
  static generateTaskAssignmentMessage(task: Task, posterName: string, currency: CurrencyInfo = FALLBACK_CURRENCY): string {
    const googleMapsLink = task.latitude && task.longitude 
      ? `\n🗺️ Location on Maps: https://www.google.com/maps?q=${task.latitude},${task.longitude}` 
      : ''
      
    return `Hi ${posterName}! 👋

I've accepted your task on the Runner app:

📝 *${task.title}*
📍 Address: ${task.address_details}${googleMapsLink}
⏰ Time: ${task.time}
💰 Reward: ${formatCurrency(task.reward, currency)}

${task.description ? `Description: ${task.description}\n\n` : ''}I'm ready to help! Please let me know any additional details or instructions.

Thanks!`
  }

  // Generate WhatsApp message for task completion
  static generateTaskCompletionMessage(task: Task, currency: CurrencyInfo = FALLBACK_CURRENCY): string {
    return `Hi! 👋

I've completed the task: *${task.title}*

The task has been marked as complete in the Runner app. Please confirm once you've verified everything is done to your satisfaction.

'Please contact me via mobile for payment of ' + formatCurrency(task.reward, currency) + '.'

Thank you! 😊`
  }

  // Generate WhatsApp message for coordinating task details
  static generateCoordinationMessage(task: Task, senderName: string): string {
    const googleMapsLink = task.latitude && task.longitude 
      ? `\n🗺️ Location on Maps: https://www.google.com/maps?q=${task.latitude},${task.longitude}` 
      : ''
      
    return `Hi! This is ${senderName} 👋

I wanted to coordinate with you about the task: *${task.title}*

📍 Address: ${task.address_details}${googleMapsLink}
⏰ Time: ${task.time}

Let me know if you have any questions or need to discuss any details!

Thanks!`
  }

  // Create WhatsApp URL using wa.me intent
  static createWhatsAppUrl(phoneNumber: string, message: string): string {
    const cleanedNumber = this.cleanPhoneNumber(phoneNumber)
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanedNumber}?text=${encodedMessage}`
  }

  // Open WhatsApp with message
  static openWhatsApp(phoneNumber: string, message: string): void {
    const url = this.createWhatsAppUrl(phoneNumber, message)
    
    // Try to open WhatsApp, with fallback handling
    try {
      // For mobile devices, try to open WhatsApp app directly
      if (this.isMobile()) {
        window.location.href = url
      } else {
        // For desktop, open in new tab/window
        const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer')
        
        // If popup is blocked, fallback to location change
        if (!whatsappWindow) {
          window.location.href = url
        }
      }
    } catch (error) {
      console.error('Failed to open WhatsApp:', error)
      // Fallback: try direct navigation
      window.location.href = url
    }
  }

  // Detect if user is on mobile device
  private static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Contact task poster (used by task accepter)
  static contactTaskPoster(task: Task, accepterName: string, posterPhone: string, currency: CurrencyInfo = FALLBACK_CURRENCY): void {
    const message = this.generateTaskAssignmentMessage(task, task.poster_name || 'Task Poster', currency)
    this.openWhatsApp(posterPhone, message)
  }

  // Contact task accepter (used by task poster)
  static contactTaskAccepter(task: Task, posterName: string, runnerPhone: string): void {
    const message = this.generateCoordinationMessage(task, posterName)
    this.openWhatsApp(runnerPhone, message)
  }

  // Notify task completion (used by task accepter)
  static notifyTaskCompletion(task: Task, posterPhone: string, currency: CurrencyInfo = FALLBACK_CURRENCY): void {
    const message = this.generateTaskCompletionMessage(task, currency)
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
    
    // Format US/Canada numbers as +1 XXX XXX XXXX
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      const without1 = cleaned.substring(1)
      return `+1 ${without1.substring(0, 3)} ${without1.substring(3, 6)} ${without1.substring(6)}`
    }
    
    // Return with + prefix for other international numbers
    return `+${cleaned}`
  }

  // Validate that a URL is a proper wa.me link
  static isValidWhatsAppUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname === 'wa.me' && urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Get WhatsApp URL for testing/debugging
  static getWhatsAppUrlForTesting(phoneNumber: string, message: string = 'Test message'): string {
    const url = this.createWhatsAppUrl(phoneNumber, message)
    console.log('Generated WhatsApp URL:', url)
    console.log('URL is valid wa.me link:', this.isValidWhatsAppUrl(url))
    return url
  }
}