'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'avatar' | 'text' | 'button'
  lines?: number
  animate?: boolean
}

function Skeleton({ 
  className, 
  variant = 'default',
  lines = 1,
  animate = true,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-md'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'h-32 w-full'
      case 'avatar':
        return 'h-12 w-12 rounded-full'
      case 'text':
        return 'h-4 w-full'
      case 'button':
        return 'h-9 w-24'
      default:
        return 'h-4 w-full'
    }
  }

  const animationProps = animate ? {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
    style: {
      backgroundSize: '200% 100%',
    }
  } : {}

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              baseClasses,
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
            {...animationProps}
            {...props}
          />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(baseClasses, getVariantClasses(), className)}
      {...animationProps}
      {...props}
    />
  )
}

// Predefined skeleton layouts
function TaskCardSkeleton() {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
        <Skeleton variant="button" className="w-16 h-8" />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
      </div>
      
      <Skeleton variant="button" className="w-full h-10" />
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Skeleton variant="avatar" className="mx-auto" />
        <div className="space-y-2">
          <Skeleton variant="text" className="w-32 mx-auto" />
          <Skeleton variant="text" className="w-24 mx-auto" />
        </div>
      </div>
      
      <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg border">
        <Skeleton variant="text" className="w-40" />
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton, TaskCardSkeleton, ProfileSkeleton }