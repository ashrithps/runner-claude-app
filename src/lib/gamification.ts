'use client'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  xpReward: number
  condition: string
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

export interface UserLevel {
  level: number
  currentXp: number
  xpToNext: number
  totalXp: number
  title: string
}

export interface GamificationStats {
  tasksCompleted: number
  tasksPosted: number
  helpedNeighbors: number
  averageRating: number
  totalEarnings: number
  streak: number
  achievementsUnlocked: number
  level: UserLevel
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Beginner achievements
  {
    id: 'first_help',
    title: 'First Helper',
    description: 'Complete your first task',
    icon: '🥇',
    rarity: 'common',
    xpReward: 100,
    condition: 'Complete 1 task',
    unlocked: false,
    maxProgress: 1
  },
  {
    id: 'first_post',
    title: 'Task Creator',
    description: 'Post your first task',
    icon: '📝',
    rarity: 'common',
    xpReward: 50,
    condition: 'Post 1 task',
    unlocked: false,
    maxProgress: 1
  },
  {
    id: 'neighbor_helper',
    title: 'Good Neighbor',
    description: 'Help 5 different neighbors',
    icon: '🏘️',
    rarity: 'common',
    xpReward: 200,
    condition: 'Help 5 unique neighbors',
    unlocked: false,
    maxProgress: 5
  },
  
  // Progress achievements
  {
    id: 'helper_5',
    title: 'Helpful Hand',
    description: 'Complete 5 tasks',
    icon: '✋',
    rarity: 'common',
    xpReward: 250,
    condition: 'Complete 5 tasks',
    unlocked: false,
    maxProgress: 5
  },
  {
    id: 'helper_25',
    title: 'Community Hero',
    description: 'Complete 25 tasks',
    icon: '🦸',
    rarity: 'rare',
    xpReward: 500,
    condition: 'Complete 25 tasks',
    unlocked: false,
    maxProgress: 25
  },
  {
    id: 'helper_100',
    title: 'Legend Helper',
    description: 'Complete 100 tasks',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 1000,
    condition: 'Complete 100 tasks',
    unlocked: false,
    maxProgress: 100
  },
  
  // Streak achievements
  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Complete 3 tasks in a row',
    icon: '🔥',
    rarity: 'common',
    xpReward: 150,
    condition: '3-day streak',
    unlocked: false,
    maxProgress: 3
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Stay active for 7 days',
    icon: '🗓️',
    rarity: 'rare',
    xpReward: 400,
    condition: '7-day streak',
    unlocked: false,
    maxProgress: 7
  },
  {
    id: 'streak_30',
    title: 'Consistency King',
    description: 'Stay active for 30 days',
    icon: '👑',
    rarity: 'epic',
    xpReward: 1500,
    condition: '30-day streak',
    unlocked: false,
    maxProgress: 30
  },
  
  // Speed achievements
  {
    id: 'speed_runner',
    title: 'Speed Runner',
    description: 'Complete task within 30 minutes',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 300,
    condition: 'Complete task in under 30 min',
    unlocked: false,
    maxProgress: 1
  },
  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Complete 10 tasks within 30 minutes each',
    icon: '⚡',
    rarity: 'epic',
    xpReward: 800,
    condition: 'Complete 10 fast tasks',
    unlocked: false,
    maxProgress: 10
  },
  
  // Rating achievements
  {
    id: 'five_star',
    title: 'Five Star Helper',
    description: 'Receive a 5-star rating',
    icon: '⭐',
    rarity: 'common',
    xpReward: 100,
    condition: 'Get 5-star rating',
    unlocked: false,
    maxProgress: 1
  },
  {
    id: 'perfect_rating',
    title: 'Perfect Helper',
    description: 'Maintain 4.8+ rating for 20+ tasks',
    icon: '💎',
    rarity: 'legendary',
    xpReward: 2000,
    condition: 'Maintain 4.8+ rating over 20 tasks',
    unlocked: false,
    maxProgress: 20
  },
  
  // Social achievements
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Help neighbors in 5 different buildings',
    icon: '🦋',
    rarity: 'rare',
    xpReward: 600,
    condition: 'Help in 5 different locations',
    unlocked: false,
    maxProgress: 5
  },
  {
    id: 'community_leader',
    title: 'Community Leader',
    description: 'Be the top helper this month',
    icon: '🏆',
    rarity: 'legendary',
    xpReward: 2500,
    condition: 'Top monthly helper',
    unlocked: false,
    maxProgress: 1
  }
]

// XP values for different actions
export const XP_VALUES = {
  POST_TASK: 10,
  ACCEPT_TASK: 25,
  COMPLETE_TASK: 50,
  FIVE_STAR_RATING: 100,
  FIRST_HELP_NEIGHBOR: 25,
  DAILY_LOGIN: 5,
  SPEED_BONUS: 50, // Completing task under 30 min
  PERFECT_RATING_BONUS: 25 // Per task with 5-star rating
}

// Level progression - exponential growth
export function calculateLevel(totalXp: number): UserLevel {
  let level = 1
  let xpForCurrentLevel = 0
  let xpForNextLevel = 100 // Start at 100 XP for level 2
  
  while (totalXp >= xpForNextLevel) {
    level++
    xpForCurrentLevel = xpForNextLevel
    xpForNextLevel = Math.floor(xpForNextLevel * 1.5) // 50% increase each level
  }
  
  const currentXp = totalXp - xpForCurrentLevel
  const xpToNext = xpForNextLevel - totalXp
  
  return {
    level,
    currentXp,
    xpToNext,
    totalXp,
    title: getLevelTitle(level)
  }
}

function getLevelTitle(level: number): string {
  if (level >= 50) return 'Community Legend'
  if (level >= 40) return 'Master Helper'
  if (level >= 30) return 'Super Neighbor'
  if (level >= 25) return 'Hero Helper'
  if (level >= 20) return 'Trusted Helper'
  if (level >= 15) return 'Reliable Neighbor'
  if (level >= 10) return 'Active Helper'
  if (level >= 5) return 'Helpful Neighbor'
  return 'New Helper'
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100'
    case 'rare': return 'text-blue-600 bg-blue-100'
    case 'epic': return 'text-purple-600 bg-purple-100'
    case 'legendary': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export function getRarityGradient(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common': return 'from-gray-100 to-gray-200'
    case 'rare': return 'from-blue-100 to-blue-200'
    case 'epic': return 'from-purple-100 to-purple-200'
    case 'legendary': return 'from-yellow-100 to-yellow-200'
    default: return 'from-gray-100 to-gray-200'
  }
}

// Check if achievement should be unlocked
export function checkAchievementProgress(
  achievement: Achievement, 
  stats: GamificationStats
): { unlocked: boolean; progress: number } {
  let progress = 0
  
  switch (achievement.id) {
    case 'first_help':
      progress = Math.min(stats.tasksCompleted, 1)
      break
    case 'first_post':
      progress = Math.min(stats.tasksPosted, 1)
      break
    case 'neighbor_helper':
      progress = Math.min(stats.helpedNeighbors, 5)
      break
    case 'helper_5':
      progress = Math.min(stats.tasksCompleted, 5)
      break
    case 'helper_25':
      progress = Math.min(stats.tasksCompleted, 25)
      break
    case 'helper_100':
      progress = Math.min(stats.tasksCompleted, 100)
      break
    case 'streak_3':
      progress = Math.min(stats.streak, 3)
      break
    case 'streak_7':
      progress = Math.min(stats.streak, 7)
      break
    case 'streak_30':
      progress = Math.min(stats.streak, 30)
      break
    case 'five_star':
      progress = stats.averageRating >= 5 ? 1 : 0
      break
    default:
      progress = 0
  }
  
  return {
    unlocked: progress >= (achievement.maxProgress || 1),
    progress
  }
}