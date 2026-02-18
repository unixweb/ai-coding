import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
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
