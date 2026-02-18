import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/teams/current
 * Returns the current user's team (the first team they are a member of)
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Get user's team membership
    const { data: membership, error: membershipError } = await supabase
      .from('tsk_team_members')
      .select(`
        team_id,
        role,
        team:tsk_teams!team_id(id, name)
      `)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 })
    }

    if (!membership) {
      return NextResponse.json({ error: 'Kein Team gefunden' }, { status: 404 })
    }

    return NextResponse.json({
      team_id: membership.team_id,
      role: membership.role,
      team: membership.team,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
