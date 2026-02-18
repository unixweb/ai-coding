'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, CheckCircle2, Clock, AlertTriangle, TrendingUp, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/types/task'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

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

interface Task {
  id: string
  project_id: string
  project_name?: string
  title: string
  description: string
  status: 'to_do' | 'in_progress' | 'completed'
  assigned_to: string | null
  due_date: string | null
  created_at: string
}

interface TeamMember {
  id: string
  user_id: string
  name: string
}

type FilterStatus = 'all' | 'to_do' | 'in_progress' | 'completed'
type FilterDueDate = 'all' | 'today' | 'this_week' | 'overdue'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<ProjectProgress[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [dueDateFilter, setDueDateFilter] = useState<FilterDueDate>('all')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [statsRes, progressRes, tasksRes, membersRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/project-progress'),
        fetch('/api/tasks'),
        fetch('/api/teams/members'),
      ])

      if (!statsRes.ok || !progressRes.ok) {
        toast.error('Fehler beim Laden des Dashboards')
        return
      }

      const statsData = await statsRes.json()
      const progressData = await progressRes.json()
      const tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] }
      const membersData = membersRes.ok ? await membersRes.json() : { members: [] }

      setStats(statsData.stats)
      setProjects(progressData.projects || [])
      setTasks(tasksData.tasks || [])
      setTeamMembers(membersData.members || [])
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false
      }

      // Assignee filter
      if (assigneeFilter !== 'all' && task.assigned_to !== assigneeFilter) {
        return false
      }

      // Due date filter
      if (dueDateFilter !== 'all') {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        switch (dueDateFilter) {
          case 'today':
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            if (dueDate < today || dueDate >= tomorrow) return false
            break
          case 'this_week':
            const weekEnd = new Date(today)
            weekEnd.setDate(weekEnd.getDate() + 7)
            if (dueDate < today || dueDate >= weekEnd) return false
            break
          case 'overdue':
            if (dueDate >= today || task.status === 'completed') return false
            break
        }
      }

      return true
    })
  }, [tasks, statusFilter, assigneeFilter, dueDateFilter])

  const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || dueDateFilter !== 'all'

  const clearFilters = () => {
    setStatusFilter('all')
    setAssigneeFilter('all')
    setDueDateFilter('all')
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
        <Card className={stats.completion_rate === 100 && stats.total_tasks > 0 ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abschlussrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completion_rate}%</div>
            <Progress value={stats.completion_rate} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.completion_rate === 100 && stats.total_tasks > 0 ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  🎉 Herzlichen Glückwunsch! Alle Tasks abgeschlossen!
                </span>
              ) : (
                `${stats.tasks_by_status.completed} von ${stats.total_tasks} erledigt`
              )}
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

      {/* Task Filters and List */}
      {hasTasks && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Meine Tasks</CardTitle>
                <CardDescription>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
                  {hasActiveFilters && ' (gefiltert)'}
                </CardDescription>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(v: FilterStatus) => setStatusFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Zuständig" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Personen</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dueDateFilter} onValueChange={(v: FilterDueDate) => setDueDateFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Fälligkeit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Termine</SelectItem>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="this_week">Diese Woche</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters
                      ? 'Keine Tasks gefunden. Passen Sie die Filter an.'
                      : 'Noch keine Tasks vorhanden.'}
                  </p>
                </div>
              ) : (
                filteredTasks.slice(0, 10).map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project_id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={TASK_STATUS_COLORS[task.status]}>
                            {TASK_STATUS_LABELS[task.status]}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.project_name && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {task.project_name}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`flex items-center gap-1 ${
                              new Date(task.due_date) < new Date() && task.status !== 'completed'
                                ? 'text-destructive font-medium'
                                : ''
                            }`}>
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.due_date), 'dd. MMM yyyy', { locale: de })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
              {filteredTasks.length > 10 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ... und {filteredTasks.length - 10} weitere Tasks
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
