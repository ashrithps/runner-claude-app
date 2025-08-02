import { NextResponse } from 'next/server'
import { DatabaseOperations } from '@/lib/db-operations'

export async function GET() {
  try {
    const availableTasks = DatabaseOperations.getTasksByStatus('available')
    
    // Get poster names for each task
    const tasksWithNames = availableTasks.map((task) => {
      const poster = DatabaseOperations.getUserById(task.poster_id)
      return {
        ...task,
        poster_name: poster?.name || 'Unknown User'
      }
    })

    // Sort by created_at descending
    tasksWithNames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ tasks: tasksWithNames })
  } catch (error) {
    console.error('Failed to load available tasks:', error)
    return NextResponse.json(
      { error: 'Failed to load tasks' },
      { status: 500 }
    )
  }
}