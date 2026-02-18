import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
})

export async function POST(request: Request) {
  // Rate limiting: 5 login attempts per 15 minutes
  const rateLimitResponse = checkRateLimit(request, { limit: 5, window: 900 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const json = await request.json()
    const { email, password } = loginSchema.parse(json)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'E-Mail oder Passwort ist falsch' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
