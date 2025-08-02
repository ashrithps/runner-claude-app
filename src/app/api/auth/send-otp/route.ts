import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    console.log(`Sending OTP to email: ${email}`)
    const result = await AuthService.sendOTP(email.toLowerCase().trim())

    if (!result.success) {
      console.error(`Failed to send OTP to ${email}:`, result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send OTP' },
        { status: 500 }
      )
    }

    console.log(`OTP sent successfully to ${email}`)
    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully'
    })

  } catch (error) {
    console.error('Send OTP API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}