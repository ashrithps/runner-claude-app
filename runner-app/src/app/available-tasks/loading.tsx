import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">📋 Available Tasks</h1>
        <p className="text-gray-600 mt-1">Help your neighbors and earn rewards</p>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading available tasks...</p>
        </CardContent>
      </Card>
    </div>
  )
}