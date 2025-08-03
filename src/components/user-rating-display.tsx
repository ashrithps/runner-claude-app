'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface UserRatingDisplayProps {
  userId: string
  userName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showCount?: boolean
}

interface UserRating {
  averageRating: number
  totalRatings: number
}

export function UserRatingDisplay({ 
  userId, 
  userName, 
  size = 'sm', 
  className = '',
  showCount = false 
}: UserRatingDisplayProps) {
  const [rating, setRating] = useState<UserRating | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/rating`)
        if (response.ok) {
          const data = await response.json()
          setRating(data)
        }
      } catch (error) {
        console.error('Failed to fetch user rating:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRating()
    } else {
      setLoading(false)
    }
  }, [userId])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          star: 'h-3 w-3',
          text: 'text-xs',
          container: 'space-x-1'
        }
      case 'md':
        return {
          star: 'h-4 w-4',
          text: 'text-sm',
          container: 'space-x-1'
        }
      case 'lg':
        return {
          star: 'h-5 w-5',
          text: 'text-base',
          container: 'space-x-2'
        }
      default:
        return {
          star: 'h-3 w-3',
          text: 'text-xs',
          container: 'space-x-1'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (loading) {
    return (
      <span className={`inline-flex items-center ${sizeClasses.container} ${className}`}>
        <span className={userName ? '' : 'sr-only'}>
          {userName && `${userName} `}
        </span>
        <div className={`${sizeClasses.star} animate-pulse bg-gray-300 rounded`} />
      </span>
    )
  }

  if (!rating || rating.totalRatings === 0) {
    return (
      <span className={`inline-flex items-center ${sizeClasses.container} ${className}`}>
        <span className={userName ? '' : 'sr-only'}>
          {userName && `${userName} `}
        </span>
        <Star className={`${sizeClasses.star} text-gray-300`} />
        <span className={`${sizeClasses.text} text-gray-400`}>
          {showCount ? '(0)' : 'New'}
        </span>
      </span>
    )
  }

  const roundedRating = Math.round(rating.averageRating * 10) / 10

  return (
    <span className={`inline-flex items-center ${sizeClasses.container} ${className}`}>
      <span className={userName ? '' : 'sr-only'}>
        {userName && `${userName} `}
      </span>
      <Star className={`${sizeClasses.star} text-yellow-400 fill-yellow-400`} />
      <span className={`${sizeClasses.text} font-medium text-yellow-600`}>
        {roundedRating.toFixed(1)}
      </span>
      {showCount && (
        <span className={`${sizeClasses.text} text-gray-500`}>
          ({rating.totalRatings})
        </span>
      )}
    </span>
  )
}

// Convenience component for just showing the rating without user name
export function RatingBadge({ userId, size = 'sm', showCount = false }: { 
  userId: string
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean 
}) {
  return (
    <UserRatingDisplay 
      userId={userId} 
      userName="" 
      size={size} 
      showCount={showCount}
    />
  )
}