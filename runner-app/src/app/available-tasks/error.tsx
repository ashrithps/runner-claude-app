'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Available tasks page error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📋 Available Tasks</h1>
        <p className="text-gray-600 mt-1">Help your neighbors and earn rewards</p>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-6">
            Failed to load available tasks. Please try again.
          </p>
          <Button 
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}