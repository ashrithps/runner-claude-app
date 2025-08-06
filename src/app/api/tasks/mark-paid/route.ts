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

    // Get the task to verify the user can mark it as paid
    const task = DatabaseOperations.getTaskById(taskId)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only the task poster can mark the task as paid
    if (task.poster_id !== sessionInfo.userId) {
      return NextResponse.json(
        { error: 'Only the task poster can mark the task as paid' },
        { status: 403 }
      )
    }

    // Task must be completed before it can be marked as paid
    if (task.status !== 'completed') {
      return NextResponse.json(
        { error: 'Task must be completed before it can be marked as paid' },
        { status: 400 }
      )
    }

    // Update task is_paid flag to true
    const updatedTask = await DatabaseOperations.updateTask(taskId, { is_paid: true })

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

    // Send notification to task runner about payment confirmation
    if (runner?.email && runner.email_notifications) {
      NotificationService.notifyPaymentConfirmed(
        taskWithNames,
        runner.email,
        poster?.name || 'Anonymous'
      ).catch(error => console.error('Failed to send payment confirmation notification:', error))
    }

    return NextResponse.json({ task: taskWithNames })

  } catch (error) {
    console.error('Mark task as paid API error:', error)
    return NextResponse.json(
      { error: 'Failed to mark task as paid' },
      { status: 500 }
    )
  }
}