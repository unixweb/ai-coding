import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const acceptSchema = z.object({
  token: z.string().uuid('Ungültiger Token'),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { token } = acceptSchema.parse(json)

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Get invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'Diese Einladung ist abgelaufen. Bitte fordern Sie eine neue an' },
        { status: 400 }
      )
    }

    // Check if invitation status is pending
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Diese Einladung ist nicht mehr gültig' },
        { status: 400 }
      )
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role,
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    // Update invitation status
    await supabase
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    return NextResponse.json({
      success: true,
      team_id: invitation.team_id,
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
