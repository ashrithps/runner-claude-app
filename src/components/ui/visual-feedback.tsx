'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { enhancedFeedback, type FeedbackPattern } from '@/lib/haptics'
import { usePlatformDetection } from '@/lib/platform-detection'

interface VisualFeedbackEffect {
  id: string
  pattern: FeedbackPattern
  x: number
  y: number
  timestamp: number
}

interface VisualFeedbackProviderProps {
  children: React.ReactNode
}

export function VisualFeedbackProvider({ children }: VisualFeedbackProviderProps) {
  const [effects, setEffects] = useState<VisualFeedbackEffect[]>([])
  const { platformInfo } = usePlatformDetection()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleVisualFeedback = (pattern: FeedbackPattern) => {
      // Only show enhanced visual feedback on platforms that need it (like iPhone Safari)
      if (!platformInfo?.isIOS || !platformInfo?.isSafari) {
        return
      }

      // Get random position for effect
      const x = Math.random() * (window.innerWidth - 100)
      const y = Math.random() * (window.innerHeight - 100)

      const effect: VisualFeedbackEffect = {
        id: `${pattern}-${Date.now()}-${Math.random()}`,
        pattern,
        x,
        y,
        timestamp: Date.now()
      }

      setEffects(prev => [...prev, effect])

      // Remove effect after animation
      setTimeout(() => {
        setEffects(prev => prev.filter(e => e.id !== effect.id))
      }, 1000)
    }

    // Register for visual feedback callbacks
    const unregister = enhancedFeedback.onVisualFeedback(handleVisualFeedback)

    return unregister
  }, [platformInfo])

  const getEffectProps = (pattern: FeedbackPattern) => {
    switch (pattern) {
      case 'light':
      case 'selection':
        return {
          size: 20,
          color: 'rgba(59, 130, 246, 0.6)', // Blue
          duration: 0.3
        }
      case 'medium':
        return {
          size: 30,
          color: 'rgba(16, 185, 129, 0.6)', // Green
          duration: 0.4
        }
      case 'heavy':
        return {
          size: 40,
          color: 'rgba(239, 68, 68, 0.6)', // Red
          duration: 0.5
        }
      case 'success':
        return {
          size: 35,
          color: 'rgba(34, 197, 94, 0.7)', // Bright green
          duration: 0.6
        }
      case 'warning':
        return {
          size: 32,
          color: 'rgba(245, 158, 11, 0.6)', // Yellow
          duration: 0.5
        }
      case 'error':
        return {
          size: 38,
          color: 'rgba(239, 68, 68, 0.7)', // Bright red
          duration: 0.7
        }
      default:
        return {
          size: 25,
          color: 'rgba(107, 114, 128, 0.5)', // Gray
          duration: 0.4
        }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {children}
      
      {/* Visual feedback effects overlay */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {effects.map((effect) => {
            const props = getEffectProps(effect.pattern)
            
            return (
              <motion.div
                key={effect.id}
                className="absolute rounded-full"
                style={{
                  left: effect.x,
                  top: effect.y,
                  width: props.size,
                  height: props.size,
                  backgroundColor: props.color,
                  boxShadow: `0 0 ${props.size}px ${props.color}`
                }}
                initial={{ 
                  scale: 0, 
                  opacity: 0.8,
                  rotate: 0
                }}
                animate={{ 
                  scale: [0, 1.5, 0], 
                  opacity: [0.8, 0.4, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: props.duration,
                  ease: 'easeOut'
                }}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface FeedbackRippleProps {
  trigger?: boolean
  pattern?: FeedbackPattern
  children: React.ReactNode
  className?: string
}

export function FeedbackRipple({ 
  trigger = false, 
  pattern = 'selection', 
  children, 
  className = '' 
}: FeedbackRippleProps) {
  const [ripples, setRipples] = useState<Array<{id: string, x: number, y: number}>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    
    let x: number, y: number
    if ('touches' in event) {
      x = event.touches[0].clientX - rect.left - size / 2
      y = event.touches[0].clientY - rect.top - size / 2
    } else {
      x = event.clientX - rect.left - size / 2
      y = event.clientY - rect.top - size / 2
    }

    const ripple = {
      id: `ripple-${Date.now()}-${Math.random()}`,
      x,
      y
    }

    setRipples(prev => [...prev, ripple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id))
    }, 600)
  }

  const getPatternColor = (pattern: FeedbackPattern): string => {
    switch (pattern) {
      case 'success': return 'rgba(34, 197, 94, 0.3)'
      case 'error': return 'rgba(239, 68, 68, 0.3)'
      case 'warning': return 'rgba(245, 158, 11, 0.3)'
      case 'heavy': return 'rgba(239, 68, 68, 0.2)'
      case 'medium': return 'rgba(16, 185, 129, 0.2)'
      default: return 'rgba(59, 130, 246, 0.15)'
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={createRipple}
      onTouchStart={createRipple}
    >
      {children}
      
      {/* Ripple effects */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
                backgroundColor: getPatternColor(pattern)
              }}
              initial={{ 
                width: 0, 
                height: 0, 
                opacity: 0.6 
              }}
              animate={{ 
                width: 300, 
                height: 300, 
                opacity: 0 
              }}
              transition={{ 
                duration: 0.6, 
                ease: 'easeOut' 
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ButtonFeedbackEnhancerProps {
  pattern?: FeedbackPattern
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function ButtonFeedbackEnhancer({ 
  pattern = 'selection', 
  children, 
  className = '',
  disabled = false
}: ButtonFeedbackEnhancerProps) {
  const { platformInfo } = usePlatformDetection()
  const [isPressed, setIsPressed] = useState(false)

  // Only enhance buttons on iPhone Safari
  const shouldEnhance = platformInfo?.isIOS && platformInfo?.isSafari

  const handlePress = () => {
    if (disabled) return
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
  }

  if (!shouldEnhance) {
    return <>{children}</>
  }

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseDown={handlePress}
      onTouchStart={handlePress}
      animate={{
        scale: isPressed ? 0.96 : 1,
        brightness: isPressed ? 1.1 : 1
      }}
      transition={{
        duration: 0.1,
        ease: 'easeOut'
      }}
    >
      <FeedbackRipple pattern={pattern}>
        {children}
      </FeedbackRipple>
      
      {/* Subtle glow effect on press */}
      <AnimatePresence>
        {isPressed && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${
                pattern === 'success' ? 'rgba(34, 197, 94, 0.4)' :
                pattern === 'error' ? 'rgba(239, 68, 68, 0.4)' :
                pattern === 'warning' ? 'rgba(245, 158, 11, 0.4)' :
                'rgba(59, 130, 246, 0.3)'
              }`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}