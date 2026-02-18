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
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .schema('taskmanager').from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If no profile exists, create one automatically
    if (profileError) {
      console.log('Profile error:', profileError.code, profileError.message, profileError.details)

      // PGRST116 = "not found" in PostgREST
      if (profileError.code === 'PGRST116') {
        console.log('Creating new profile for user:', user.id)
        const { data: newProfile, error: createError } = await supabase
          .schema('taskmanager').from('profiles')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email,
          })
          .select()
          .single()

        if (createError) {
          console.error('Create profile error:', createError)
          return NextResponse.json({ error: createError.message }, { status: 400 })
        }

        console.log('Profile created successfully')
        return NextResponse.json({ profile: newProfile, user })
      }

      // Other profile errors
      return NextResponse.json({ error: profileError.message, code: profileError.code }, { status: 400 })
    }

    return NextResponse.json({ profile, user })
  } catch (error) {
    console.error('Unexpected error:', error)
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
      .schema('taskmanager').from('profiles')
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
