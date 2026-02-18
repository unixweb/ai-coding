import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    // Get user's teams
    const { data: teamMembers } = await supabase
      .schema('taskmanager').from('team_members')
      .select('team_id')
      .eq('user_id', user.id)

    const teamIds = teamMembers?.map((tm) => tm.team_id) || []

    if (teamIds.length === 0) {
      return NextResponse.json({ projects: [] })
    }

    // Get all active projects with task counts
    const { data: projects } = await supabase
      .schema('taskmanager').from('projects')
      .select(`
        id,
        name,
        tasks:tasks(id, status)
      `)
      .in('team_id', teamIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Calculate progress for each project
    const projectsWithProgress = projects?.map((project) => {
      const total_tasks = project.tasks?.length || 0
      const completed_tasks =
        project.tasks?.filter((t: any) => t.status === 'completed').length || 0
      const progress = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0

      return {
        id: project.id,
        name: project.name,
        total_tasks,
        completed_tasks,
        progress,
      }
    }) || []

    // Sort by progress (least progress first - projects needing attention)
    projectsWithProgress.sort((a, b) => a.progress - b.progress)

    return NextResponse.json({ projects: projectsWithProgress })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
