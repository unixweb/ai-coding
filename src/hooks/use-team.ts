'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TeamMember {
  id: string
  user_id: string
  name: string
  email: string
  avatar_url: string | null
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export function useTeamMembers(teamId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    if (!teamId) {
      setMembers([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch(`/api/teams/members?team_id=${teamId}`)

      if (!res.ok) {
        throw new Error('Fehler beim Laden der Teammitglieder')
      }

      const data = await res.json()
      // Map API response to TeamMember format
      const membersWithAvatar = (data.members || []).map((m: any) => ({
        id: m.user?.id || m.user_id,
        user_id: m.user_id,
        name: m.user?.name || m.name || 'Unknown',
        email: m.user?.email || m.email || '',
        avatar_url: m.user?.avatar_url || m.avatar_url || null,
        role: m.role,
        created_at: m.created_at,
      }))
      setMembers(membersWithAvatar)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  return {
    members,
    isLoading,
    error,
    refetch: loadMembers,
  }
}
