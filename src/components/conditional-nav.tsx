'use client'

import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

const authenticatedRoutes = ['/dashboard', '/projects', '/team', '/profile']

export function ConditionalNav() {
  const pathname = usePathname()

  // Show navigation only on authenticated routes
  const showNav = authenticatedRoutes.some(route =>
    pathname === route || pathname?.startsWith(route + '/')
  )

  if (!showNav) {
    return null
  }

  return <Navigation />
}
