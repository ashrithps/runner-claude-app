import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Simply redirect to the auth page with all parameters
  // The client-side code will handle the auth flow
  const url = new URL('/auth', requestUrl.origin)
  
  // Forward all search parameters
  requestUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })
  
  return NextResponse.redirect(url.toString())
}