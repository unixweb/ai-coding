# PROJ-2: Projekt-Verwaltung

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-18

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - Nur eingeloggte Benutzer können Projekte erstellen und verwalten

## User Stories
- Als eingeloggter Benutzer möchte ich ein neues Projekt erstellen können, damit ich meine Arbeit organisieren kann
- Als Benutzer möchte ich alle meine Projekte in einer Übersicht sehen, damit ich schnell darauf zugreifen kann
- Als Benutzer möchte ich ein Projekt bearbeiten können (Name, Beschreibung ändern), damit ich es aktualisieren kann
- Als Benutzer möchte ich ein Projekt archivieren können, damit abgeschlossene Projekte nicht mehr in der aktiven Liste erscheinen
- Als Benutzer möchte ich ein Projekt löschen können, damit ich nicht mehr benötigte Projekte entfernen kann

## Acceptance Criteria
- [ ] Benutzer kann ein neues Projekt mit Name (Pflichtfeld) und Beschreibung (optional) erstellen
- [ ] Projekt erhält automatisch einen Status (Active, Archived)
- [ ] Benutzer sieht eine Liste aller seiner Projekte (nur Active standardmäßig)
- [ ] Projektliste zeigt Name, Beschreibung (gekürzt), Erstelldatum und Anzahl der Tasks
- [ ] Benutzer kann Projektdetails bearbeiten (Name, Beschreibung, Status)
- [ ] Benutzer kann ein Projekt archivieren (Status → Archived)
- [ ] Archivierte Projekte können über einen Filter angezeigt werden
- [ ] Benutzer kann ein Projekt löschen (nur wenn es keine Tasks enthält)
- [ ] Beim Löschen erscheint eine Bestätigungsmeldung
- [ ] Projekte sind nach Erstelldatum sortiert (neueste zuerst)

## Edge Cases
- Was passiert, wenn ein Benutzer versucht, ein Projekt ohne Namen zu erstellen?
  → Fehlermeldung: "Projektname ist erforderlich"
- Was passiert, wenn ein Benutzer versucht, ein Projekt zu löschen, das noch Tasks enthält?
  → Fehlermeldung: "Projekt kann nicht gelöscht werden, da es noch Tasks enthält. Bitte zuerst alle Tasks löschen"
- Was passiert, wenn ein Benutzer noch keine Projekte hat?
  → Leerer Zustand mit Call-to-Action: "Erstellen Sie Ihr erstes Projekt"
- Was passiert, wenn ein Benutzer versucht, ein archiviertes Projekt zu bearbeiten?
  → Projekt kann bearbeitet und wieder auf Active gesetzt werden
- Was passiert, wenn der Projektname sehr lang ist (> 100 Zeichen)?
  → Fehlermeldung: "Projektname darf maximal 100 Zeichen lang sein"

## Technical Requirements
- **Performance:** Projektliste lädt in < 500ms (bis zu 100 Projekte)
- **Security:**
  - Row Level Security (RLS): Benutzer können nur ihre eigenen Projekte sehen
  - Authentication erforderlich für alle Projekt-Endpoints
- **Database:**
  - Tabelle: projects (id, user_id, name, description, status, created_at, updated_at)
  - Index auf user_id und status
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Added:** 2026-02-15

### Komponenten-Struktur

```
Projekt-Verwaltungs-System
│
├── Projekt-Übersichts-Seite (/projects)
│   ├── Header mit "Neues Projekt erstellen"-Button
│   ├── Filter-Tabs
│   │   ├── "Aktive Projekte" (Standard)
│   │   └── "Archivierte Projekte"
│   ├── Projekt-Liste (Card-Grid)
│   │   ├── Projekt-Card (wiederverwendbar)
│   │   │   ├── Projekt-Name
│   │   │   ├── Beschreibung (gekürzt auf 2 Zeilen)
│   │   │   ├── Anzahl Tasks (Badge)
│   │   │   ├── Erstelldatum
│   │   │   ├── Status-Badge (Active/Archived)
│   │   │   └── Aktions-Menü (3-Punkte-Dropdown)
│   │   │       ├── "Bearbeiten"
│   │   │       ├── "Archivieren" oder "Reaktivieren"
│   │   │       └── "Löschen"
│   └── Leerer Zustand (wenn keine Projekte)
│       ├── Illustration/Icon
│       ├── Text: "Noch keine Projekte"
│       └── "Erstes Projekt erstellen"-Button
│
├── Projekt-Erstellen-Dialog (Modal)
│   ├── Titel: "Neues Projekt"
│   ├── Projekt-Name-Eingabefeld (Pflichtfeld)
│   ├── Beschreibung-Textarea (optional)
│   ├── "Abbrechen"-Button
│   └── "Projekt erstellen"-Button
│
├── Projekt-Bearbeiten-Dialog (Modal)
│   ├── Titel: "Projekt bearbeiten"
│   ├── Projekt-Name-Eingabefeld (vorausgefüllt)
│   ├── Beschreibung-Textarea (vorausgefüllt)
│   ├── Status-Select (Active/Archived)
│   ├── "Abbrechen"-Button
│   └── "Änderungen speichern"-Button
│
└── Projekt-Löschen-Bestätigungs-Dialog
    ├── Titel: "Projekt löschen?"
    ├── Warntext: "Diese Aktion kann nicht rückgängig gemacht werden"
    ├── Fehlerhinweis (wenn Tasks existieren): "Projekt enthält noch Tasks"
    ├── "Abbrechen"-Button
    └── "Endgültig löschen"-Button (rot)
```

**Zusätzlich:**
- Loading-States (Skeleton-Cards während Laden)
- Error-Handling (Toast-Benachrichtigungen)
- Auth-Schutz (nur für eingeloggte Benutzer)

### Datenmodell

**Projekt-Informationen (Supabase PostgreSQL):**

Jedes Projekt enthält:
- Eindeutige Projekt-ID (UUID, automatisch)
- Benutzer-ID (verknüpft mit PROJ-1)
- Name (max. 100 Zeichen, Pflichtfeld)
- Beschreibung (optional, unbegrenzt)
- Status (Active/Archived, Standard: Active)
- Erstelldatum (Timestamp, automatisch)
- Letztes Änderungsdatum (Timestamp, automatisch)
- Task-Anzahl (berechnet aus PROJ-3, nicht gespeichert)

**Speicherort:** Supabase PostgreSQL-Datenbank

**Sortierung:** Nach Erstelldatum (neueste zuerst)

**Sicherheit:** Row Level Security (Benutzer sehen nur eigene Projekte)

### Tech-Entscheidungen

**1. Supabase PostgreSQL**
- Daten-Synchronisation über mehrere Geräte
- Team-Mitglieder greifen später auf dieselben Projekte zu (PROJ-4)
- Automatische Backups, kein Datenverlust

**2. Row Level Security (RLS)**
- Sicherheit auf Datenbank-Ebene
- Benutzer sehen nur eigene Projekte
- Schutz vor direkten API-Aufrufen

**3. shadcn/ui Dialog + Card**
- Bereits installiert, barrierefreie Dialoge
- Card-Grid für übersichtliche Projekt-Darstellung

**4. React Hook Form + Zod**
- Konsistent mit PROJ-1
- Validierung vor Server-Request
- Klare Fehlermeldungen

**5. Optimistic Updates**
- UI reagiert sofort (< 500ms Ziel)
- Rollback bei Server-Fehler

**6. Dropdown-Menü**
- Platzsparend, cleaner Look
- Alle Aktionen an einem Ort

### Benötigte Pakete

**Keine neuen Pakete erforderlich!**

Alle bereits vorhanden:
- `@supabase/supabase-js`, `@supabase/ssr` (PROJ-1)
- `react-hook-form`, `@hookform/resolvers`, `zod` (PROJ-1)
- shadcn/ui: Card, Button, Dialog, Input, Textarea, Select, Dropdown-Menu, Badge, Skeleton, Toast

## QA Test Results (Re-test #2 -- Post tsk_ Refactoring)

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Context:** Full re-test after database table rename (tsk_ prefix). Build passes successfully.

### Database Refactoring Verification (tsk_ prefix)
- [x] GET /api/projects uses .from('tsk_projects') with JOINs on tsk_teams and tsk_tasks -- CORRECT
- [x] POST /api/projects uses .from('tsk_projects') and .from('tsk_team_members') -- CORRECT
- [x] GET/PUT/DELETE /api/projects/[id] all use tsk_projects and tsk_tasks -- CORRECT
- [x] No remaining references to old table names

### Acceptance Criteria Status

#### AC-1: Benutzer kann ein neues Projekt mit Name (Pflichtfeld) und Beschreibung (optional) erstellen
- [x] FIXED (was BUG-9): Projects page NOW has "Neues Projekt" button (line 82-85). Clicking it opens ProjectDialog component which sends POST to /api/projects.
- [x] PASS: ProjectDialog has name (required) and description (optional) fields with Zod validation

#### AC-2: Projekt erhaelt automatisch einen Status (Active, Archived)
- [x] PASS: Database default 'active'. API supports ?status= parameter.

#### AC-3: Benutzer sieht eine Liste aller seiner Projekte (nur Active standardmaessig)
- [x] FIXED (was BUG-10): useProjects hook in /home/joachim/git/kit2/src/hooks/use-projects.ts NOW fetches from /api/projects API (line 23) instead of mock data
- [ ] BUG: API GET /api/projects does NOT filter by status='active' by default. The previous status filter was REMOVED in commit 354036b "fix: Remove status filter from projects API". This means archived projects will appear mixed with active ones, violating the AC that says "nur Active standardmaessig".

#### AC-4: Projektliste zeigt Name, Beschreibung (gekuerzt), Erstelldatum und Anzahl der Tasks
- [x] PASS: Name in CardTitle, Description with line-clamp-2, Date formatted with date-fns
- [ ] STILL OPEN (BUG-11): Task count NOT displayed on project cards. The API includes tasks:tsk_tasks(count) in the select, but the Project interface in use-projects.ts does not define a tasks field, and the project card rendering does not display task count.

#### AC-5: Benutzer kann Projektdetails bearbeiten (Name, Beschreibung, Status)
- [x] FIXED (was BUG-12): DropdownMenu on project cards (line 128-145) includes "Bearbeiten" option. Clicking opens ProjectDialog in edit mode (with project prop). Dialog sends PUT to /api/projects/{id}.
- [ ] PARTIAL: Name and description are editable in the dialog, but Status (Active/Archived) is NOT editable in the ProjectDialog. The dialog only has name and description fields -- no status select.

#### AC-6: Benutzer kann ein Projekt archivieren (Status -> Archived)
- [ ] STILL FAILING: No "Archivieren" option in the dropdown menu. The dropdown only has "Bearbeiten" and "Loeschen" (lines 137-144). The PUT API supports status changes but no frontend exposes archive functionality.

#### AC-7: Archivierte Projekte koennen ueber einen Filter angezeigt werden
- [ ] STILL FAILING (BUG-14): No filter tabs for Active/Archived exist on the /projects page

#### AC-8: Benutzer kann ein Projekt loeschen (nur wenn es keine Tasks enthaelt)
- [x] FIXED (was BUG-13): Delete option exists in DropdownMenuItem (line 141-144)
- [x] PASS: AlertDialog confirmation dialog with "Abbrechen" and destructive "Loeschen" button
- [x] PASS: API checks task count before deletion

#### AC-9: Beim Loeschen erscheint eine Bestaetigungsmeldung
- [x] FIXED: AlertDialog (lines 179-196) shows "Projekt loeschen?" with warning text and confirmation buttons

#### AC-10: Projekte sind nach Erstelldatum sortiert (neueste zuerst)
- [x] PASS: API .order('created_at', { ascending: false })

### Edge Cases Status

#### EC-1: Project without name
- [x] PASS: Zod requires min 1 char. ProjectDialog has required attribute on name input. Button disabled when !name (line 110).

#### EC-2: Delete project with tasks
- [x] PASS: API correctly checks tsk_tasks count and returns error message

#### EC-3: No projects (empty state)
- [x] FIXED (was BUG-15): Empty state NOW includes "Erstes Projekt erstellen" button (line 109-112) with Plus icon

#### EC-4: Edit archived project
- [ ] CANNOT TEST: No way to archive a project from frontend, so cannot test editing an archived project

#### EC-5: Project name > 100 chars
- [x] PASS: API Zod enforces max 100 chars

### Security Audit Results
- [ ] STILL OPEN (BUG-16): GET /api/projects does NOT check authentication (supabase.auth.getUser()). Relies entirely on Supabase RLS. POST /api/projects line 45 DOES check auth. Inconsistent.
- [x] RLS policies restrict project access to team members
- [x] Zod validation on all input fields
- [ ] STILL OPEN (BUG-17): GET /api/projects does not use .limit(). Unbounded results possible.
- [x] tsk_ prefix applied consistently -- no table name mismatch

### Bugs Found (Updated)

#### BUG-9: No create project UI [FIXED]
- ProjectDialog component with "Neues Projekt" button now implemented

#### BUG-10: Projects page uses mock data instead of API [FIXED]
- useProjects hook now fetches from /api/projects

#### BUG-11: Task count not shown on project cards [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/projects/page.tsx -- no task count rendering; /home/joachim/git/kit2/src/hooks/use-projects.ts -- Project interface missing tasks field
- **Priority:** Fix before deployment

#### BUG-12: No edit project UI [FIXED]
- DropdownMenu with "Bearbeiten" now opens ProjectDialog in edit mode

#### BUG-13: No archive/delete project UI [PARTIALLY FIXED]
- Delete is implemented. Archive is NOT implemented (no "Archivieren" menu item).

#### BUG-14: No Active/Archived filter tabs [STILL OPEN]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/app/projects/page.tsx -- no filter tabs
- **Priority:** Fix before deployment

#### BUG-15: Empty state missing CTA button [FIXED]
- "Erstes Projekt erstellen" button now present

#### BUG-16: No explicit auth check in project GET API [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/api/projects/route.ts GET handler (line 11) -- no auth check
- **Priority:** Fix before deployment

#### BUG-17: No .limit() on project list query [STILL OPEN]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/app/api/projects/route.ts line 15
- **Priority:** Fix in next sprint

#### BUG-P1: Status filter removed from projects API [NEW]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/app/api/projects/route.ts -- commit 354036b removed status filtering
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: Only active projects shown by default
  3. Actual: All projects (active AND archived) shown together
- **Priority:** Fix before deployment

#### BUG-P2: Archive functionality missing from UI [NEW -- split from BUG-13]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/app/projects/page.tsx -- no "Archivieren"/"Reaktivieren" in dropdown menu
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Click 3-dot menu on a project card
  3. Expected: "Archivieren" option in dropdown
  4. Actual: Only "Bearbeiten" and "Loeschen" options
- **Priority:** Fix before deployment

#### BUG-P3: Project edit dialog missing status select [NEW]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/components/project-dialog.tsx -- only name and description fields, no status select
- **Steps to Reproduce:**
  1. Click "Bearbeiten" on a project
  2. Expected: Dialog with name, description, AND status (Active/Archived) fields
  3. Actual: Dialog only has name and description
- **Priority:** Fix before deployment

#### BUG-P4: Delete confirmation dialog text is misleading [NEW]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/app/projects/page.tsx lines 183-186
- **Steps to Reproduce:**
  1. Click delete on a project
  2. Dialog says "Alle zugehoerigen Tasks werden ebenfalls geloescht"
  3. But API actually PREVENTS deletion if tasks exist
  4. Expected: Dialog should say "Projekt kann nur geloescht werden wenn keine Tasks vorhanden sind"
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 6/10 passed (up from 3/10)
- **Previously found bugs:** 4 FIXED (BUG-9, BUG-10, BUG-12, BUG-15), 1 PARTIALLY FIXED (BUG-13), 4 STILL OPEN
- **New bugs:** 4 (BUG-P1, BUG-P2, BUG-P3, BUG-P4)
- **Remaining bugs:** 8 total (0 critical, 3 high, 3 medium, 2 low)
- **tsk_ Refactoring Impact:** Status filter removal (commit 354036b) during refactoring period caused new BUG-P1
- **Security:** Missing explicit auth check (BUG-16) and missing .limit() (BUG-17) still open
- **Production Ready:** NO (3 high-severity bugs: BUG-14, BUG-P1, BUG-P2)
- **Recommendation:** Re-add status filter to API, add Active/Archived filter tabs, add archive menu option

## Deployment
_To be added by /deploy_
