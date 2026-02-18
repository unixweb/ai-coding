import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createTaskSchema = z.object({
  project_id: z.string().uuid('Ungültige Projekt-ID'),
  title: z.string().min(1, 'Task-Titel ist erforderlich').max(200, 'Task-Titel darf maximal 200 Zeichen lang sein'),
  description: z.string().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  status: z.enum(['to_do', 'in_progress', 'completed']).default('to_do'),
  due_date: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project_id = searchParams.get('project_id')
    const status = searchParams.get('status')
    const assigned_to = searchParams.get('assigned_to')
    const overdue = searchParams.get('overdue')

    const supabase = await createClient()

    let query = supabase
      .from('tsk_tasks')
      .select(`
        *,
        project:tsk_projects(id, name),
        assignee:profiles!assigned_to(id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (project_id) {
      query = query.eq('project_id', project_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to)
    }

    if (overdue === 'true') {
      query = query.lt('due_date', new Date().toISOString().split('T')[0]).neq('status', 'completed')
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ tasks })
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
    const data = createTaskSchema.parse(json)

    const supabase = await createClient()

    const { data: task, error } = await supabase
      .from('tsk_tasks')
      .insert(data)
      .select(`
        *,
        project:tsk_projects(id, name),
        assignee:profiles!assigned_to(id, name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ task }, { status: 201 })
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
