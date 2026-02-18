'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task, TaskStatus, TaskFormData, TaskFilters } from '@/lib/types/task'
import { isAfter, isBefore, startOfDay, endOfDay, endOfWeek, startOfWeek } from 'date-fns'

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/tasks?project_id=${projectId}`)

      if (!res.ok) {
        throw new Error('Fehler beim Laden der Tasks')
      }

      const data = await res.json()
      setTasks(data.tasks || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      loadTasks()
    }
  }, [projectId, loadTasks])

  const createTask = useCallback(async (formData: TaskFormData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          assigned_to: formData.assigned_to || null,
          status: formData.status,
          due_date: formData.due_date || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen des Tasks')
      }

      const data = await res.json()
      setTasks(prev => [...prev, data.task])
      return data.task
    } catch (err) {
      throw err
    }
  }, [projectId])

  const updateTask = useCallback(async (taskId: string, formData: Partial<TaskFormData>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren des Tasks')
      }

      const data = await res.json()
      setTasks(prev => prev.map(t => t.id === taskId ? data.task : t))
      return data.task
    } catch (err) {
      throw err
    }
  }, [])

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    return updateTask(taskId, { status })
  }, [updateTask])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Löschen des Tasks')
      }

      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      throw err
    }
  }, [])

  return {
    tasks,
    isLoading,
    error,
    refetch: loadTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  }
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }

    // Assignee filter
    if (filters.assignee !== 'all' && task.assigned_to !== filters.assignee) {
      return false
    }

    // Due date filter
    if (filters.dueDate !== 'all' && task.due_date) {
      const dueDate = new Date(task.due_date)
      const now = new Date()

      switch (filters.dueDate) {
        case 'today': {
          const todayStart = startOfDay(now)
          const todayEnd = endOfDay(now)
          if (isBefore(dueDate, todayStart) || isAfter(dueDate, todayEnd)) {
            return false
          }
          break
        }
        case 'this_week': {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 })
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
          if (isBefore(dueDate, weekStart) || isAfter(dueDate, weekEnd)) {
            return false
          }
          break
        }
        case 'overdue': {
          if (!isBefore(dueDate, startOfDay(now))) {
            return false
          }
          break
        }
      }
    } else if (filters.dueDate === 'overdue' && !task.due_date) {
      return false
    } else if (filters.dueDate === 'today' && !task.due_date) {
      return false
    } else if (filters.dueDate === 'this_week' && !task.due_date) {
      return false
    }

    return true
  })
}
