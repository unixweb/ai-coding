import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const resetSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

export async function POST(request: Request) {
  // Rate limiting: 3 password reset attempts per hour
  const rateLimitResponse = checkRateLimit(request, { limit: 3, window: 3600 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const json = await request.json()
    const { email } = resetSchema.parse(json)

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.headers.get('origin')}/auth/update-password`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Passwort-Reset-Link wurde an Ihre E-Mail-Adresse gesendet',
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
