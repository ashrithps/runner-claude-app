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
      // Send email notification directly without database dependency
      const emailContent = {
        subject: `Task Assigned: ${taskWithNames.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎯 Task Assigned</h2>
            <p>Hi ${poster.name}!</p>
            <p><strong>${runnerName}</strong> has accepted your task:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">${taskWithNames.title}</h3>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${taskWithNames.location}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(taskWithNames.time).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Reward:</strong> ₹${taskWithNames.reward}</p>
              ${taskWithNames.description ? `<p style="margin: 10px 0 0 0;"><strong>Description:</strong> ${taskWithNames.description}</p>` : ''}
            </div>
            
            <p>You can contact ${runnerName} directly via WhatsApp to coordinate the task.</p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              Runner Community App
            </p>
          </div>
        `
      }

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: poster.email,
          ...emailContent
        })
      }).catch(error => console.error('Failed to send task assigned notification:', error))
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