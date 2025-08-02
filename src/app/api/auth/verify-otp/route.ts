import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp || typeof email !== 'string' || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 4 digits' },
        { status: 400 }
      )
    }

    console.log(`Verifying OTP for email: ${email}`)
    const result = await AuthService.verifyOTP(email.toLowerCase().trim(), otp)

    if (!result.success) {
      console.error(`OTP verification failed for ${email}:`, result.error)
      return NextResponse.json(
        { error: result.error || 'Invalid OTP' },
        { status: 400 }
      )
    }

    console.log(`OTP verified successfully for ${email}, isNewUser: ${result.isNewUser}`)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      isNewUser: result.isNewUser
    })

    // Set session cookie
    response.cookies.set('session', result.sessionId!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Verify OTP API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}