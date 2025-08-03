import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseOperations } from '@/lib/db-operations'

export async function GET(request: NextRequest) {
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

    const tasks = DatabaseOperations.getTasksByRunnerId(sessionInfo.userId)
    
    // Get poster and runner names for each task
    const tasksWithNames = tasks.map((task) => {
      const poster = DatabaseOperations.getUserById(task.poster_id)
      const runner = DatabaseOperations.getUserById(task.runner_id!)
      
      return {
        ...task,
        poster_name: poster?.name || 'Unknown User',
        poster_mobile: poster?.mobile || '',
        runner_name: runner?.name || 'Unknown User',
        runner_mobile: runner?.mobile || ''
      }
    })

    return NextResponse.json({ tasks: tasksWithNames })
  } catch (error) {
    console.error('Failed to load accepted tasks:', error)
    return NextResponse.json(
      { error: 'Failed to load accepted tasks' },
      { status: 500 }
    )
  }
}