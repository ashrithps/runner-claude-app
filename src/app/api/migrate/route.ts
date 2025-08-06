import { NextRequest, NextResponse } from 'next/server'
import { MigrationRunner } from '@/lib/migrate'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 Migration API called')
    
    // Optional: Add authentication here in production
    // const authHeader = request.headers.get('authorization')
    // if (!authHeader || authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    const body = await request.json().catch(() => ({}))
    const { action = 'migrate' } = body
    
    switch (action) {
      case 'migrate':
        await MigrationRunner.runPendingMigrations()
        const status = await MigrationRunner.getMigrationStatus()
        
        return NextResponse.json({
          success: true,
          message: 'Migrations completed successfully',
          status: {
            completed: status.completed.length,
            pending: status.pending.length,
            total: status.total
          },
          completedMigrations: status.completed,
          pendingMigrations: status.pending
        })
        
      case 'status':
        const migrationStatus = await MigrationRunner.getMigrationStatus()
        
        return NextResponse.json({
          success: true,
          status: {
            completed: migrationStatus.completed.length,
            pending: migrationStatus.pending.length,
            total: migrationStatus.total,
            upToDate: migrationStatus.pending.length === 0
          },
          completedMigrations: migrationStatus.completed,
          pendingMigrations: migrationStatus.pending
        })
        
      case 'rollback':
        await MigrationRunner.rollbackLastMigration()
        
        return NextResponse.json({
          success: true,
          message: 'Last migration rolled back successfully',
          warning: 'Schema changes may need to be manually reverted'
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: migrate, status, or rollback' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('❌ Migration API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const status = await MigrationRunner.getMigrationStatus()
    
    return NextResponse.json({
      success: true,
      status: {
        completed: status.completed.length,
        pending: status.pending.length,
        total: status.total,
        upToDate: status.pending.length === 0
      },
      completedMigrations: status.completed,
      pendingMigrations: status.pending
    })
    
  } catch (error) {
    console.error('❌ Migration status error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get migration status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}