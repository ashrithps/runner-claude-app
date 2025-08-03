import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const sessionInfo = AuthService.validateSession(sessionId)
    if (!sessionInfo.valid || !sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { taskId } = params

    // Get the task to verify user permissions
    const task = DatabaseOperations.getTaskById(taskId)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only poster and runner can view ratings for this task
    if (task.poster_id !== sessionInfo.userId && task.runner_id !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Not authorized to view ratings for this task' },
        { status: 403 }
      )
    }

    // Get all ratings for this task
    const ratings = DatabaseOperations.getRatingsByTaskId(taskId)

    // Get user details for each rating
    const ratingsWithUsers = ratings.map(rating => {
      const rater = DatabaseOperations.getUserById(rating.rater_id)
      const rated = DatabaseOperations.getUserById(rating.rated_id)
      
      return {
        ...rating,
        rater_name: rater?.name || 'Unknown User',
        rated_name: rated?.name || 'Unknown User'
      }
    })

    // Check if user has provided their feedback
    const userHasGivenFeedback = ratingsWithUsers.some(r => r.rater_id === sessionInfo.userId)
    
    // Determine which ratings the current user can see and which they need to give
    const userRatings = {
      givenByMe: ratingsWithUsers.filter(r => r.rater_id === sessionInfo.userId),
      // Only show received feedback if user has given their own feedback first
      receivedByMe: userHasGivenFeedback ? ratingsWithUsers.filter(r => r.rated_id === sessionInfo.userId) : [],
      // Hide all feedback until user provides their own
      hiddenFeedbackCount: userHasGivenFeedback ? 0 : ratingsWithUsers.filter(r => r.rated_id === sessionInfo.userId).length,
      canRatePoster: task.runner_id === sessionInfo.userId && !ratingsWithUsers.some(r => r.rater_id === sessionInfo.userId && r.rated_id === task.poster_id),
      canRateRunner: task.poster_id === sessionInfo.userId && task.runner_id && !ratingsWithUsers.some(r => r.rater_id === sessionInfo.userId && r.rated_id === task.runner_id),
      hasGivenFeedback: userHasGivenFeedback
    }

    return NextResponse.json({ 
      ratings: ratingsWithUsers,
      userRatings,
      task
    })

  } catch (error) {
    console.error('Get task ratings API error:', error)
    return NextResponse.json(
      { error: 'Failed to get task ratings' },
      { status: 500 }
    )
  }
}