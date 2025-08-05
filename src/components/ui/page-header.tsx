'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  variant?: 'default' | 'primary' | 'minimal'
  className?: string
  children?: ReactNode
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  className,
  children 
}: PageHeaderProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white rounded-lg p-6'
      case 'minimal':
        return 'py-4'
      default:
        return 'bg-gray-50 border-b border-gray-200 py-6'
    }
  }

  return (
    <div className={cn('text-center', getVariantStyles(), className)}>
      <div className="flex items-center justify-center mb-2">
        {Icon && (
          <div className={cn(
            'rounded-full p-2 mr-3',
            variant === 'primary' ? 'bg-white/20' : 'bg-blue-100'
          )}>
            <Icon className={cn(
              'h-6 w-6',
              variant === 'primary' ? 'text-white' : 'text-blue-600'
            )} />
          </div>
        )}
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            variant === 'primary' ? 'text-white' : 'text-gray-900'
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              'text-sm mt-1',
              variant === 'primary' 
                ? 'text-blue-100' 
                : 'text-gray-600'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}