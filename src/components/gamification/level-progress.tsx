'use client'

import { motion } from 'framer-motion'
import { UserLevel } from '@/lib/gamification'
import { Star, Zap } from 'lucide-react'

interface LevelProgressProps {
  level: UserLevel
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function LevelProgress({ 
  level, 
  showDetails = true, 
  size = 'md',
  animated = true 
}: LevelProgressProps) {
  const progressPercentage = level.currentXp / (level.currentXp + level.xpToNext) * 100

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return {
        container: 'p-3',
        title: 'text-sm',
        level: 'text-lg',
        progress: 'h-2',
        details: 'text-xs'
      }
      case 'md': return {
        container: 'p-4',
        title: 'text-base',
        level: 'text-xl',
        progress: 'h-3',
        details: 'text-sm'
      }
      case 'lg': return {
        container: 'p-6',
        title: 'text-lg',
        level: 'text-2xl',
        progress: 'h-4',
        details: 'text-base'
      }
    }
  }

  const classes = getSizeClasses()

  return (
    <motion.div
      className={`
        bg-gradient-to-br from-blue-50 to-indigo-100 
        border border-blue-200 rounded-lg ${classes.container}
        shadow-sm
      `}
      initial={animated ? { opacity: 0, scale: 0.95 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Star className="h-6 w-6 text-blue-600 fill-blue-600" />
            <div className={`
              absolute inset-0 flex items-center justify-center
              ${classes.level} font-bold text-white
            `}>
              {level.level}
            </div>
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${classes.title}`}>
              Level {level.level}
            </h3>
            <p className={`text-blue-600 font-medium ${classes.details}`}>
              {level.title}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-blue-600">
            <Zap className="h-4 w-4" />
            <span className={`font-bold ${classes.title}`}>
              {level.totalXp.toLocaleString()}
            </span>
          </div>
          <p className={`text-gray-500 ${classes.details}`}>
            Total XP
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-2">
        <div className={`w-full bg-gray-200 rounded-full ${classes.progress}`}>
          <motion.div
            className={`bg-gradient-to-r from-blue-500 to-indigo-600 ${classes.progress} rounded-full`}
            initial={animated ? { width: 0 } : { width: `${progressPercentage}%` }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {showDetails && (
        <div className="flex justify-between items-center">
          <span className={`text-gray-600 ${classes.details}`}>
            {level.currentXp.toLocaleString()} / {(level.currentXp + level.xpToNext).toLocaleString()} XP
          </span>
          <span className={`text-blue-600 font-medium ${classes.details}`}>
            {level.xpToNext.toLocaleString()} to next level
          </span>
        </div>
      )}
    </motion.div>
  )
}

interface XpGainIndicatorProps {
  amount: number
  reason: string
  onComplete?: () => void
}

export function XpGainIndicator({ amount, reason, onComplete }: XpGainIndicatorProps) {
  return (
    <motion.div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1, 0.8],
        y: [20, -10, -20, -40]
      }}
      transition={{ 
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        ease: 'easeOut'
      }}
      onAnimationComplete={onComplete}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-300" />
        <div>
          <div className="font-bold text-lg">+{amount} XP</div>
          <div className="text-sm opacity-90">{reason}</div>
        </div>
      </div>
    </motion.div>
  )
}

interface LevelUpCelebrationProps {
  newLevel: UserLevel
  onDismiss: () => void
}

export function LevelUpCelebration({ newLevel, onDismiss }: LevelUpCelebrationProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      <motion.div
        className="bg-white rounded-lg p-8 text-center max-w-sm w-full relative overflow-hidden"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{
                x: Math.random() * 400,
                y: -20,
                rotation: 0,
                opacity: 1
              }}
              animate={{
                y: 400,
                rotation: 360,
                opacity: 0
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Level Up!
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-8 w-8 text-blue-600 fill-blue-600" />
            <span className="text-3xl font-bold text-blue-600">
              {newLevel.level}
            </span>
          </div>
          <p className="text-lg text-blue-600 font-medium mb-6">
            {newLevel.title}
          </p>
          
          <motion.button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}