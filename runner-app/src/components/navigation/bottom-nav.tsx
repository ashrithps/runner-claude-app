'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, List, User, CheckSquare, Settings } from 'lucide-react'

const navItems = [
  {
    name: 'Post Task',
    href: '/post-task',
    icon: Plus,
  },
  {
    name: 'Available',
    href: '/available-tasks',
    icon: List,
  },
  {
    name: 'My Tasks',
    href: '/my-tasks',
    icon: CheckSquare,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Debug',
    href: '/debug',
    icon: Settings,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}