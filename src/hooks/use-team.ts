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

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/teams/members')

      if (!res.ok) {
        throw new Error('Fehler beim Laden der Teammitglieder')
      }

      const data = await res.json()
      // Ensure avatar_url is set (defaults to null if not present)
      const membersWithAvatar = (data.members || []).map((m: any) => ({
        ...m,
        avatar_url: m.avatar_url || null,
      }))
      setMembers(membersWithAvatar)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

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
