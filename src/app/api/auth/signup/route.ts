import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const signupSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  name: z.string().min(1, 'Name ist erforderlich'),
})

export async function POST(request: Request) {
  // Rate limiting: 3 signup attempts per hour
  const rateLimitResponse = checkRateLimit(request, { limit: 3, window: 3600 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const json = await request.json()
    const { email, password, name } = signupSchema.parse(json)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits registriert' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.',
      user: data.user,
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
