'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Achievement, getRarityColor, getRarityGradient } from '@/lib/gamification'
import { Trophy, X } from 'lucide-react'
import { AchievementBadge } from './achievement-badge'

interface AchievementUnlockProps {
  achievement: Achievement
  onDismiss: () => void
}

export function AchievementUnlock({ achievement, onDismiss }: AchievementUnlockProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        <motion.div
          className={`
            bg-white rounded-lg p-6 text-center max-w-sm w-full relative overflow-hidden
            border-4 ${getRarityGradient(achievement.rarity)}
          `}
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Animated background sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * 300,
                  y: Math.random() * 400,
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 1.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Achievement unlocked header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="text-lg font-bold text-gray-800">
                  Achievement Unlocked!
                </span>
              </div>
              
              {/* Rarity indicator */}
              <div className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                ${getRarityColor(achievement.rarity)}
              `}>
                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
              </div>
            </motion.div>
            
            {/* Achievement badge with bounce animation */}
            <motion.div
              className="mb-4 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.4,
                type: 'spring',
                stiffness: 500,
                damping: 15
              }}
            >
              <AchievementBadge achievement={achievement} size="lg" />
            </motion.div>
            
            {/* Achievement details */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {achievement.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {achievement.description}
              </p>
              
              {/* XP reward highlight */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl">⚡</div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      +{achievement.xpReward} XP
                    </div>
                    <div className="text-sm text-blue-500">
                      Experience Points Earned
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Action button */}
            <motion.button
              className={`
                w-full py-3 rounded-lg font-medium text-white shadow-lg
                bg-gradient-to-r ${
                  achievement.rarity === 'legendary' ? 'from-yellow-500 to-orange-500' :
                  achievement.rarity === 'epic' ? 'from-purple-500 to-pink-500' :
                  achievement.rarity === 'rare' ? 'from-blue-500 to-indigo-500' :
                  'from-gray-500 to-gray-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onDismiss}
            >
              Awesome!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface FloatingAchievementNotificationProps {
  achievement: Achievement
  onDismiss: () => void
}

export function FloatingAchievementNotification({ achievement, onDismiss }: FloatingAchievementNotificationProps) {
  return (
    <motion.div
      className="fixed top-4 right-4 z-40 max-w-sm"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={`
        bg-white rounded-lg shadow-lg border-l-4 p-4
        ${achievement.rarity === 'legendary' ? 'border-yellow-500' :
          achievement.rarity === 'epic' ? 'border-purple-500' :
          achievement.rarity === 'rare' ? 'border-blue-500' :
          'border-gray-500'
        }
      `}>
        <div className="flex items-start gap-3">
          <AchievementBadge achievement={achievement} size="sm" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">
                Achievement Unlocked!
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {achievement.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              +{achievement.xpReward} XP
            </p>
          </div>
          
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}