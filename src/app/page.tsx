'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile')
        if (res.ok) {
          // User is logged in, redirect to dashboard
          router.push('/dashboard')
        } else {
          // User is not logged in, show landing page
          setChecking(false)
        }
      } catch (error) {
        // Error checking auth, show landing page
        setChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Willkommen</CardTitle>
          <CardDescription>
            Projekt- und Task-Management für kleine Teams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Verwalten Sie Ihre Projekte, Tasks und Teams an einem Ort.
            Einfacher als Jira, leistungsstärker als Trello.
          </p>
          <div className="flex flex-col space-y-2">
            <Link href="/signup" className="w-full">
              <Button className="w-full" size="lg">
                Jetzt registrieren
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button className="w-full" variant="outline" size="lg">
                Anmelden
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
