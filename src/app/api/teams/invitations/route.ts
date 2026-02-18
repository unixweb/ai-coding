import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const inviteSchema = z.object({
  team_id: z.string().uuid('Ungültige Team-ID'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team_id = searchParams.get('team_id')

    if (!team_id) {
      return NextResponse.json({ error: 'Team-ID ist erforderlich' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: invitations, error } = await supabase
      .schema('taskmanager').from('team_invitations')
      .select('*')
      .eq('team_id', team_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { team_id, email, role } = inviteSchema.parse(json)

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if email is already a team member
    const { data: existingMember } = await supabase
      .schema('taskmanager').from('team_members')
      .select('id')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'Dieser Benutzer ist bereits Mitglied des Teams' },
        { status: 400 }
      )
    }

    // Check if there's a pending invitation for this email
    const { data: existingInvitation } = await supabase
      .schema('taskmanager').from('team_invitations')
      .select('id')
      .eq('team_id', team_id)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Diese E-Mail-Adresse wurde bereits eingeladen' },
        { status: 400 }
      )
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .schema('taskmanager').from('team_invitations')
      .insert({
        team_id,
        email,
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // TODO: Send invitation email via Supabase
    // This would typically be done via a Supabase Edge Function or webhook

    return NextResponse.json({ invitation }, { status: 201 })
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
