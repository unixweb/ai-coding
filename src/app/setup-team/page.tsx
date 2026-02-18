'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SetupTeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetupTeam = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/teams/setup', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen des Teams')
        toast.error(data.error || 'Fehler beim Erstellen des Teams')
        return
      }

      if (data.alreadyHadTeam) {
        toast.success('Du hast bereits ein Team!')
        setSuccess(true)
      } else {
        toast.success('Team erfolgreich erstellt! 🎉')
        setSuccess(true)
      }

      // Redirect to projects after 2 seconds
      setTimeout(() => {
        router.push('/projects')
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle className="text-green-500">Team erstellt!</CardTitle>
            </div>
            <CardDescription>
              Dein Team wurde erfolgreich erstellt. Du wirst gleich weitergeleitet...
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/projects')} className="w-full">
              Jetzt Projekt erstellen
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team-Setup erforderlich</CardTitle>
          <CardDescription>
            Um Projekte erstellen zu können, benötigst du ein Team. Klicke auf den Button
            unten um automatisch ein Team für dich zu erstellen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Was passiert:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ein persönliches Team wird für dich erstellt</li>
              <li>Du wirst automatisch als Admin hinzugefügt</li>
              <li>Du kannst sofort Projekte erstellen</li>
            </ul>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive p-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">Fehler:</p>
                  <p className="text-destructive/80">{error}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Hinweis: Wenn der Fehler "permission denied" lautet, muss die SQL-Migration 007 ausgeführt werden.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            onClick={handleSetupTeam}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Erstelle Team...
              </>
            ) : (
              'Team jetzt erstellen'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            disabled={loading}
          >
            Abbrechen
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
