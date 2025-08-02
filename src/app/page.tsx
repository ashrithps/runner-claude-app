'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/available-tasks')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏃 Runner</h1>
        <p className="text-gray-600">Community Task App</p>
        <div className="mt-4 animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    </div>
  )
}
