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

    if (projectIds.length === 0) {
      return NextResponse.json({
        stats: {
          total_projects: total_projects || 0,
          total_tasks: 0,
          tasks_by_status: { to_do: 0, in_progress: 0, completed: 0 },
          completion_rate: 0,
          overdue_tasks: 0,
        },
      })
    }

    // Use database-level COUNT instead of loading all tasks into memory
    const today = new Date().toISOString().split('T')[0]

    // Get total tasks count
    const { count: total_tasks } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)

    // Count by status using separate queries (more efficient than loading all data)
    const { count: to_do_count } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('status', 'to_do')

    const { count: in_progress_count } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('status', 'in_progress')

    const { count: completed_count } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('status', 'completed')

    const tasks_by_status = {
      to_do: to_do_count || 0,
      in_progress: in_progress_count || 0,
      completed: completed_count || 0,
    }

    // Completion rate
    const completion_rate =
      total_tasks && total_tasks > 0
        ? Math.round(((completed_count || 0) / total_tasks) * 100)
        : 0

    // Count overdue tasks (due_date < today AND status != completed)
    const { count: overdue_tasks } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .lt('due_date', today)
      .neq('status', 'completed')

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
