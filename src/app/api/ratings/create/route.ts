import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'

export async function POST(request: NextRequest) {
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

    const { taskId, ratedId, rating, feedback } = await request.json()

    // Validate rating
    if (!taskId || !ratedId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing or invalid rating data' },
        { status: 400 }
      )
    }

    // Get the task to verify user permissions
    const task = DatabaseOperations.getTaskById(taskId)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only poster and runner can rate each other for this task
    if (task.poster_id !== sessionInfo.userId && task.runner_id !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Not authorized to rate this task' },
        { status: 403 }
      )
    }

    // Check if task is completed
    if (task.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only rate completed tasks' },
        { status: 400 }
      )
    }

    // Check if rating already exists
    const existingRating = DatabaseOperations.getRatingForTask(taskId, sessionInfo.userId, ratedId)
    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already exists for this task' },
        { status: 400 }
      )
    }

    // Create the rating
    const newRating = await DatabaseOperations.createRating({
      task_id: taskId,
      rater_id: sessionInfo.userId,
      rated_id: ratedId,
      rating,
      feedback
    })

    return NextResponse.json({ rating: newRating })

  } catch (error) {
    console.error('Create rating API error:', error)
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    )
  }
}