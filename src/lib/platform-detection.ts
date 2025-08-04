'use client'

export interface PlatformInfo {
  isIOS: boolean
  isAndroid: boolean
  isSafari: boolean
  isChrome: boolean
  isFirefox: boolean
  isPWA: boolean
  isMobile: boolean
  isDesktop: boolean
  supportsHaptics: boolean
  supportsAudio: boolean
  supportsDeviceMotion: boolean
  userAgent: string
  platform: string
}

class PlatformDetectionService {
  private platformInfo: PlatformInfo | null = null

  private detectPlatform(): PlatformInfo {
    if (typeof window === 'undefined') {
      return this.getServerSideFallback()
    }

    const userAgent = navigator.userAgent.toLowerCase()
    const platform = navigator.platform?.toLowerCase() || ''

    // iOS Detection
    const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
                  (platform === 'macintel' && navigator.maxTouchPoints > 1)

    // Android Detection  
    const isAndroid = /android/.test(userAgent)

    // Browser Detection
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent)
    const isFirefox = /firefox/.test(userAgent)

    // PWA Detection
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone === true ||
                  document.referrer.includes('android-app://')

    // Device Type
    const isMobile = /mobi|android|touch|mini|mobile/.test(userAgent) || isIOS
    const isDesktop = !isMobile

    // Capability Detection
    const supportsHaptics = this.testHapticSupport()
    const supportsAudio = this.testAudioSupport()
    const supportsDeviceMotion = 'DeviceMotionEvent' in window

    return {
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      isPWA,
      isMobile,
      isDesktop,
      supportsHaptics,
      supportsAudio,
      supportsDeviceMotion,
      userAgent,
      platform
    }
  }

  private testHapticSupport(): boolean {
    // Test for actual haptic support, not just API existence
    if (!('vibrate' in navigator)) return false
    
    try {
      // iPhone Safari always returns false for vibrate
      if (navigator.userAgent.toLowerCase().includes('iphone') && 
          navigator.userAgent.toLowerCase().includes('safari')) {
        return false
      }
      
      // Test if vibrate actually works (some browsers fake support)
      const result = navigator.vibrate(0)
      return result === true
    } catch {
      return false
    }
  }

  private testAudioSupport(): boolean {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return false
      
      // Test if we can create an audio context
      const context = new AudioContext()
      const canPlayAudio = context.state !== undefined
      context.close?.()
      
      return canPlayAudio
    } catch {
      return false
    }
  }

  private getServerSideFallback(): PlatformInfo {
    return {
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isPWA: false,
      isMobile: false,
      isDesktop: true,
      supportsHaptics: false,
      supportsAudio: false,
      supportsDeviceMotion: false,
      userAgent: '',
      platform: 'server'
    }
  }

  public getPlatformInfo(): PlatformInfo {
    if (!this.platformInfo) {
      this.platformInfo = this.detectPlatform()
    }
    return this.platformInfo
  }

  public refreshDetection(): PlatformInfo {
    this.platformInfo = this.detectPlatform()
    return this.platformInfo
  }

  // Convenience methods
  public isIPhoneSafari(): boolean {
    const info = this.getPlatformInfo()
    return info.isIOS && info.isSafari
  }

  public canUseHaptics(): boolean {
    return this.getPlatformInfo().supportsHaptics
  }

  public canUseAudio(): boolean {
    return this.getPlatformInfo().supportsAudio
  }

  public shouldUseAudioFallback(): boolean {
    const info = this.getPlatformInfo()
    return !info.supportsHaptics && info.supportsAudio
  }

  public getFeedbackCapabilities(): {
    haptic: boolean
    audio: boolean  
    visual: boolean
    priority: ('haptic' | 'audio' | 'visual')[]
  } {
    const info = this.getPlatformInfo()
    
    const capabilities = {
      haptic: info.supportsHaptics,
      audio: info.supportsAudio,
      visual: true // Always available
    }

    // Determine priority order based on platform
    let priority: ('haptic' | 'audio' | 'visual')[] = []
    
    if (capabilities.haptic) {
      priority.push('haptic')
    }
    
    if (capabilities.audio) {
      priority.push('audio')
    }
    
    priority.push('visual')

    return { ...capabilities, priority }
  }

  public getOptimalFeedbackMethods(): string[] {
    const info = this.getPlatformInfo()
    const methods: string[] = []

    if (info.supportsHaptics) {
      methods.push('Native Haptics')
    }
    
    if (info.supportsAudio) {
      methods.push('Audio Feedback')
    }
    
    methods.push('Visual Feedback')
    
    return methods
  }

  public logPlatformInfo(): void {
    const info = this.getPlatformInfo()
    console.group('🔍 Platform Detection Results')
    console.log('Device:', info.isIOS ? 'iOS' : info.isAndroid ? 'Android' : 'Desktop')
    console.log('Browser:', info.isSafari ? 'Safari' : info.isChrome ? 'Chrome' : info.isFirefox ? 'Firefox' : 'Other')
    console.log('PWA Mode:', info.isPWA ? 'Yes' : 'No')
    console.log('Haptic Support:', info.supportsHaptics ? '✅' : '❌')
    console.log('Audio Support:', info.supportsAudio ? '✅' : '❌')
    console.log('Feedback Priority:', this.getFeedbackCapabilities().priority.join(' → '))
    console.groupEnd()
  }
}

// Export singleton instance
export const platformDetection = new PlatformDetectionService()

// Export hook for React components
import { useEffect, useState } from 'react'

export function usePlatformDetection() {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null)

  useEffect(() => {
    const info = platformDetection.getPlatformInfo()
    setPlatformInfo(info)
    
    // Log platform info in development
    if (process.env.NODE_ENV === 'development') {
      platformDetection.logPlatformInfo()
    }
  }, [])

  return {
    platformInfo,
    isIPhoneSafari: platformDetection.isIPhoneSafari(),
    canUseHaptics: platformDetection.canUseHaptics(),
    canUseAudio: platformDetection.canUseAudio(),
    shouldUseAudioFallback: platformDetection.shouldUseAudioFallback(),
    feedbackCapabilities: platformDetection.getFeedbackCapabilities(),
    refresh: () => {
      const newInfo = platformDetection.refreshDetection()
      setPlatformInfo(newInfo)
    }
  }
}