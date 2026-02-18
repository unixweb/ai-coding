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
      .from('tsk_team_members')
      .select('team_id')
      .eq('user_id', user.id)

    const teamIds = teamMembers?.map((tm) => tm.team_id) || []

    if (teamIds.length === 0) {
      return NextResponse.json({
        stats: {
          total_projects: 0,
          total_tasks: 0,
          tasks_by_status: { to_do: 0, in_progress: 0, completed: 0 },
          completion_rate: 0,
          overdue_tasks: 0,
        },
      })
    }

    // Get total active projects
    const { count: total_projects } = await supabase
      .from('tsk_projects')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)

    // Get project IDs first
    const { data: projects } = await supabase
      .from('tsk_projects')
      .select('id')
      .in('team_id', teamIds)

    const projectIds = projects?.map((p) => p.id) || []

    // Get all tasks for these projects
    const { data: allTasks } = projectIds.length > 0
      ? await supabase
          .from('tsk_tasks')
          .select('status, due_date')
          .in('project_id', projectIds)
      : { data: [] }

    const total_tasks = allTasks?.length || 0

    // Count by status
    const tasks_by_status = {
      to_do: allTasks?.filter((t) => t.status === 'to_do').length || 0,
      in_progress: allTasks?.filter((t) => t.status === 'in_progress').length || 0,
      completed: allTasks?.filter((t) => t.status === 'completed').length || 0,
    }

    // Completion rate
    const completion_rate =
      total_tasks > 0 ? Math.round((tasks_by_status.completed / total_tasks) * 100) : 0

    // Overdue tasks
    const today = new Date().toISOString().split('T')[0]
    const overdue_tasks =
      allTasks?.filter(
        (t) => t.due_date && t.due_date < today && t.status !== 'completed'
      ).length || 0

    return NextResponse.json({
      stats: {
        total_projects: total_projects || 0,
        total_tasks,
        tasks_by_status,
        completion_rate,
        overdue_tasks,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}
