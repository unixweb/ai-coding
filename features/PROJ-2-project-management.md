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

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Benutzer kann ein neues Projekt mit Name (Pflichtfeld) und Beschreibung (optional) erstellen
- [ ] BUG: The /projects page does NOT have a "Neues Projekt erstellen" button or dialog. The page is read-only, displaying projects from mock data via useProjects() hook. There is no create project UI anywhere. The "Neues Projekt" button on the dashboard links to /projects, not to a create dialog.

#### AC-2: Projekt erhaelt automatisch einen Status (Active, Archived)
- [x] Database schema defines project_status ENUM ('active', 'archived') with default 'active'
- [x] API GET supports ?status= query parameter (defaults to 'active')

#### AC-3: Benutzer sieht eine Liste aller seiner Projekte (nur Active standardmaessig)
- [x] Projects page displays a grid of project cards
- [ ] BUG: Projects page uses mock data (MOCK_PROJECTS from mock-data.ts) instead of fetching from the API. The useProjects() hook returns hardcoded MOCK_PROJECTS, not API data. No fetch call to /api/projects exists in the frontend.

#### AC-4: Projektliste zeigt Name, Beschreibung (gekuerzt), Erstelldatum und Anzahl der Tasks
- [x] Name shown in CardTitle
- [x] Description shown with line-clamp-2
- [x] Created date shown with date-fns formatting
- [ ] BUG: Task count (Anzahl der Tasks) is NOT displayed on project cards. The mock data Project type does not include a task count field.

#### AC-5: Benutzer kann Projektdetails bearbeiten (Name, Beschreibung, Status)
- [ ] BUG: No edit project dialog or UI exists. The project detail page (/projects/[id]) only shows tasks. There is no way to edit project name, description, or status from the frontend.

#### AC-6: Benutzer kann ein Projekt archivieren (Status -> Archived)
- [ ] BUG: No archive button or UI exists. The PUT /api/projects/[id] API supports status changes but no frontend exposes this.

#### AC-7: Archivierte Projekte koennen ueber einen Filter angezeigt werden
- [ ] BUG: No filter tabs (Active/Archived) exist on the /projects page. The tech design specifies filter tabs but none were implemented.

#### AC-8: Benutzer kann ein Projekt loeschen (nur wenn es keine Tasks enthaelt)
- [ ] BUG: No delete project UI exists. The DELETE /api/projects/[id] API correctly checks for tasks before deletion, but no frontend button or dialog exists.

#### AC-9: Beim Loeschen erscheint eine Bestaetigungsmeldung
- [ ] BUG: No delete confirmation dialog exists (because delete UI itself is missing per AC-8).

#### AC-10: Projekte sind nach Erstelldatum sortiert (neueste zuerst)
- [x] API sorts by created_at descending
- [x] Mock data is hardcoded in order

### Edge Cases Status

#### EC-1: Project without name
- [x] API Zod schema requires name (min 1 char) -- but cannot be tested from frontend since create UI is missing

#### EC-2: Delete project with tasks
- [x] API correctly checks task count before deletion and returns error

#### EC-3: No projects (empty state)
- [x] Projects page shows empty state with FolderOpen icon, "Keine Projekte" text
- [ ] BUG: Empty state shows "Es sind noch keine Projekte vorhanden" but does NOT show a "Erstellen Sie Ihr erstes Projekt" CTA button as required by the spec. The empty state only has text, no action button.

#### EC-4: Edit archived project
- [ ] BUG: Cannot be tested -- no edit UI exists

#### EC-5: Project name > 100 chars
- [x] API Zod schema enforces max 100 chars
- [x] Database CHECK constraint enforces char_length(name) <= 100

### Security Audit Results
- [ ] BUG: The GET /api/projects and POST /api/projects routes do NOT verify authentication before processing. They rely entirely on Supabase RLS. While RLS provides protection, the API should also explicitly check auth as a defense-in-depth measure (as required by security rules). If RLS is misconfigured, all projects would be exposed.
- [x] RLS policies properly restrict project access to team members
- [x] Zod validation on all input fields
- [ ] BUG: GET /api/projects does not use .limit() as required by backend rules. A user with many projects could receive unbounded results.

### Bugs Found

#### BUG-9: No create project UI
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: "Neues Projekt erstellen" button that opens a create dialog
  3. Actual: No create button or dialog exists
- **Priority:** Fix before deployment

#### BUG-10: Projects page uses mock data instead of API
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: Projects fetched from /api/projects (Supabase)
  3. Actual: Hardcoded MOCK_PROJECTS from mock-data.ts are displayed
- **Priority:** Fix before deployment

#### BUG-11: Task count not shown on project cards
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: Each project card shows number of tasks
  3. Actual: No task count badge displayed
- **Priority:** Fix before deployment

#### BUG-12: No edit project UI
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /projects or a project detail page
  2. Expected: Edit button/dialog to change name, description, status
  3. Actual: No edit functionality in the UI
- **Priority:** Fix before deployment

#### BUG-13: No archive/delete project UI
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: 3-dot dropdown menu with Archive and Delete options
  3. Actual: No action menu on project cards
- **Priority:** Fix before deployment

#### BUG-14: No Active/Archived filter tabs
- **Severity:** High
- **Steps to Reproduce:**
  1. Navigate to /projects
  2. Expected: Filter tabs for "Aktive Projekte" and "Archivierte Projekte"
  3. Actual: No filter tabs exist
- **Priority:** Fix before deployment

#### BUG-15: Empty state missing CTA button
- **Severity:** Low
- **Steps to Reproduce:**
  1. Navigate to /projects with no projects
  2. Expected: "Erstellen Sie Ihr erstes Projekt" button
  3. Actual: Only text, no action button
- **Priority:** Fix in next sprint

#### BUG-16: No explicit auth check in project API routes
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Review GET/POST /api/projects code
  2. Expected: supabase.auth.getUser() check before processing
  3. Actual: Relies solely on RLS without explicit auth verification
- **Priority:** Fix before deployment

#### BUG-17: No .limit() on project list query
- **Severity:** Low
- **Steps to Reproduce:**
  1. Review GET /api/projects code
  2. Expected: .limit() applied to query
  3. Actual: No limit on results
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 3/10 passed
- **Bugs Found:** 9 total (4 critical, 1 high, 2 medium, 2 low)
- **Security:** Issues found (missing auth checks, missing query limits)
- **Production Ready:** NO
- **Recommendation:** Major frontend work needed. The project management frontend is severely incomplete -- almost all CRUD operations are missing from the UI. The API backend is functional but the frontend only displays mock data.

## Deployment
_To be added by /deploy_
