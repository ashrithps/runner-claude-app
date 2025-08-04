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

    const taskData = await request.json()

    // Ensure the poster_id matches the session user
    taskData.poster_id = sessionInfo.userId

    // Ensure user exists in database before creating task
    const existingUser = DatabaseOperations.getUserById(sessionInfo.userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 400 }
      )
    }

    // Create task in database
    const newTask = await DatabaseOperations.createTask(taskData)

    return NextResponse.json({ task: newTask })

  } catch (error) {
    console.error('Create task API error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}