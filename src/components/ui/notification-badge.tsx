import { ReactNode } from 'react'

interface NotificationBadgeProps {
  children: ReactNode
  count: number
  className?: string
  maxCount?: number
}

export function NotificationBadge({ 
  children, 
  count, 
  className = '', 
  maxCount = 99 
}: NotificationBadgeProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()
  
  return (
    <div className={`relative ${className}`}>
      {children}
      {count > 0 && (
        <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center min-w-[20px] px-1">
          {displayCount}
        </div>
      )}
    </div>
  )
}