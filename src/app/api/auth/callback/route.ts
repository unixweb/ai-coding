import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Whitelist of allowed redirect paths to prevent open redirect vulnerability
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/projects',
  '/team',
  '/profile',
]

function isValidRedirect(path: string): boolean {
  // Must start with / and not contain protocol (http:, https:, //)
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false
  }

  // Must be in whitelist
  return ALLOWED_REDIRECTS.some(allowed => path === allowed || path.startsWith(allowed + '/'))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate redirect path to prevent open redirect vulnerability
  const redirectPath = isValidRedirect(next) ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return to login if code exchange failed
  return NextResponse.redirect(`${origin}/login`)
}
