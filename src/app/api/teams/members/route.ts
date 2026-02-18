import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const team_id = searchParams.get('team_id')

    if (!team_id) {
      return NextResponse.json({ error: 'Team-ID ist erforderlich' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: members, error } = await supabase
      .schema('taskmanager').from('team_members')
      .select(`
        *,
        user:profiles!user_id(id, name, email)
      `)
      .eq('team_id', team_id)
      .order('role')
      .order('created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ members })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
