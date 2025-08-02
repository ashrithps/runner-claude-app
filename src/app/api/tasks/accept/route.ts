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

    const { taskId, runnerId, runnerName } = await request.json()

    // Ensure the runner_id matches the session user
    if (runnerId !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Cannot accept task for another user' },
        { status: 403 }
      )
    }

    // Update task in database
    const updatedTask = await DatabaseOperations.updateTask(taskId, {
      status: 'in_progress',
      runner_id: runnerId
    })

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Get user details for display
    const poster = DatabaseOperations.getUserById(updatedTask.poster_id)
    const runner = DatabaseOperations.getUserById(runnerId)

    const taskWithNames = {
      ...updatedTask,
      poster_name: poster?.name || '',
      poster_mobile: poster?.mobile || '',
      runner_name: runner?.name || runnerName,
      runner_mobile: runner?.mobile || ''
    }

    // Send notification to task poster
    if (poster?.email && poster.email_notifications) {
      NotificationService.notifyTaskAssigned(
        taskWithNames,
        poster.email,
        runnerName
      ).catch(error => console.error('Failed to send task assigned notification:', error))
    }

    return NextResponse.json({ task: taskWithNames })

  } catch (error) {
    console.error('Accept task API error:', error)
    return NextResponse.json(
      { error: 'Failed to accept task' },
      { status: 500 }
    )
  }
}