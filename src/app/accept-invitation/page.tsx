'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Users, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

// Force dynamic rendering because we use searchParams
export const dynamic = 'force-dynamic'

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [valid, setValid] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Kein gültiger Einladungslink')
      setLoading(false)
      return
    }

    // In a real implementation, you would validate the token here
    // For now, we'll just set it as valid
    setValid(true)
    setTeamName('Ihr Team')
    setRole('member')
    setLoading(false)
  }, [token])

  const handleAccept = async () => {
    if (!token) return

    setAccepting(true)

    try {
      const res = await fetch('/api/teams/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Fehler beim Annehmen der Einladung')
        setError(data.error || 'Einladung konnte nicht angenommen werden')
        return
      }

      toast.success('Einladung angenommen!')
      router.push('/projects')
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !valid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Ungültige Einladung</CardTitle>
            </div>
            <CardDescription>
              {error || 'Diese Einladung ist abgelaufen oder ungültig'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Team-Einladung</CardTitle>
          </div>
          <CardDescription>
            Sie wurden eingeladen, einem Team beizutreten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Team:</span>
              <span className="font-medium">{teamName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rolle:</span>
              <Badge>
                {role === 'admin' ? 'Admin' : role === 'member' ? 'Member' : 'Viewer'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {accepting ? 'Wird angenommen...' : 'Einladung annehmen'}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={accepting}
              className="w-full"
            >
              Ablehnen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
