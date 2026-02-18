import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('tsk_projects')
      .select(`
        *,
        team:teams(id, name),
        tasks:tasks(count)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const json = await request.json()
    const updates = updateProjectSchema.parse(json)

    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('tsk_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ project })
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

    // Check if project has tasks
    const { count } = await supabase
      .from('tsk_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Projekt kann nicht gelöscht werden, da es noch Tasks enthält. Bitte zuerst alle Tasks löschen' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('tsk_projects')
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
