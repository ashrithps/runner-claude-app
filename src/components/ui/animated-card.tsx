'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'elevated' | 'gradient'
  delay?: number
  hover?: boolean
  pressable?: boolean
}

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
}

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    variant = 'default',
    delay = 0,
    hover = true,
    pressable = false,
    children,
    ...props 
  }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl'
        case 'elevated':
          return 'bg-card text-card-foreground shadow-lg hover:shadow-xl'
        case 'gradient':
          return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/50 border border-blue-200/50 dark:border-blue-800/50'
        default:
          return 'bg-card text-card-foreground border border-border shadow-sm'
      }
    }

    const getHoverEffect = () => {
      if (!hover) return {}
      
      if (pressable) {
        return {
          whileHover: { 
            y: -4,
            scale: 1.02,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          },
          whileTap: { 
            scale: 0.98,
            y: -2
          }
        }
      }
      
      return {
        whileHover: { 
          y: -2,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden transition-all duration-200',
          getVariantStyles(),
          pressable && 'cursor-pointer',
          className
        )}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
        {...getHoverEffect()}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

const AnimatedCardHeader = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
AnimatedCardHeader.displayName = 'AnimatedCardHeader'

const AnimatedCardContent = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
)
AnimatedCardContent.displayName = 'AnimatedCardContent'

const AnimatedCardTitle = forwardRef<HTMLParagraphElement, HTMLMotionProps<'h3'>>(
  ({ className, ...props }, ref) => (
    <motion.h3
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AnimatedCardTitle.displayName = 'AnimatedCardTitle'

export { AnimatedCard, AnimatedCardHeader, AnimatedCardContent, AnimatedCardTitle }