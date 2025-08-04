'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends Omit<ButtonProps, 'asChild'> {
  animation?: 'bounce' | 'scale' | 'pulse' | 'shake' | 'glow'
  haptic?: boolean
  success?: boolean
}

const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps & HTMLMotionProps<'button'>
>(({ 
  className, 
  variant, 
  size, 
  animation = 'scale',
  haptic = false,
  success = false,
  children,
  onClick,
  disabled,
  ...props 
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback if supported and enabled
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration
    }
    
    if (onClick) {
      onClick(e)
    }
  }

  const getAnimation = () => {
    switch (animation) {
      case 'bounce':
        return {
          whileTap: { scale: 0.95, y: 2 },
          whileHover: { y: -2 },
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }
      case 'scale':
        return {
          whileTap: { scale: 0.95 },
          whileHover: { scale: 1.02 },
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }
      case 'pulse':
        return {
          whileTap: { scale: 0.95 },
          animate: success ? { scale: [1, 1.05, 1] } : {},
          transition: success ? { duration: 0.6, ease: 'easeInOut' } : { type: 'spring', stiffness: 400, damping: 17 }
        }
      case 'shake':
        return {
          whileTap: { x: [-2, 2, -2, 2, 0] },
          transition: { duration: 0.4 }
        }
      case 'glow':
        return {
          whileTap: { scale: 0.95 },
          whileHover: { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            scale: 1.02
          },
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }
      default:
        return {}
    }
  }

  return (
    <motion.button
      ref={ref}
      className={cn(
        // Base button styles
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        // Variant styles
        variant === 'default' && 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        variant === 'outline' && 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        variant === 'link' && 'text-primary underline-offset-4 hover:underline',
        // Size styles
        size === 'default' && 'h-9 px-4 py-2',
        size === 'sm' && 'h-8 rounded-md px-3 text-xs',
        size === 'lg' && 'h-10 rounded-md px-8',
        size === 'icon' && 'h-9 w-9',
        // Success state
        success && 'bg-green-600 hover:bg-green-700 text-white',
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      {...getAnimation()}
      {...props}
    >
      {children}
    </motion.button>
  )
})

AnimatedButton.displayName = 'AnimatedButton'

export { AnimatedButton }