'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile')
      const data = await res.json()

      if (!res.ok) {
        // Show the actual error message instead of redirecting
        const errorMsg = `${data.error || 'Unbekannter Fehler'} (HTTP ${res.status}${data.code ? ', Code: ' + data.code : ''})`
        console.error('Profile load error:', { status: res.status, data })
        setLoadError(errorMsg)
        toast.error(errorMsg, { duration: 10000 })

        // Only redirect if actually not authenticated (401)
        if (res.status === 401) {
          setTimeout(() => router.push('/login'), 2000)
        }
        return
      }

      setFormData({
        name: data.profile?.name || '',
        email: data.user?.email || data.profile?.email || '',
      })
      setLoadError(null)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unbekannt'
      console.error('Unexpected error loading profile:', error)
      setLoadError(errorMsg)
      toast.error('Ein Fehler ist aufgetreten: ' + errorMsg)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Fehler beim Aktualisieren')
        return
      }

      toast.success('Profil aktualisiert!')
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      toast.error('Fehler beim Abmelden')
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profil wird geladen...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Fehler beim Laden des Profils</CardTitle>
            <CardDescription className="text-sm">
              {loadError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Mögliche Lösungen:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Führe die SQL-Migration 005 in Supabase aus (siehe Git Commit)</li>
                <li>Oder warte bis ein Admin die Datenbank-Migrationen deployed hat</li>
                <li>Prüfe die Browser Console (F12) für Details</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLoadError(null)
                setLoadingProfile(true)
                loadProfile()
              }}
              className="flex-1"
            >
              Erneut versuchen
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Zum Dashboard
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
          <CardTitle>Mein Profil</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Kontoinformationen
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ihr Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wird gespeichert...' : 'Profil speichern'}
            </Button>
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/projects')}
              >
                Zu Projekten
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
              >
                Abmelden
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
