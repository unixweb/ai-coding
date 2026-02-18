import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * TEMPORARY ROUTE: Creates a default team for the current user if they don't have one
 * This is a workaround for users created before the auto-team trigger was deployed
 *
 * DELETE THIS ROUTE after all users have teams!
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Check if user already has a team
    const { data: existingMembership, error: membershipError } = await supabase
      .schema('taskmanager')
      .schema('taskmanager').from('team_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    if (membershipError) {
      console.error('Error checking team membership:', membershipError)
      return NextResponse.json({ error: membershipError.message }, { status: 400 })
    }

    if (existingMembership) {
      return NextResponse.json({
        success: true,
        message: 'Sie haben bereits ein Team',
        alreadyHadTeam: true,
      })
    }

    // Create a default team for the user
    const teamName = user.email ? `${user.email}'s Team` : 'Mein Team'

    const { data: newTeam, error: teamError } = await supabase
      .schema('taskmanager')
      .schema('taskmanager').from('teams')
      .insert({ name: teamName })
      .select()
      .single()

    if (teamError) {
      console.error('Error creating team:', teamError)
      return NextResponse.json({ error: teamError.message }, { status: 400 })
    }

    // Add user as admin of their team
    const { error: memberError } = await supabase
      .schema('taskmanager')
      .schema('taskmanager').from('team_members')
      .insert({
        team_id: newTeam.id,
        user_id: user.id,
        role: 'admin',
      })

    if (memberError) {
      console.error('Error adding team member:', memberError)
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Team erfolgreich erstellt!',
      team: newTeam,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
