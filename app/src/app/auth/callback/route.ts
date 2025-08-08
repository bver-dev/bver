import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the originally requested page or dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Return to login with error if code exchange failed
  return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
}