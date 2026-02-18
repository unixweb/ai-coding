# PROJ-4: Team-Zusammenarbeit

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-18

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - Nur eingeloggte Benutzer können Teams verwalten

## User Stories
- Als Projekt-Admin möchte ich Teammitglieder per E-Mail einladen können, damit sie am Projekt mitarbeiten können
- Als Benutzer möchte ich alle Teammitglieder sehen, damit ich weiß, wer im Team ist
- Als Admin möchte ich Teammitgliedern Rollen zuweisen können (Admin, Member, Viewer), damit Berechtigungen klar sind
- Als Admin möchte ich Teammitglieder aus dem Team entfernen können, damit nur aktive Mitglieder Zugriff haben
- Als eingeladenes Teammitglied möchte ich die Einladung annehmen können, damit ich dem Team beitrete

## Acceptance Criteria
- [ ] Admin kann Teammitglieder per E-Mail-Adresse einladen
- [ ] Einladungs-E-Mail enthält einen Link zum Akzeptieren der Einladung
- [ ] Eingeladene Person erhält Zugriff auf alle Projekte des Teams
- [ ] Admin kann Rollen zuweisen: Admin (volle Rechte), Member (kann Projekte/Tasks erstellen), Viewer (nur lesen)
- [ ] Benutzer sieht eine Liste aller Teammitglieder mit Name, E-Mail und Rolle
- [ ] Admin kann Teammitglieder aus dem Team entfernen (mit Bestätigungsmeldung)
- [ ] Beim Entfernen werden alle Zuweisungen des Mitglieds auf "Nicht zugewiesen" gesetzt
- [ ] Einladungen sind 7 Tage gültig
- [ ] Benutzer kann ausstehende Einladungen sehen und zurückziehen
- [ ] Der erste Benutzer, der ein Konto erstellt, wird automatisch Admin

## Edge Cases
- Was passiert, wenn ein Admin versucht, eine bereits registrierte E-Mail einzuladen?
  → Benutzer wird direkt dem Team hinzugefügt (keine neue Registrierung nötig)
- Was passiert, wenn eine Einladungs-E-Mail abgelaufen ist?
  → Fehlermeldung: "Diese Einladung ist abgelaufen. Bitte fordern Sie eine neue an"
- Was passiert, wenn ein Admin sich selbst aus dem Team entfernen will?
  → Fehlermeldung: "Sie können sich nicht selbst entfernen. Übertragen Sie zuerst die Admin-Rolle"
- Was passiert, wenn der letzte Admin aus dem Team entfernt wird?
  → Verhindert: "Es muss mindestens ein Admin im Team sein"
- Was passiert, wenn ein Viewer versucht, ein Projekt zu erstellen?
  → Fehlermeldung: "Sie haben keine Berechtigung, Projekte zu erstellen"
- Was passiert, wenn eine E-Mail-Adresse mehrmals eingeladen wird?
  → Fehlermeldung: "Diese E-Mail-Adresse wurde bereits eingeladen"

## Technical Requirements
- **Performance:** Teammitglieder-Liste lädt in < 200ms
- **Security:**
  - Row Level Security (RLS): Nur Admins können Teammitglieder einladen/entfernen
  - Nur Members und Admins können Projekte/Tasks erstellen
  - Viewers haben nur Lesezugriff
- **Database:**
  - Tabelle: team_members (id, user_id, team_id, role, created_at)
  - Tabelle: team_invitations (id, email, team_id, role, token, expires_at, created_at)
  - Index auf user_id, team_id
- **Email:** Supabase Auth für Einladungs-E-Mails
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Added:** 2026-02-15

### Komponenten-Struktur

```
Team-Verwaltungs-System
│
├── Team-Seite (/team)
│   ├── Team-Header
│   │   ├── Team-Name (editierbar für Admins)
│   │   └── "Mitglied einladen"-Button (nur für Admins)
│   │
│   ├── Aktive Teammitglieder-Liste
│   │   ├── Teammitglied-Card (wiederverwendbar)
│   │   │   ├── Avatar (Initialen oder Foto)
│   │   │   ├── Name & E-Mail
│   │   │   ├── Rollen-Badge (Admin/Member/Viewer)
│   │   │   ├── Beitrittsdatum
│   │   │   └── Aktions-Menü (3-Punkte, nur für Admins)
│   │   │       ├── "Rolle ändern" (Submenu: Admin, Member, Viewer)
│   │   │       └── "Aus Team entfernen"
│   │   └── Sortierung: Admins zuerst, dann alphabetisch
│   │
│   ├── Ausstehende Einladungen-Sektion (kollapsierbar)
│   │   ├── Einladungs-Card
│   │   │   ├── E-Mail-Adresse
│   │   │   ├── Rolle (Badge)
│   │   │   ├── Ablaufdatum (z.B. "Läuft ab in 3 Tagen")
│   │   │   ├── "Einladung zurückziehen"-Button
│   │   │   └── "Einladung erneut senden"-Button
│   │   └── Leerer Zustand: "Keine ausstehenden Einladungen"
│   │
│   └── Leerer Zustand (wenn nur 1 Mitglied)
│       ├── Illustration/Icon
│       ├── Text: "Laden Sie Ihr Team ein"
│       └── "Erstes Mitglied einladen"-Button
│
├── Mitglied-Einladen-Dialog (Modal)
│   ├── Titel: "Teammitglied einladen"
│   ├── E-Mail-Adresse-Eingabefeld (Pflichtfeld)
│   ├── Rolle-Select (Admin, Member, Viewer - Standard: Member)
│   ├── Rollen-Erklärung (Info-Box)
│   │   ├── Admin: Volle Rechte, kann Mitglieder verwalten
│   │   ├── Member: Kann Projekte & Tasks erstellen
│   │   └── Viewer: Nur lesen, keine Bearbeitung
│   ├── "Abbrechen"-Button
│   └── "Einladung senden"-Button
│
├── Rolle-Ändern-Dialog (Modal)
│   ├── Titel: "Rolle von [Name] ändern"
│   ├── Aktuell: [Aktuelle Rolle]
│   ├── Neue Rolle-Select (Admin, Member, Viewer)
│   ├── Warnung (wenn letzter Admin zu Member/Viewer wird):
│   │   "Achtung: Dies ist der letzte Admin. Es muss mindestens ein Admin bleiben."
│   ├── "Abbrechen"-Button
│   └── "Rolle ändern"-Button
│
├── Mitglied-Entfernen-Bestätigungs-Dialog
│   ├── Titel: "Mitglied entfernen?"
│   ├── Warntext: "[Name] verliert Zugriff auf alle Projekte"
│   ├── Info: "Zugewiesene Tasks werden auf 'Nicht zugewiesen' gesetzt"
│   ├── Warnung (wenn letzter Admin): "Verhindert - es muss mindestens ein Admin bleiben"
│   ├── "Abbrechen"-Button
│   └── "Entfernen"-Button (rot, disabled wenn letzter Admin)
│
├── Einladungs-Akzeptieren-Seite (/accept-invitation?token=xxx)
│   ├── Team-Info (Name, Anzahl Mitglieder)
│   ├── Einladung-Details (Rolle, von wem eingeladen)
│   ├── Ablaufdatum-Warnung (wenn < 24h)
│   ├── "Einladung annehmen"-Button
│   ├── "Ablehnen"-Button
│   └── Error-State (wenn Token abgelaufen oder ungültig)
│
└── Berechtigungs-Prüfung-Komponenten (unsichtbar)
    ├── Admin-Guard (zeigt Content nur für Admins)
    ├── Member-Guard (zeigt Content nur für Members+Admins)
    └── Viewer-Guard (zeigt Content für alle)
```

**Zusätzlich:**
- E-Mail-Vorlagen (Einladungs-E-Mail)
- Loading-States (Skeleton)
- Error-Handling (Toast)
- Real-time Updates (Mitglieder-Liste)

### Datenmodell

**Team-Informationen (Supabase PostgreSQL):**

**1. Teams-Tabelle:**
- Team-ID (UUID)
- Team-Name (editierbar)
- Erstelldatum

**2. Team-Mitglieder (team_members):**
- Eindeutige ID (UUID)
- User-ID (aus PROJ-1)
- Team-ID
- Rolle (Admin / Member / Viewer)
- Beitrittsdatum

**3. Einladungen (team_invitations):**
- Einladungs-ID (UUID)
- E-Mail-Adresse
- Team-ID
- Rolle (Admin / Member / Viewer)
- Einladungs-Token (UUID für Accept-Link)
- Ablaufdatum (erstellt + 7 Tage)
- Eingeladen von (User-ID)
- Erstelldatum
- Status (Pending / Accepted / Expired / Revoked)

**Rollen-Berechtigungen:**
- **Admin:** Volle Rechte
- **Member:** Projekte & Tasks erstellen/bearbeiten
- **Viewer:** Nur lesen

**Speicherort:** Supabase PostgreSQL

**Sicherheit:** Row Level Security (rollenbasiert)

### Tech-Entscheidungen

**1. Supabase Auth für Einladungs-E-Mails**
- E-Mail-Versand bereits integriert (PROJ-1)
- Kostenlos im Free-Tier
- Keine zusätzliche Integration nötig

**2. Token-basierte Einladungen (UUID)**
- Sicherer als E-Mail im Link
- Einmalig verwendbar, läuft ab
- Verhindert Phishing

**3. Row Level Security für Rollen**
- Sicherheit auf Datenbank-Ebene
- Viewer können keine Projekte erstellen (auch via API nicht)
- Admins sehen alle Daten

**4. Automatischer Admin für ersten Benutzer**
- Löst Bootstrap-Problem
- Ältester User im Team = Admin

**5. "Mindestens ein Admin"-Regel**
- Verhindert Aussperren
- Frontend-Validierung + Backend-Constraint

**6. Soft-Delete für Task-Zuweisungen**
- Tasks bleiben bestehen
- assigned_to → NULL (SET NULL)
- Keine Datenverlust

**7. Ablaufende Einladungen (7 Tage)**
- Sicherheit (alte Links ungültig)
- Kann erneut gesendet werden

### Benötigte Pakete

**Keine neuen Pakete erforderlich!**

Alle bereits vorhanden:
- `@supabase/supabase-js`, `@supabase/ssr` (PROJ-1)
- `react-hook-form`, `@hookform/resolvers`, `zod` (PROJ-1)
- `date-fns` (PROJ-3)
- shadcn/ui: Card, Button, Dialog, Select, Badge, Avatar, Toast

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Admin kann Teammitglieder per E-Mail-Adresse einladen
- [x] Invite dialog exists on /team page with email input and role select
- [x] POST /api/teams/invitations validates with Zod and creates invitation
- [ ] BUG: The invite dialog does NOT include a team_id in the request body (team/page.tsx line 98). The API requires team_id (Zod schema) but the frontend sends only { email, role } without team_id. This will cause a 400 validation error.

#### AC-2: Einladungs-E-Mail enthaelt einen Link zum Akzeptieren der Einladung
- [ ] BUG: Invitation emails are NOT sent. The API has a TODO comment (line 104 of invitations/route.ts): "TODO: Send invitation email via Supabase". No email sending is implemented.

#### AC-3: Eingeladene Person erhaelt Zugriff auf alle Projekte des Teams
- [x] Accept invitation API adds user to team_members with the invitation's role
- [x] RLS policies grant project access based on team membership

#### AC-4: Admin kann Rollen zuweisen: Admin, Member, Viewer
- [x] Role change dialog with select dropdown (Admin, Member, Viewer)
- [x] PUT /api/teams/members/[id] validates role enum
- [x] Last admin protection: API prevents changing the last admin's role

#### AC-5: Benutzer sieht eine Liste aller Teammitglieder mit Name, E-Mail und Rolle
- [x] Team page lists members with Avatar, Name, Email, Role badge
- [ ] BUG: The GET /api/teams/members requires a team_id query parameter, but the frontend calls /api/teams/members WITHOUT team_id (team/page.tsx line 73). This will return a 400 error "Team-ID ist erforderlich".

#### AC-6: Admin kann Teammitglieder aus dem Team entfernen (mit Bestaetigungsmeldung)
- [x] Remove member dialog with destructive "Entfernen" button
- [x] API DELETE prevents self-removal and last admin removal
- [x] Dialog description warns about lost access

#### AC-7: Beim Entfernen werden alle Zuweisungen des Mitglieds auf "Nicht zugewiesen" gesetzt
- [ ] BUG: The DELETE /api/teams/members/[id] route does NOT update task assignments (assigned_to) to NULL when a member is removed. The database uses ON DELETE CASCADE on team_members, but the tasks.assigned_to references auth.users (not team_members) with ON DELETE SET NULL. This means assignments only get nulled if the USER is deleted from auth, not when they are removed from a TEAM. Team removal does not trigger SET NULL on task assignments.

#### AC-8: Einladungen sind 7 Tage gueltig
- [x] Database: expires_at defaults to NOW() + INTERVAL '7 days'
- [x] Accept API checks expiry: new Date(invitation.expires_at) < new Date()
- [x] Expired invitations get status updated to 'expired'

#### AC-9: Benutzer kann ausstehende Einladungen sehen und zurueckziehen
- [x] Pending invitations section shown on team page
- [x] "Zurueckziehen" button on each invitation card
- [x] DELETE /api/teams/invitations/[id] removes invitation
- [ ] BUG: GET /api/teams/invitations also requires team_id query parameter but frontend calls without it (team/page.tsx line 74), same issue as AC-5.

#### AC-10: Der erste Benutzer, der ein Konto erstellt, wird automatisch Admin
- [x] Database trigger create_default_team_for_user() creates a team and adds user as admin on signup
- [x] This is handled at the database level via trigger

### Edge Cases Status

#### EC-1: Already registered email invited
- [x] API checks for existing team member, but...
- [ ] BUG: The existing member check on line 62 of invitations/route.ts checks user_id = CURRENT USER's id, not the invited email's user_id. It should look up the user by email and check if that user is already a member. Currently it checks if the INVITER is a member, which will always be true.

#### EC-2: Expired invitation
- [x] Accept API checks expiry and returns "Diese Einladung ist abgelaufen"

#### EC-3: Admin tries to remove self
- [x] API returns "Sie koennen sich nicht selbst entfernen"

#### EC-4: Last admin removal
- [x] API returns "Es muss mindestens ein Admin im Team sein"

#### EC-5: Viewer tries to create project
- [x] RLS policy restricts INSERT to admin and member roles

#### EC-6: Email invited multiple times
- [x] API checks for existing pending invitation with same email+team_id

### Security Audit Results
- [x] Authentication: Team invitation accept requires logged-in user
- [ ] BUG: Invitation DELETE at /api/teams/invitations/[id] checks auth but does NOT verify that the current user is an ADMIN of the team that owns the invitation. Any authenticated user could delete any invitation by ID if they know or guess the UUID.
- [ ] BUG: The GET /api/teams/members and GET /api/teams/invitations routes do not explicitly verify the requesting user is a member/admin of the team being queried. They pass team_id as a query param and rely solely on RLS. An attacker could enumerate team data by trying different team_ids.
- [x] Token-based invitations use UUID, single-use
- [x] Invitation status checked (must be 'pending' to accept)
- [ ] BUG: The accept-invitation page does NOT validate the token server-side before rendering. It always shows "valid" (line 33: setValid(true)) regardless of token validity. Real validation only happens when the user clicks "Accept".

### Bugs Found

#### BUG-23: Missing team_id in invitation request
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Go to /team
  2. Click "Mitglied einladen"
  3. Fill email and role, click send
  4. Expected: Invitation created
  5. Actual: 400 error because team_id is not included in the request body
- **Priority:** Fix before deployment

#### BUG-24: No invitation email sent
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Create an invitation via API
  2. Expected: Invited user receives email with accept link
  3. Actual: No email sent (TODO in code)
- **Priority:** Fix before deployment

#### BUG-25: Missing team_id in team members and invitations GET requests
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Go to /team page
  2. Expected: Team members and invitations loaded
  3. Actual: 400 errors because team_id query parameter is not provided
- **Priority:** Fix before deployment

#### BUG-26: Task assignments not nulled when member removed from team
- **Severity:** High
- **Steps to Reproduce:**
  1. Assign tasks to a team member
  2. Remove that member from the team
  3. Expected: Their task assignments become "Nicht zugewiesen"
  4. Actual: Tasks remain assigned to the removed user's ID
- **Priority:** Fix before deployment

#### BUG-27: Wrong field checked for duplicate member detection
- **Severity:** High
- **Steps to Reproduce:**
  1. Invite a user who is already a team member
  2. Expected: "Dieser Benutzer ist bereits Mitglied des Teams"
  3. Actual: Check compares inviter's user_id instead of invited user's email/user_id
- **Priority:** Fix before deployment

#### BUG-28: Invitation delete lacks admin authorization check
- **Severity:** High
- **Steps to Reproduce:**
  1. As a non-admin user, send DELETE /api/teams/invitations/{id}
  2. Expected: 403 Forbidden
  3. Actual: Invitation deleted if user is authenticated (any role)
- **Priority:** Fix before deployment

#### BUG-29: Accept-invitation page shows valid state without server validation
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Visit /accept-invitation?token=any-random-uuid
  2. Expected: Token validated server-side, invalid/expired tokens show error
  3. Actual: Page always shows "valid" invitation with hardcoded team name "Ihr Team"
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 4/10 passed
- **Bugs Found:** 7 total (3 critical, 3 high, 1 medium)
- **Security:** Issues found (missing authorization on invitation delete, missing team_id validation)
- **Production Ready:** NO
- **Recommendation:** The team management feature has serious integration issues. The frontend is not properly connected to the API (missing team_id parameters, no email sending). Fix critical bugs first.

## Deployment
_To be added by /deploy_
