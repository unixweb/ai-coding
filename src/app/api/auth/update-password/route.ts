import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
})

export async function POST(request: Request) {
  // Rate limiting: 5 password update attempts per hour
  const rateLimitResponse = checkRateLimit(request, { limit: 5, window: 3600 })
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const json = await request.json()
    const { password} = updatePasswordSchema.parse(json)

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Passwort erfolgreich aktualisiert',
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
