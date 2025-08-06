import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'

export async function DELETE(request: NextRequest) {
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

    const { taskId } = await request.json()

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Get the task to verify ownership and status
    const task = DatabaseOperations.getTaskById(taskId)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the poster can delete their task
    if (task.poster_id !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own tasks' },
        { status: 403 }
      )
    }

    // Only allow deletion if task hasn't been picked up (is still available)
    if (task.status !== 'available') {
      return NextResponse.json(
        { error: 'Cannot delete task that has already been picked up' },
        { status: 400 }
      )
    }

    // Delete the task
    const success = DatabaseOperations.deleteTask(taskId)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete task API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}