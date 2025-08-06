'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Achievement, 
  ACHIEVEMENTS, 
  GamificationStats, 
  UserLevel, 
  calculateLevel, 
  XP_VALUES,
  checkAchievementProgress
} from './gamification'

interface GamificationState {
  // Core stats
  totalXp: number
  level: UserLevel
  achievements: Achievement[]
  stats: GamificationStats
  
  // UI state
  showLevelUp: boolean
  showAchievement: Achievement | null
  recentXpGains: Array<{ amount: number; reason: string; timestamp: number }>
  
  // Actions
  addXp: (amount: number, reason: string) => void
  unlockAchievement: (achievementId: string) => void
  updateStats: (updates: Partial<GamificationStats>) => void
  checkAndUnlockAchievements: () => void
  dismissLevelUp: () => void
  dismissAchievement: () => void
  clearRecentXpGains: () => void
  
  // Convenience methods
  awardTaskCompletion: (isFirstTime?: boolean, rating?: number) => void
  awardTaskPosting: () => void
  awardTaskAcceptance: () => void
}

const initialStats: GamificationStats = {
  tasksCompleted: 0,
  tasksPosted: 0,
  helpedNeighbors: 0,
  averageRating: 0,
  totalEarnings: 0,
  streak: 0,
  achievementsUnlocked: 0,
  level: calculateLevel(0)
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: calculateLevel(0),
      achievements: ACHIEVEMENTS.map(a => ({ ...a })),
      stats: initialStats,
      showLevelUp: false,
      showAchievement: null,
      recentXpGains: [],
      
      addXp: (amount: number, reason: string) => {
        set((state) => {
          const newTotalXp = state.totalXp + amount
          const previousLevel = state.level.level
          const newLevel = calculateLevel(newTotalXp)
          
          const showLevelUp = newLevel.level > previousLevel
          
          // Add to recent XP gains (keep last 5)
          const recentXpGains = [
            { amount, reason, timestamp: Date.now() },
            ...state.recentXpGains.slice(0, 4)
          ]
          
          return {
            totalXp: newTotalXp,
            level: newLevel,
            showLevelUp: showLevelUp || state.showLevelUp,
            recentXpGains,
            stats: {
              ...state.stats,
              level: newLevel
            }
          }
        })
      },
      
      unlockAchievement: (achievementId: string) => {
        set((state) => {
          const achievements = state.achievements.map(achievement => {
            if (achievement.id === achievementId && !achievement.unlocked) {
              const unlockedAchievement = {
                ...achievement,
                unlocked: true,
                unlockedAt: new Date()
              }
              
              // Award XP for unlocking achievement
              setTimeout(() => {
                get().addXp(achievement.xpReward, `Achievement: ${achievement.title}`)
              }, 100)
              
              return unlockedAchievement
            }
            return achievement
          })
          
          const unlockedAchievement = achievements.find(a => a.id === achievementId)
          
          return {
            achievements,
            showAchievement: unlockedAchievement || state.showAchievement,
            stats: {
              ...state.stats,
              achievementsUnlocked: achievements.filter(a => a.unlocked).length
            }
          }
        })
      },
      
      updateStats: (updates: Partial<GamificationStats>) => {
        set((state) => ({
          stats: { ...state.stats, ...updates }
        }))
      },
      
      checkAndUnlockAchievements: () => {
        const state = get()
        
        state.achievements.forEach(achievement => {
          if (!achievement.unlocked) {
            const { unlocked, progress } = checkAchievementProgress(achievement, state.stats)
            
            if (unlocked) {
              state.unlockAchievement(achievement.id)
            } else {
              // Update progress
              set((prevState) => ({
                achievements: prevState.achievements.map(a => 
                  a.id === achievement.id ? { ...a, progress } : a
                )
              }))
            }
          }
        })
      },
      
      dismissLevelUp: () => set({ showLevelUp: false }),
      dismissAchievement: () => set({ showAchievement: null }),
      clearRecentXpGains: () => set({ recentXpGains: [] }),
      
      // Convenience methods
      awardTaskCompletion: (isFirstTime = false, rating = 0) => {
        const state = get()
        
        // Base XP for completion
        let totalXp = XP_VALUES.COMPLETE_TASK
        const reasons = ['Task Completion']
        
        // Bonus for 5-star rating
        if (rating === 5) {
          totalXp += XP_VALUES.FIVE_STAR_RATING
          reasons.push('5-Star Rating')
        }
        
        // Bonus for helping new neighbor
        if (isFirstTime) {
          totalXp += XP_VALUES.FIRST_HELP_NEIGHBOR
          reasons.push('New Neighbor')
        }
        
        state.addXp(totalXp, reasons.join(' + '))
        
        // Update stats
        state.updateStats({
          tasksCompleted: state.stats.tasksCompleted + 1,
          helpedNeighbors: isFirstTime ? state.stats.helpedNeighbors + 1 : state.stats.helpedNeighbors
        })
        
        // Check for new achievements
        state.checkAndUnlockAchievements()
      },
      
      awardTaskPosting: () => {
        const state = get()
        state.addXp(XP_VALUES.POST_TASK, 'Task Posted')
        state.updateStats({
          tasksPosted: state.stats.tasksPosted + 1
        })
        state.checkAndUnlockAchievements()
      },
      
      awardTaskAcceptance: () => {
        const state = get()
        state.addXp(XP_VALUES.ACCEPT_TASK, 'Task Accepted')
        state.checkAndUnlockAchievements()
      }
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        totalXp: state.totalXp,
        level: state.level,
        achievements: state.achievements,
        stats: state.stats
      })
    }
  )
)