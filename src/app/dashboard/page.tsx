'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface DashboardStats {
  total_projects: number
  total_tasks: number
  tasks_by_status: {
    to_do: number
    in_progress: number
    completed: number
  }
  completion_rate: number
  overdue_tasks: number
}

interface ProjectProgress {
  id: string
  name: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/project-progress'),
      ])

      if (!statsRes.ok || !progressRes.ok) {
        toast.error('Fehler beim Laden des Dashboards')
        return
      }

      const statsData = await statsRes.json()
      const progressData = await progressRes.json()

      setStats(statsData.stats)
      setProjects(progressData.projects || [])
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const hasProjects = stats.total_projects > 0
  const hasTasks = stats.total_tasks > 0

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht über alle Ihre Projekte und Tasks
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/projects">
            <Plus className="mr-2 h-4 w-4" />
            Neues Projekt
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_projects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_tasks} Tasks insgesamt
            </p>
          </CardContent>
        </Card>

        {/* Tasks by Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To Do</span>
                <Badge variant="secondary">{stats.tasks_by_status.to_do}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">In Progress</span>
                <Badge variant="default">{stats.tasks_by_status.in_progress}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <Badge variant="outline">{stats.tasks_by_status.completed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abschlussrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
            <Progress value={stats.completion_rate} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.tasks_by_status.completed} von {stats.total_tasks} erledigt
            </p>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className={stats.overdue_tasks > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.overdue_tasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue_tasks === 0
                ? 'Alle Tasks im Zeitplan'
                : 'Tasks benötigen Aufmerksamkeit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      {hasProjects && projects.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Projekt-Fortschritt</CardTitle>
            <CardDescription>
              Übersicht über den Fortschritt Ihrer Projekte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block space-y-2 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.completion_rate}%
                  </div>
                </div>
                <Progress value={project.completion_rate} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  {project.completed_tasks} von {project.total_tasks} Tasks erledigt
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : hasProjects ? (
        <Card>
          <CardHeader>
            <CardTitle>Projekt-Fortschritt</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Ihre Projekte haben noch keine Tasks
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-2 text-lg font-semibold">Noch keine Projekte</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Erstellen Sie Ihr erstes Projekt, um loszulegen
            </p>
            <Button asChild>
              <Link href="/projects">
                <Plus className="mr-2 h-4 w-4" />
                Erstes Projekt erstellen
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
