'use client'

export type AudioFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

interface AudioPattern {
  frequency: number
  duration: number
  volume: number
  type: 'sine' | 'square' | 'sawtooth' | 'triangle'
  envelope?: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
}

interface AudioFeedbackConfig {
  enabled: boolean
  volume: number
  patterns: Record<AudioFeedbackType, AudioPattern | AudioPattern[]>
}

class AudioFeedbackService {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.3
  private isInitialized: boolean = false

  private patterns: Record<AudioFeedbackType, AudioPattern | AudioPattern[]> = {
    light: {
      frequency: 800,
      duration: 150,
      volume: 0.2,
      type: 'sine',
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 }
    },
    medium: {
      frequency: 600,
      duration: 200,
      volume: 0.3,
      type: 'sine',
      envelope: { attack: 0.02, decay: 0.08, sustain: 0.4, release: 0.12 }
    },
    heavy: {
      frequency: 400,
      duration: 300,
      volume: 0.4,
      type: 'sine',
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.5, release: 0.15 }
    },
    success: [
      {
        frequency: 523, // C5
        duration: 150,
        volume: 0.25,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.1 }
      },
      {
        frequency: 659, // E5
        duration: 150,
        volume: 0.25,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.1 }
      },
      {
        frequency: 784, // G5
        duration: 200,
        volume: 0.3,
        type: 'sine',
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.15 }
      }
    ],
    warning: [
      {
        frequency: 800,
        duration: 150,
        volume: 0.3,
        type: 'square',
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 }
      },
      {
        frequency: 600,
        duration: 150,
        volume: 0.3,
        type: 'square',
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1 }
      }
    ],
    error: [
      {
        frequency: 400,
        duration: 200,
        volume: 0.35,
        type: 'sawtooth',
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1 }
      },
      {
        frequency: 300,
        duration: 200,
        volume: 0.35,
        type: 'sawtooth',
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1 }
      },
      {
        frequency: 200,
        duration: 300,
        volume: 0.4,
        type: 'sawtooth',
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15 }
      }
    ],
    selection: {
      frequency: 1000,
      duration: 100,
      volume: 0.15,
      type: 'sine',
      envelope: { attack: 0.005, decay: 0.02, sustain: 0.2, release: 0.08 }
    }
  }

  private async initializeAudioContext(): Promise<boolean> {
    if (this.isInitialized) return true
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.warn('Audio feedback not supported: No AudioContext')
        return false
      }

      this.audioContext = new AudioContext()
      
      // Resume context if suspended (required for iOS Safari)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.warn('Failed to initialize audio feedback:', error)
      return false
    }
  }

  private createTone(pattern: AudioPattern, startTime: number = 0): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    // Configure oscillator
    oscillator.type = pattern.type
    oscillator.frequency.setValueAtTime(pattern.frequency, this.audioContext.currentTime + startTime)
    
    // Configure envelope
    const now = this.audioContext.currentTime + startTime
    const envelope = pattern.envelope || { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
    const totalVolume = pattern.volume * this.volume
    
    // Envelope shaping
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(totalVolume, now + envelope.attack)
    gainNode.gain.exponentialRampToValueAtTime(
      totalVolume * envelope.sustain, 
      now + envelope.attack + envelope.decay
    )
    gainNode.gain.setValueAtTime(
      totalVolume * envelope.sustain, 
      now + pattern.duration / 1000 - envelope.release
    )
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + pattern.duration / 1000)
    
    // Start and stop
    oscillator.start(now)
    oscillator.stop(now + pattern.duration / 1000)
  }

  private async playPattern(patterns: AudioPattern | AudioPattern[]): Promise<void> {
    if (!this.enabled || !await this.initializeAudioContext()) return

    const patternArray = Array.isArray(patterns) ? patterns : [patterns]
    let delay = 0

    patternArray.forEach((pattern, index) => {
      this.createTone(pattern, delay)
      delay += pattern.duration / 1000 + 0.05 // Small gap between tones
    })
  }

  public async play(type: AudioFeedbackType): Promise<void> {
    try {
      const pattern = this.patterns[type]
      await this.playPattern(pattern)
    } catch (error) {
      console.warn(`Failed to play audio feedback (${type}):`, error)
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-feedback-enabled', enabled.toString())
    }
  }

  public isEnabled(): boolean {
    if (typeof window === 'undefined') return this.enabled
    
    const stored = localStorage.getItem('audio-feedback-enabled')
    if (stored !== null) {
      this.enabled = stored === 'true'
    }
    return this.enabled
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-feedback-volume', this.volume.toString())
    }
  }

  public getVolume(): number {
    if (typeof window === 'undefined') return this.volume
    
    const stored = localStorage.getItem('audio-feedback-volume')
    if (stored !== null) {
      this.volume = Math.max(0, Math.min(1, parseFloat(stored) || 0.3))
    }
    return this.volume
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    return !!AudioContext
  }

  // Test method to check if audio feedback works
  public async test(): Promise<boolean> {
    try {
      await this.play('selection')
      return true
    } catch {
      return false
    }
  }

  // Initialize audio context on first user interaction (required for iOS)
  public async unlock(): Promise<void> {
    if (!this.audioContext || this.audioContext.state !== 'suspended') return
    
    try {
      await this.audioContext.resume()
    } catch (error) {
      console.warn('Failed to unlock audio context:', error)
    }
  }
}

// Export singleton instance
export const audioFeedback = new AudioFeedbackService()

// Convenience functions
export const playAudio = {
  light: () => audioFeedback.play('light'),
  medium: () => audioFeedback.play('medium'),
  heavy: () => audioFeedback.play('heavy'),
  success: () => audioFeedback.play('success'),
  warning: () => audioFeedback.play('warning'),
  error: () => audioFeedback.play('error'),
  selection: () => audioFeedback.play('selection')
}

// React hook for audio feedback
import { useCallback, useEffect, useState } from 'react'

export function useAudioFeedback() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const [volume, setVolumeState] = useState(0.3)

  useEffect(() => {
    setIsSupported(audioFeedback.isSupported())
    setIsEnabled(audioFeedback.isEnabled())
    setVolumeState(audioFeedback.getVolume())
  }, [])

  const playFeedback = useCallback(async (type: AudioFeedbackType) => {
    await audioFeedback.play(type)
  }, [])

  const enable = useCallback(() => {
    audioFeedback.setEnabled(true)
    setIsEnabled(true)
  }, [])

  const disable = useCallback(() => {
    audioFeedback.setEnabled(false)
    setIsEnabled(false)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    audioFeedback.setVolume(newVolume)
    setVolumeState(newVolume)
  }, [])

  const unlock = useCallback(async () => {
    await audioFeedback.unlock()
  }, [])

  const test = useCallback(async () => {
    return await audioFeedback.test()
  }, [])

  return {
    isSupported,
    isEnabled,
    volume,
    playFeedback,
    enable,
    disable,
    setVolume,
    unlock,
    test,
    play: {
      light: () => playFeedback('light'),
      medium: () => playFeedback('medium'),
      heavy: () => playFeedback('heavy'),
      success: () => playFeedback('success'),
      warning: () => playFeedback('warning'),
      error: () => playFeedback('error'),
      selection: () => playFeedback('selection')
    }
  }
}