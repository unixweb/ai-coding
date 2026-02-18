import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich').optional(),
  email: z.string().email('Ungültige E-Mail-Adresse').optional(),
})

export async function PUT(request: Request) {
  try {
    const json = await request.json()
    const updates = updateProfileSchema.parse(json)

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      if (profileError.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse wird bereits verwendet' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // If email was updated, update auth.users as well
    if (updates.email) {
      await supabase.auth.updateUser({ email: updates.email })
    }

    return NextResponse.json({
      success: true,
      profile,
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
