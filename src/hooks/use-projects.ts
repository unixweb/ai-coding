'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Project {
  id: string
  team_id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/projects')

      if (!res.ok) {
        throw new Error('Fehler beim Laden der Projekte')
      }

      const data = await res.json()
      setProjects(data.projects || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const createProject = useCallback(async (projectData: { name: string; description?: string }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Erstellen des Projekts')
      }

      const data = await res.json()
      setProjects(prev => [...prev, data.project])
      return data.project
    } catch (err) {
      throw err
    }
  }, [])

  const updateProject = useCallback(async (projectId: string, updates: { name?: string; description?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Aktualisieren des Projekts')
      }

      const data = await res.json()
      setProjects(prev => prev.map(p => p.id === projectId ? data.project : p))
      return data.project
    } catch (err) {
      throw err
    }
  }, [])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fehler beim Löschen des Projekts')
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      throw err
    }
  }, [])

  return {
    projects,
    isLoading,
    error,
    refetch: loadProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/projects/${projectId}`)

        if (!res.ok) {
          throw new Error('Projekt nicht gefunden')
        }

        const data = await res.json()
        setProject(data.project)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
        setProject(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId])

  return {
    project,
    isLoading,
    error,
  }
}
