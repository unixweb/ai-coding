import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Projektname ist erforderlich').max(100, 'Projektname darf maximal 100 Zeichen lang sein'),
  description: z.string().optional(),
  team_id: z.string().uuid('Ungültige Team-ID').optional(),
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from('tsk_projects')
      .select(`
        *,
        team:tsk_teams(id, name),
        tasks:tsk_tasks(count)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ projects })
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
    let { name, description, team_id } = createProjectSchema.parse(json)

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // If no team_id provided, use user's first team
    if (!team_id) {
      const { data: membership, error: membershipError } = await supabase
        .from('tsk_team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (membershipError || !membership) {
        return NextResponse.json(
          { error: 'Sie sind keinem Team zugeordnet. Bitte kontaktieren Sie einen Administrator.' },
          { status: 400 }
        )
      }

      team_id = membership.team_id
    }

    const { data: project, error } = await supabase
      .from('tsk_projects')
      .insert({ name, description, team_id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ project }, { status: 201 })
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
