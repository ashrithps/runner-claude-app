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

    const updates = await request.json()

    // Check if user exists, if not create them first
    let existingUser = DatabaseOperations.getUserById(sessionInfo.userId)
    
    if (!existingUser) {
      // User session exists but not in database - create user with email from session
      const sessionData = DatabaseOperations.getSession(sessionId)
      if (!sessionData?.email) {
        return NextResponse.json(
          { error: 'Session data incomplete' },
          { status: 400 }
        )
      }
      
      existingUser = await DatabaseOperations.createUser({
        email: sessionData.email,
        name: updates.name || '',
        latitude: updates.latitude || 0,
        longitude: updates.longitude || 0,
        address_details: updates.address_details || '',
        mobile: updates.mobile || '',
        available_for_tasks: updates.available_for_tasks ?? true,
        email_notifications: updates.email_notifications ?? true
      })
      
      return NextResponse.json({ user: existingUser })
    }

    // Update existing user in database
    const updatedUser = await DatabaseOperations.updateUser(sessionInfo.userId, updates)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Update user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}