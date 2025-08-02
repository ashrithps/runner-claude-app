import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value

    if (!sessionId) {
      console.log('No session cookie found in request')
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    console.log(`Validating session: ${sessionId}`)
    const user = await AuthService.getUserFromSession(sessionId)

    if (!user) {
      console.log(`Invalid session: ${sessionId}`)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    console.log(`Session valid for user: ${user.email}`)

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}