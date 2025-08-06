import { NextResponse } from 'next/server'
import { initializeApp, checkMigrationStatus } from '@/lib/startup'

export async function GET() {
  try {
    console.log('🔄 Initialization endpoint called')
    
    // Check current migration status
    const status = await checkMigrationStatus()
    
    if (status.upToDate) {
      return NextResponse.json({
        success: true,
        message: 'Application already initialized',
        migrations: {
          upToDate: true,
          pending: status.pending,
          completed: status.completed
        }
      })
    }
    
    // Initialize the app (runs migrations)
    await initializeApp()
    
    // Get updated status
    const newStatus = await checkMigrationStatus()
    
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      migrations: {
        upToDate: newStatus.upToDate,
        pending: newStatus.pending,
        completed: newStatus.completed
      }
    })
    
  } catch (error) {
    console.error('❌ Initialization endpoint error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Initialization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  // Same as GET for convenience
  return GET()
}