'use client'

import { ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { components } from '@/lib/design-system'

interface StandardCardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
  variant?: 'default' | 'elevated' | 'outline'
  onClick?: () => void
}

interface StandardCardHeaderProps {
  children: ReactNode
  className?: string
}

interface StandardCardContentProps {
  children: ReactNode
  className?: string
}

const StandardCard = forwardRef<HTMLDivElement, StandardCardProps>(
  ({ children, className, interactive = false, variant = 'default', onClick }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'elevated':
          return 'shadow-md hover:shadow-lg'
        case 'outline':
          return 'border-2 shadow-none'
        default:
          return 'shadow-sm'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          components.card,
          getVariantStyles(),
          interactive && components.cardInteractive,
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
)
StandardCard.displayName = 'StandardCard'

const StandardCardHeader = forwardRef<HTMLDivElement, StandardCardHeaderProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(components.cardHeader, className)}
    >
      {children}
    </div>
  )
)
StandardCardHeader.displayName = 'StandardCardHeader'

const StandardCardContent = forwardRef<HTMLDivElement, StandardCardContentProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn(components.cardContent, className)}
    >
      {children}
    </div>
  )
)
StandardCardContent.displayName = 'StandardCardContent'

export { StandardCard, StandardCardHeader, StandardCardContent }