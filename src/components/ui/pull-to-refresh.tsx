'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { RotateCcw, ArrowDown } from 'lucide-react'
import { useHaptics } from '@/lib/haptics'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  disabled?: boolean
  threshold?: number
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false,
  threshold = 80 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isTriggered, setIsTriggered] = useState(false)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const { vibrate } = useHaptics()

  const handleDragStart = () => {
    if (disabled || isRefreshing) return false
    
    // Only allow pull-to-refresh at the top of the page
    if (window.scrollY > 10) return false
    
    return true
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing) return
    
    const distance = Math.max(0, info.offset.y)
    setPullDistance(distance)
    
    // Trigger haptic feedback when threshold is reached
    if (distance > threshold && !isTriggered) {
      setIsTriggered(true)
      vibrate.light()
    } else if (distance <= threshold && isTriggered) {
      setIsTriggered(false)
    }
  }

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing) return
    
    const distance = Math.max(0, info.offset.y)
    
    if (distance > threshold) {
      // Trigger refresh
      setIsRefreshing(true)
      vibrate.success()
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
        vibrate.error()
      } finally {
        setIsRefreshing(false)
        setIsTriggered(false)
        setPullDistance(0)
        controls.start({ y: 0 })
      }
    } else {
      // Snap back
      setPullDistance(0)
      setIsTriggered(false)
      controls.start({ y: 0 })
    }
  }

  useEffect(() => {
    if (isRefreshing) {
      controls.start({ y: threshold })
    }
  }, [isRefreshing, threshold, controls])

  const getRefreshIndicatorOpacity = () => {
    if (isRefreshing) return 1
    return Math.min(pullDistance / threshold, 1)
  }

  const getRefreshIndicatorRotation = () => {
    if (isRefreshing) return 360
    return (pullDistance / threshold) * 180
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-transparent"
        style={{
          height: Math.max(pullDistance, isRefreshing ? threshold : 0),
          opacity: getRefreshIndicatorOpacity()
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: getRefreshIndicatorOpacity() }}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <motion.div
            animate={{ 
              rotate: isRefreshing ? [0, 360] : getRefreshIndicatorRotation(),
            }}
            transition={{ 
              duration: isRefreshing ? 1 : 0,
              repeat: isRefreshing ? Infinity : 0,
              ease: 'linear'
            }}
            className={`p-2 rounded-full ${
              isTriggered || isRefreshing 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-blue-600 border border-blue-200'
            } shadow-sm`}
          >
            {isRefreshing ? (
              <RotateCcw className="h-5 w-5" />
            ) : (
              <ArrowDown className="h-5 w-5" />
            )}
          </motion.div>
          
          <motion.p 
            className="text-sm font-medium text-blue-600 mt-2"
            animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
          >
            {isRefreshing 
              ? 'Refreshing...' 
              : isTriggered 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Content wrapper */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          y: Math.min(pullDistance, threshold)
        }}
        className="relative z-0"
      >
        {children}
      </motion.div>
    </div>
  )
}