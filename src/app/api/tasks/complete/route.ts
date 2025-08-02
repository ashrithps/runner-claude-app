import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'
import { NotificationService } from '@/lib/notifications'

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

    const { taskId } = await request.json()

    // Get the task to verify the user can complete it
    const task = DatabaseOperations.getTaskById(taskId)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the runner or poster can complete the task
    if (task.runner_id !== sessionInfo.userId && task.poster_id !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Not authorized to complete this task' },
        { status: 403 }
      )
    }

    // Update task status to completed
    const updatedTask = await DatabaseOperations.updateTask(taskId, { status: 'completed' })

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Get user details for display and notifications
    const poster = DatabaseOperations.getUserById(updatedTask.poster_id)
    const runner = updatedTask.runner_id ? DatabaseOperations.getUserById(updatedTask.runner_id) : null

    const taskWithNames = {
      ...updatedTask,
      poster_name: poster?.name || '',
      poster_mobile: poster?.mobile || '',
      runner_name: runner?.name || '',
      runner_mobile: runner?.mobile || ''
    }

    // Send notification to task poster
    if (poster?.email && poster.email_notifications) {
      NotificationService.notifyTaskCompleted(
        taskWithNames,
        poster.email,
        runner?.name || 'Anonymous'
      ).catch(error => console.error('Failed to send task completed notification:', error))
    }

    return NextResponse.json({ task: taskWithNames })

  } catch (error) {
    console.error('Complete task API error:', error)
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    )
  }
}