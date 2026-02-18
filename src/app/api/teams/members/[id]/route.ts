import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const json = await request.json()
    const { role } = updateMemberSchema.parse(json)

    const supabase = await createClient()

    // Check if this would remove the last admin
    const { data: member } = await supabase
      .schema('taskmanager').from('team_members')
      .select('team_id, role')
      .eq('id', id)
      .single()

    if (member && member.role === 'admin' && role !== 'admin') {
      const { count } = await supabase
        .schema('taskmanager').from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', member.team_id)
        .eq('role', 'admin')

      if (count === 1) {
        return NextResponse.json(
          { error: 'Es muss mindestens ein Admin im Team sein' },
          { status: 400 }
        )
      }
    }

    const { data: updatedMember, error } = await supabase
      .schema('taskmanager').from('team_members')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ member: updatedMember })
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Get member details
    const { data: member } = await supabase
      .schema('taskmanager').from('team_members')
      .select('team_id, user_id, role')
      .eq('id', id)
      .single()

    if (!member) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 })
    }

    // Prevent self-removal
    if (member.user_id === user.id) {
      return NextResponse.json(
        { error: 'Sie können sich nicht selbst entfernen. Übertragen Sie zuerst die Admin-Rolle' },
        { status: 400 }
      )
    }

    // Check if this is the last admin
    if (member.role === 'admin') {
      const { count } = await supabase
        .schema('taskmanager').from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', member.team_id)
        .eq('role', 'admin')

      if (count === 1) {
        return NextResponse.json(
          { error: 'Es muss mindestens ein Admin im Team sein' },
          { status: 400 }
        )
      }
    }

    const { error } = await supabase
      .schema('taskmanager').from('team_members')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
