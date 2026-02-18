'use client'

import { useEffect, useState } from 'react'
import { Users, Mail, MoreVertical, UserPlus, Crown, Eye, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  user_id: string
  name: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

interface TeamInvitation {
  id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  expires_at: string
  created_at: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [newRole, setNewRole] = useState<'admin' | 'member' | 'viewer'>('member')

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch('/api/teams/members'),
        fetch('/api/teams/invitations'),
      ])

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.members || [])
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      toast.error('Fehler beim Laden der Team-Daten')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    try {
      const res = await fetch('/api/teams/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Fehler beim Versenden der Einladung')
        return
      }

      toast.success('Einladung wurde versendet!')
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('member')
      loadTeamData()
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    }
  }

  const handleRoleChange = async () => {
    if (!selectedMember) return

    try {
      const res = await fetch(`/api/teams/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Fehler beim Ändern der Rolle')
        return
      }

      toast.success('Rolle wurde aktualisiert!')
      setRoleDialogOpen(false)
      setSelectedMember(null)
      loadTeamData()
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    }
  }

  const handleRemoveMember = async () => {
    if (!selectedMember) return

    try {
      const res = await fetch(`/api/teams/members/${selectedMember.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Fehler beim Entfernen des Mitglieds')
        return
      }

      toast.success('Mitglied wurde entfernt')
      setRemoveDialogOpen(false)
      setSelectedMember(null)
      loadTeamData()
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/teams/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        toast.error('Fehler beim Zurückziehen der Einladung')
        return
      }

      toast.success('Einladung wurde zurückgezogen')
      loadTeamData()
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'member':
        return <Shield className="h-4 w-4" />
      case 'viewer':
        return <Eye className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'member':
        return 'secondary'
      case 'viewer':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Teammitglieder und Einladungen
          </p>
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Mitglied einladen
        </Button>
      </div>

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>Teammitglieder</CardTitle>
          <CardDescription>
            {members.length} {members.length === 1 ? 'Mitglied' : 'Mitglieder'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  <span className="mr-1">{getRoleIcon(member.role)}</span>
                  {member.role === 'admin' ? 'Admin' : member.role === 'member' ? 'Member' : 'Viewer'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMember(member)
                        setNewRole(member.role)
                        setRoleDialogOpen(true)
                      }}
                    >
                      Rolle ändern
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMember(member)
                        setRemoveDialogOpen(true)
                      }}
                      className="text-destructive"
                    >
                      Aus Team entfernen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ausstehende Einladungen</CardTitle>
            <CardDescription>
              {invitations.length} {invitations.length === 1 ? 'Einladung' : 'Einladungen'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Läuft ab am {new Date(invitation.expires_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(invitation.role)}>
                    {invitation.role === 'admin' ? 'Admin' : invitation.role === 'member' ? 'Member' : 'Viewer'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeInvitation(invitation.id)}
                  >
                    Zurückziehen
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teammitglied einladen</DialogTitle>
            <DialogDescription>
              Senden Sie eine Einladung an eine E-Mail-Adresse
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="max@beispiel.de"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Volle Rechte</SelectItem>
                  <SelectItem value="member">Member - Kann Projekte erstellen</SelectItem>
                  <SelectItem value="viewer">Viewer - Nur lesen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Einladung senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rolle ändern</DialogTitle>
            <DialogDescription>
              Ändern Sie die Rolle von {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">Neue Rolle</Label>
              <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Volle Rechte</SelectItem>
                  <SelectItem value="member">Member - Kann Projekte erstellen</SelectItem>
                  <SelectItem value="viewer">Viewer - Nur lesen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleRoleChange}>
              Rolle ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitglied entfernen?</DialogTitle>
            <DialogDescription>
              {selectedMember?.name} verliert den Zugriff auf alle Projekte.
              Zugewiesene Tasks werden auf "Nicht zugewiesen" gesetzt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
