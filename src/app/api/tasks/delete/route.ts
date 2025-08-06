import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/tasks/delete - Request received')
    
    const sessionId = request.cookies.get('session')?.value
    console.log('Session ID:', sessionId ? 'present' : 'missing')

    if (!sessionId) {
      console.log('No session ID found')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const sessionInfo = AuthService.validateSession(sessionId)
    console.log('Session validation:', sessionInfo)
    
    if (!sessionInfo.valid || !sessionInfo.userId) {
      console.log('Invalid session')
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { taskId } = await request.json()
    console.log('Task ID to delete:', taskId)

    if (!taskId) {
      console.log('No task ID provided')
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Get the task to verify ownership and status
    const task = DatabaseOperations.getTaskById(taskId)
    console.log('Task found:', task)
    
    if (!task) {
      console.log('Task not found in database')
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the poster can delete their task
    if (task.poster_id !== sessionInfo.userId) {
      console.log('User not authorized to delete task. Task poster:', task.poster_id, 'User:', sessionInfo.userId)
      return NextResponse.json(
        { error: 'You can only delete your own tasks' },
        { status: 403 }
      )
    }

    // Only allow deletion if task hasn't been picked up (is still available)
    if (task.status !== 'available') {
      console.log('Task status not available:', task.status)
      return NextResponse.json(
        { error: 'Cannot delete task that has already been picked up' },
        { status: 400 }
      )
    }

    // Delete the task
    console.log('Attempting to delete task from database')
    const success = DatabaseOperations.deleteTask(taskId)
    console.log('Delete operation result:', success)
    
    if (!success) {
      console.log('Database delete operation failed')
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    console.log('Task deleted successfully')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete task API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}