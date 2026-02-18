'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Users, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projekte', href: '/projects', icon: FolderOpen },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Profil', href: '/profile', icon: User },
]

export function Navigation() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      toast.error('Fehler beim Abmelden')
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              TaskManager
            </Link>
            <div className="hidden md:flex md:gap-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>
    </nav>
  )
}
