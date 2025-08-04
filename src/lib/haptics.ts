'use client'

import { platformDetection } from './platform-detection'
import { audioFeedback, type AudioFeedbackType } from './audio-feedback'

export type FeedbackPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
export type FeedbackMode = 'haptic' | 'audio' | 'visual' | 'auto'

interface FeedbackConfig {
  hapticEnabled: boolean
  audioEnabled: boolean
  visualEnabled: boolean
  mode: FeedbackMode
  audioVolume: number
  visualIntensity: number
}

interface MultiFeedbackService {
  trigger: (pattern: FeedbackPattern) => Promise<void>
  isSupported: () => boolean
  getConfig: () => FeedbackConfig
  setConfig: (config: Partial<FeedbackConfig>) => void
  setMode: (mode: FeedbackMode) => void
  test: () => Promise<boolean>
}

class EnhancedFeedbackService implements MultiFeedbackService {
  private config: FeedbackConfig = {
    hapticEnabled: true,
    audioEnabled: true,
    visualEnabled: true,
    mode: 'auto',
    audioVolume: 0.3,
    visualIntensity: 1.0
  }

  private hapticPatterns: Record<FeedbackPattern, number | number[]> = {
    light: 50,
    medium: 100,
    heavy: 200,
    success: [100, 50, 100],
    warning: [150, 100, 150],
    error: [200, 100, 200, 100, 200],
    selection: 30
  }

  private visualCallbacks: Set<(pattern: FeedbackPattern) => void> = new Set()

  constructor() {
    this.loadConfig()
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('feedback-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.config = { ...this.config, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load feedback config:', error)
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('feedback-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save feedback config:', error)
    }
  }

  private async triggerHaptic(pattern: FeedbackPattern): Promise<boolean> {
    if (!this.config.hapticEnabled) return false

    const platform = platformDetection.getPlatformInfo()
    if (!platform.supportsHaptics) return false

    try {
      const vibrationPattern = this.hapticPatterns[pattern]
      const result = navigator.vibrate(vibrationPattern)
      return result === true
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
      return false
    }
  }

  private async triggerAudio(pattern: FeedbackPattern): Promise<boolean> {
    if (!this.config.audioEnabled) return false

    const platform = platformDetection.getPlatformInfo()
    if (!platform.supportsAudio) return false

    try {
      // Set audio volume
      audioFeedback.setVolume(this.config.audioVolume)
      audioFeedback.setEnabled(this.config.audioEnabled)
      
      await audioFeedback.play(pattern as AudioFeedbackType)
      return true
    } catch (error) {
      console.warn('Audio feedback failed:', error)
      return false
    }
  }

  private triggerVisual(pattern: FeedbackPattern): boolean {
    if (!this.config.visualEnabled) return false

    try {
      // Notify registered visual feedback handlers
      this.visualCallbacks.forEach(callback => {
        try {
          callback(pattern)
        } catch (error) {
          console.warn('Visual feedback callback failed:', error)
        }
      })
      return true
    } catch (error) {
      console.warn('Visual feedback failed:', error)
      return false
    }
  }

  public async trigger(pattern: FeedbackPattern): Promise<void> {
    const platform = platformDetection.getPlatformInfo()
    const capabilities = platformDetection.getFeedbackCapabilities()
    
    let feedbackProvided = false

    // Determine which feedback methods to use based on mode and capabilities
    const methods = this.getActiveFeedbackMethods(capabilities)

    // Try feedback methods in priority order
    for (const method of methods) {
      try {
        let success = false

        switch (method) {
          case 'haptic':
            success = await this.triggerHaptic(pattern)
            break
          case 'audio':
            success = await this.triggerAudio(pattern)
            break
          case 'visual':
            success = this.triggerVisual(pattern)
            break
        }

        if (success) {
          feedbackProvided = true
          
          // For iPhone Safari, prefer audio over visual
          if (platform.isIOS && platform.isSafari && method === 'audio') {
            break // Audio feedback is sufficient for iPhone Safari
          }
        }
      } catch (error) {
        console.warn(`${method} feedback failed:`, error)
      }
    }

    // Always ensure visual feedback as absolute fallback
    if (!feedbackProvided && this.config.visualEnabled) {
      this.triggerVisual(pattern)
    }
  }

  private getActiveFeedbackMethods(capabilities: ReturnType<typeof platformDetection.getFeedbackCapabilities>): ('haptic' | 'audio' | 'visual')[] {
    if (this.config.mode === 'haptic' && capabilities.haptic) {
      return ['haptic']
    }
    
    if (this.config.mode === 'audio' && capabilities.audio) {
      return ['audio', 'visual']
    }
    
    if (this.config.mode === 'visual') {
      return ['visual']
    }
    
    // Auto mode - use best available methods
    const methods: ('haptic' | 'audio' | 'visual')[] = []
    
    if (this.config.hapticEnabled && capabilities.haptic) {
      methods.push('haptic')
    }
    
    if (this.config.audioEnabled && capabilities.audio) {
      methods.push('audio')
    }
    
    if (this.config.visualEnabled) {
      methods.push('visual')
    }
    
    return methods
  }

  public isSupported(): boolean {
    const capabilities = platformDetection.getFeedbackCapabilities()
    return capabilities.haptic || capabilities.audio || capabilities.visual
  }

  public getConfig(): FeedbackConfig {
    return { ...this.config }
  }

  public setConfig(updates: Partial<FeedbackConfig>): void {
    this.config = { ...this.config, ...updates }
    this.saveConfig()
    
    // Update audio feedback settings
    if (updates.audioEnabled !== undefined) {
      audioFeedback.setEnabled(updates.audioEnabled)
    }
    if (updates.audioVolume !== undefined) {
      audioFeedback.setVolume(updates.audioVolume)
    }
  }

  public setMode(mode: FeedbackMode): void {
    this.setConfig({ mode })
  }

  public async test(): Promise<boolean> {
    try {
      await this.trigger('selection')
      return true
    } catch {
      return false
    }
  }

  // Visual feedback registration
  public onVisualFeedback(callback: (pattern: FeedbackPattern) => void): () => void {
    this.visualCallbacks.add(callback)
    return () => this.visualCallbacks.delete(callback)
  }

  // Initialize audio context on user interaction (required for iOS)
  public async unlock(): Promise<void> {
    try {
      await audioFeedback.unlock()
    } catch (error) {
      console.warn('Failed to unlock audio feedback:', error)
    }
  }

  // Get platform-specific recommendations
  public getRecommendedSettings(): Partial<FeedbackConfig> {
    const platform = platformDetection.getPlatformInfo()
    
    if (platform.isIOS && platform.isSafari) {
      // iPhone Safari - prioritize audio feedback
      return {
        hapticEnabled: false,
        audioEnabled: true,
        visualEnabled: true,
        mode: 'auto',
        audioVolume: 0.4
      }
    }
    
    if (platform.isAndroid && platform.isChrome) {
      // Android Chrome - haptics work well
      return {
        hapticEnabled: true,
        audioEnabled: true,
        visualEnabled: true,
        mode: 'auto',
        audioVolume: 0.2
      }
    }
    
    // Desktop fallback
    return {
      hapticEnabled: false,
      audioEnabled: true,
      visualEnabled: true,
      mode: 'auto',
      audioVolume: 0.3
    }
  }
}

// Export singleton instance
export const enhancedFeedback = new EnhancedFeedbackService()

// Legacy compatibility
export const haptics = {
  vibrate: (pattern: FeedbackPattern) => enhancedFeedback.trigger(pattern),
  isSupported: () => platformDetection.canUseHaptics(),
  enable: () => enhancedFeedback.setConfig({ hapticEnabled: true }),
  disable: () => enhancedFeedback.setConfig({ hapticEnabled: false }),
  isEnabled: () => enhancedFeedback.getConfig().hapticEnabled
}

// Convenience functions
export const vibrate = {
  light: () => enhancedFeedback.trigger('light'),
  medium: () => enhancedFeedback.trigger('medium'),
  heavy: () => enhancedFeedback.trigger('heavy'),
  success: () => enhancedFeedback.trigger('success'),
  warning: () => enhancedFeedback.trigger('warning'),
  error: () => enhancedFeedback.trigger('error'),
  selection: () => enhancedFeedback.trigger('selection')
}

// Enhanced React hook
import { useCallback, useEffect, useState } from 'react'
import { usePlatformDetection } from './platform-detection'

export function useHaptics() {
  const [config, setConfig] = useState<FeedbackConfig>(enhancedFeedback.getConfig())
  const { platformInfo, feedbackCapabilities } = usePlatformDetection()

  useEffect(() => {
    setConfig(enhancedFeedback.getConfig())
  }, [])

  const triggerFeedback = useCallback(async (pattern: FeedbackPattern) => {
    await enhancedFeedback.trigger(pattern)
  }, [])

  const updateConfig = useCallback((updates: Partial<FeedbackConfig>) => {
    enhancedFeedback.setConfig(updates)
    setConfig(enhancedFeedback.getConfig())
  }, [])

  const setMode = useCallback((mode: FeedbackMode) => {
    enhancedFeedback.setMode(mode)
    setConfig(enhancedFeedback.getConfig())
  }, [])

  const unlock = useCallback(async () => {
    await enhancedFeedback.unlock()
  }, [])

  const test = useCallback(async () => {
    return await enhancedFeedback.test()
  }, [])

  const applyRecommendedSettings = useCallback(() => {
    const recommended = enhancedFeedback.getRecommendedSettings()
    updateConfig(recommended)
  }, [updateConfig])

  return {
    // Config
    config,
    updateConfig,
    setMode,
    
    // Platform info
    platformInfo,
    capabilities: feedbackCapabilities,
    
    // Actions
    triggerFeedback,
    unlock,
    test,
    applyRecommendedSettings,
    
    // Convenience methods
    vibrate: {
      light: () => triggerFeedback('light'),
      medium: () => triggerFeedback('medium'),
      heavy: () => triggerFeedback('heavy'),
      success: () => triggerFeedback('success'),
      warning: () => triggerFeedback('warning'),
      error: () => triggerFeedback('error'),
      selection: () => triggerFeedback('selection')
    },
    
    // Legacy compatibility
    isSupported: enhancedFeedback.isSupported(),
    isEnabled: config.hapticEnabled || config.audioEnabled || config.visualEnabled,
    enable: () => updateConfig({ hapticEnabled: true, audioEnabled: true }),
    disable: () => updateConfig({ hapticEnabled: false, audioEnabled: false })
  }
}