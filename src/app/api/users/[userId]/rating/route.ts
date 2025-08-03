import { NextRequest, NextResponse } from 'next/server'
import { DatabaseOperations } from '@/lib/db-operations'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Get user's average rating
    const ratingData = DatabaseOperations.getUserAverageRating(userId)
    
    return NextResponse.json({
      userId,
      averageRating: ratingData.average || 0,
      totalRatings: ratingData.count || 0
    })

  } catch (error) {
    console.error('Get user rating API error:', error)
    return NextResponse.json(
      { error: 'Failed to get user rating' },
      { status: 500 }
    )
  }
}