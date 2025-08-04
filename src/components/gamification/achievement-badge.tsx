'use client'

import { motion } from 'framer-motion'
import { Achievement, getRarityColor, getRarityGradient } from '@/lib/gamification'
import { Lock, Trophy } from 'lucide-react'

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  onClick?: () => void
}

export function AchievementBadge({ 
  achievement, 
  size = 'md',
  showProgress = false,
  onClick 
}: AchievementBadgeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16 text-xs'
      case 'md': return 'w-20 h-20 text-sm'
      case 'lg': return 'w-24 h-24 text-base'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'text-lg'
      case 'md': return 'text-xl'
      case 'lg': return 'text-2xl'
    }
  }

  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  return (
    <motion.div
      className={`relative ${getSizeClasses()} cursor-pointer`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Badge background */}
      <div className={`
        w-full h-full rounded-full flex items-center justify-center
        ${achievement.unlocked 
          ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} border-2 border-opacity-50` 
          : 'bg-gray-200 border-2 border-gray-300'
        }
        shadow-lg relative overflow-hidden
      `}>
        
        {/* Progress ring for locked achievements */}
        {!achievement.unlocked && showProgress && achievement.progress !== undefined && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="2"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              strokeDasharray={`${progressPercentage * 2.83} 283`}
              className="transition-all duration-500"
            />
          </svg>
        )}
        
        {/* Achievement icon */}
        <div className={`${getIconSize()} z-10`}>
          {achievement.unlocked ? (
            <span className="filter drop-shadow-sm">
              {achievement.icon}
            </span>
          ) : (
            <Lock className={`h-5 w-5 text-gray-500 ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
          )}
        </div>
        
        {/* Shine effect for unlocked achievements */}
        {achievement.unlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </div>
      
      {/* Rarity indicator */}
      {achievement.unlocked && (
        <div className={`
          absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center
          ${getRarityColor(achievement.rarity)} text-xs font-bold
        `}>
          {achievement.rarity === 'legendary' && '👑'}
          {achievement.rarity === 'epic' && '💜'}
          {achievement.rarity === 'rare' && '💙'}
          {achievement.rarity === 'common' && '⚪'}
        </div>
      )}
      
      {/* XP reward indicator */}
      {achievement.unlocked && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full font-medium">
          +{achievement.xpReward}
        </div>
      )}
    </motion.div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  isNew?: boolean
}

export function AchievementCard({ achievement, isNew = false }: AchievementCardProps) {
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0

  return (
    <motion.div
      className={`
        p-4 rounded-lg border-2 relative overflow-hidden
        ${achievement.unlocked 
          ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} border-opacity-50` 
          : 'bg-gray-50 border-gray-200'
        }
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* New achievement glow */}
      {isNew && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 opacity-50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        <AchievementBadge achievement={achievement} size="md" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {achievement.title}
            </h3>
            {isNew && (
              <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-medium">
                NEW!
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {achievement.condition}
            </span>
            
            {achievement.unlocked ? (
              <div className="flex items-center gap-1 text-green-600">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Unlocked!</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                {achievement.progress}/{achievement.maxProgress}
              </div>
            )}
          </div>
          
          {/* Progress bar for locked achievements */}
          {!achievement.unlocked && achievement.progress !== undefined && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}