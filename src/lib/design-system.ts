// Universal Design System for Runner App
// Defines consistent colors, spacing, and styling patterns

export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
    700: '#047857'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2', 
    500: '#ef4444',
    600: '#dc2626'
  },
  
  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
}

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.25rem',  // 20px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
  '3xl': '3rem',  // 48px
}

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
}

// Standard component classes
export const components = {
  // Page headers
  pageHeader: 'text-center mb-6',
  pageTitle: 'text-2xl font-bold text-gray-900 mb-2',
  pageSubtitle: 'text-gray-600',
  
  // Cards
  card: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  cardPadding: 'p-6',
  cardHeader: 'pb-4',
  cardContent: 'pt-0',
  cardInteractive: 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
  
  // Buttons  
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
  buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors',
  buttonOutline: 'border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors',
  
  // Form fields
  formLabel: 'block text-sm font-medium text-gray-700 mb-2',
  formInput: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  formTextarea: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none',
  formError: 'text-sm text-red-600 mt-1',
  formHelp: 'text-sm text-gray-500 mt-1',
  formFocus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
  
  // Status badges
  statusAvailable: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
  statusInProgress: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
  statusCompleted: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
  
  // Reward badges
  rewardBadge: 'flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
  
  // Layout
  pageContainer: 'max-w-md mx-auto p-4',
  sectionSpacing: 'space-y-6',
  itemSpacing: 'space-y-4',
}

// Animation presets (simplified)
export const animations = {
  // Subtle hover states only
  hover: 'transition-all duration-200 hover:scale-[1.02]',
  button: 'transition-colors duration-200',
  
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  
  // Simple fade in
  fadeIn: 'animate-in fade-in duration-300',
}

// Utility functions
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function getStatusBadgeClass(status: 'available' | 'in_progress' | 'completed') {
  switch (status) {
    case 'available':
      return components.statusAvailable
    case 'in_progress':
      return components.statusInProgress
    case 'completed':
      return components.statusCompleted
    default:
      return components.statusAvailable
  }
}