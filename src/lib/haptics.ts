'use client'

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

interface HapticFeedback {
  vibrate: (pattern: HapticPattern) => void
  isSupported: () => boolean
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
}

class HapticService implements HapticFeedback {
  private enabled: boolean = true
  private patterns: Record<HapticPattern, number | number[]> = {
    light: 50,
    medium: 100,
    heavy: 200,
    success: [100, 50, 100],
    warning: [150, 100, 150],
    error: [200, 100, 200, 100, 200],
    selection: 30
  }

  vibrate(pattern: HapticPattern): void {
    if (!this.enabled || !this.isSupported()) return

    try {
      const vibrationPattern = this.patterns[pattern]
      navigator.vibrate(vibrationPattern)
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }

  isSupported(): boolean {
    return 'vibrate' in navigator && typeof navigator.vibrate === 'function'
  }

  enable(): void {
    this.enabled = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics-enabled', 'true')
    }
  }

  disable(): void {
    this.enabled = false
    if (typeof window !== 'undefined') {
      localStorage.setItem('haptics-enabled', 'false')
    }
  }

  isEnabled(): boolean {
    if (typeof window === 'undefined') return this.enabled
    
    const stored = localStorage.getItem('haptics-enabled')
    if (stored !== null) {
      this.enabled = stored === 'true'
    }
    return this.enabled
  }
}

// Create singleton instance
export const haptics = new HapticService()

// Convenience functions
export const vibrate = {
  light: () => haptics.vibrate('light'),
  medium: () => haptics.vibrate('medium'),
  heavy: () => haptics.vibrate('heavy'),
  success: () => haptics.vibrate('success'),
  warning: () => haptics.vibrate('warning'),
  error: () => haptics.vibrate('error'),
  selection: () => haptics.vibrate('selection')
}

// React hook for haptic feedback
import { useCallback, useEffect, useState } from 'react'

export function useHaptics() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    setIsSupported(haptics.isSupported())
    setIsEnabled(haptics.isEnabled())
  }, [])

  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    haptics.vibrate(pattern)
  }, [])

  const enable = useCallback(() => {
    haptics.enable()
    setIsEnabled(true)
  }, [])

  const disable = useCallback(() => {
    haptics.disable()
    setIsEnabled(false)
  }, [])

  const toggle = useCallback(() => {
    if (isEnabled) {
      disable()
    } else {
      enable()
    }
  }, [isEnabled, enable, disable])

  return {
    isSupported,
    isEnabled,
    triggerHaptic,
    enable,
    disable,
    toggle,
    vibrate: {
      light: () => triggerHaptic('light'),
      medium: () => triggerHaptic('medium'),
      heavy: () => triggerHaptic('heavy'),
      success: () => triggerHaptic('success'),
      warning: () => triggerHaptic('warning'),
      error: () => triggerHaptic('error'),
      selection: () => triggerHaptic('selection')
    }
  }
}