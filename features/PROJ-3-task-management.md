# PROJ-3: Task-Verwaltung

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-18

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - Nur eingeloggte Benutzer können Tasks erstellen
- **Requires:** PROJ-2 (Projekt-Verwaltung) - Tasks müssen einem Projekt zugeordnet sein

## User Stories
- Als Benutzer möchte ich in einem Projekt einen neuen Task erstellen können, damit ich Arbeit aufteilen kann
- Als Benutzer möchte ich alle Tasks eines Projekts sehen, damit ich den Überblick behalte
- Als Benutzer möchte ich einen Task einer Person zuweisen können, damit klar ist, wer dafür verantwortlich ist
- Als Benutzer möchte ich einen Task als "In Progress" oder "Completed" markieren können, damit der Status sichtbar ist
- Als Benutzer möchte ich Task-Details (Titel, Beschreibung, Fälligkeitsdatum) bearbeiten können, damit sie aktuell bleiben
- Als Benutzer möchte ich einen Task löschen können, damit ich nicht mehr benötigte Tasks entfernen kann

## Acceptance Criteria
- [ ] Benutzer kann einen neuen Task mit Titel (Pflichtfeld), Beschreibung (optional), Fälligkeitsdatum (optional) erstellen
- [ ] Task erhält automatisch den Status "To Do"
- [ ] Task kann einer Person zugewiesen werden (Dropdown mit Teammitgliedern)
- [ ] Benutzer sieht alle Tasks eines Projekts in einer Liste
- [ ] Task-Liste zeigt: Titel, Zuständige Person, Status, Fälligkeitsdatum
- [ ] Benutzer kann Task-Status ändern: To Do → In Progress → Completed
- [ ] Benutzer kann Task-Details bearbeiten (Titel, Beschreibung, Zuständige Person, Fälligkeitsdatum)
- [ ] Benutzer kann einen Task löschen (mit Bestätigungsmeldung)
- [ ] Tasks können nach Status, Zuständiger Person oder Fälligkeitsdatum gefiltert werden
- [ ] Überfällige Tasks (Fälligkeitsdatum < heute) werden visuell hervorgehoben (rot)

## Edge Cases
- Was passiert, wenn ein Benutzer versucht, einen Task ohne Titel zu erstellen?
  → Fehlermeldung: "Task-Titel ist erforderlich"
- Was passiert, wenn ein Projekt keine Tasks hat?
  → Leerer Zustand mit Call-to-Action: "Erstellen Sie Ihren ersten Task"
- Was passiert, wenn ein Benutzer ein Fälligkeitsdatum in der Vergangenheit setzt?
  → Warnung: "Das Fälligkeitsdatum liegt in der Vergangenheit" (aber erlaubt)
- Was passiert, wenn ein Task keiner Person zugewiesen ist?
  → Task zeigt "Nicht zugewiesen" an
- Was passiert, wenn der zugewiesene Benutzer aus dem Team entfernt wird?
  → Task bleibt bestehen, Zuständige Person wird auf "Nicht zugewiesen" gesetzt
- Was passiert, wenn ein Task-Titel sehr lang ist (> 200 Zeichen)?
  → Fehlermeldung: "Task-Titel darf maximal 200 Zeichen lang sein"

## Technical Requirements
- **Performance:** Task-Liste lädt in < 300ms (bis zu 500 Tasks pro Projekt)
- **Security:**
  - Row Level Security (RLS): Benutzer können nur Tasks in ihren Projekten sehen
  - Authentication erforderlich für alle Task-Endpoints
- **Database:**
  - Tabelle: tasks (id, project_id, title, description, assigned_to, status, due_date, created_at, updated_at)
  - Index auf project_id, assigned_to, status
  - Foreign Key: project_id → projects(id) ON DELETE CASCADE
  - Foreign Key: assigned_to → users(id) ON DELETE SET NULL
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Added:** 2026-02-15

### Komponenten-Struktur

```
Task-Verwaltungs-System (innerhalb eines Projekts)
│
├── Projekt-Detail-Seite (/projects/[id])
│   ├── Projekt-Header
│   │   ├── Projekt-Name & Beschreibung
│   │   ├── "Zurück zu Projekten"-Link
│   │   └── Projekt-Aktionen (Bearbeiten, Archivieren)
│   │
│   ├── Task-Toolbar
│   │   ├── "Neuen Task erstellen"-Button
│   │   ├── Ansichts-Toggle (Kanban / Liste)
│   │   └── Filter-Dropdown
│   │       ├── Filter nach Status (To Do, In Progress, Completed)
│   │       ├── Filter nach Zuständiger Person
│   │       └── Filter nach Fälligkeitsdatum (Heute, Diese Woche, Überfällig)
│   │
│   ├── Kanban-Board-Ansicht (Standard)
│   │   ├── "To Do"-Spalte
│   │   │   └── Task-Cards (drag & drop)
│   │   ├── "In Progress"-Spalte
│   │   │   └── Task-Cards (drag & drop)
│   │   └── "Completed"-Spalte
│   │       └── Task-Cards (drag & drop)
│   │
│   ├── Listen-Ansicht (Alternative)
│   │   └── Task-Table
│   │       ├── Spalten: Titel, Status, Zuständig, Fälligkeitsdatum
│   │       ├── Sortierung nach allen Spalten
│   │       └── Inline-Aktionen pro Task
│   │
│   └── Leerer Zustand (wenn keine Tasks)
│       ├── Illustration/Icon
│       ├── Text: "Noch keine Tasks in diesem Projekt"
│       └── "Ersten Task erstellen"-Button
│
├── Task-Card (wiederverwendbar)
│   ├── Task-Titel
│   ├── Status-Badge (farbcodiert)
│   ├── Zuständige Person (Avatar + Name)
│   ├── Fälligkeitsdatum (rot wenn überfällig)
│   ├── Beschreibung (gekürzt, ausklappbar)
│   └── Aktions-Menü (3-Punkte-Dropdown)
│       ├── "Details anzeigen"
│       ├── "Bearbeiten"
│       ├── "Status ändern" (Submenu)
│       └── "Löschen"
│
├── Task-Erstellen-Dialog (Modal)
│   ├── Titel: "Neuen Task erstellen"
│   ├── Task-Titel-Eingabefeld (Pflichtfeld, max. 200 Zeichen)
│   ├── Beschreibung-Textarea (optional)
│   ├── Zuständige Person-Select (Dropdown mit Team-Mitgliedern)
│   ├── Fälligkeitsdatum-DatePicker (optional)
│   ├── Status-Select (To Do, In Progress, Completed - Standard: To Do)
│   ├── "Abbrechen"-Button
│   └── "Task erstellen"-Button
│
├── Task-Bearbeiten-Dialog (Modal)
│   ├── Titel: "Task bearbeiten"
│   ├── Alle Felder wie "Erstellen", aber vorausgefüllt
│   ├── "Abbrechen"-Button
│   └── "Änderungen speichern"-Button
│
├── Task-Details-Drawer (Seitenpanel)
│   ├── Task-Titel (editierbar on-click)
│   ├── Status-Select (inline änderbar)
│   ├── Zuständige Person (inline änderbar)
│   ├── Fälligkeitsdatum (inline änderbar)
│   ├── Beschreibung (vollständig, editierbar)
│   ├── Erstellt am / Zuletzt geändert
│   ├── "Task löschen"-Button (unten)
│   └── "Schließen"-Button
│
└── Task-Löschen-Bestätigungs-Dialog
    ├── Titel: "Task löschen?"
    ├── Warntext: "Diese Aktion kann nicht rückgängig gemacht werden"
    ├── "Abbrechen"-Button
    └── "Endgültig löschen"-Button (rot)
```

**Zusätzlich:**
- Drag & Drop (Tasks zwischen Spalten ziehen)
- Loading-States (Skeleton)
- Error-Handling (Toast)
- Überfällig-Indikator (rot bei Datum < heute)

### Datenmodell

**Task-Informationen (Supabase PostgreSQL):**

Jeder Task enthält:
- Eindeutige Task-ID (UUID, automatisch)
- Projekt-ID (Foreign Key zu PROJ-2)
- Titel (max. 200 Zeichen, Pflichtfeld)
- Beschreibung (optional, unbegrenzt)
- Zuständige Person (User-ID, optional - kann NULL sein)
- Status (To Do / In Progress / Completed, Standard: To Do)
- Fälligkeitsdatum (optional)
- Erstelldatum (Timestamp, automatisch)
- Letztes Änderungsdatum (Timestamp, automatisch)

**Speicherort:** Supabase PostgreSQL-Datenbank

**Sortierung:**
- Kanban: Nach Fälligkeitsdatum (überfällig zuerst)
- Liste: Benutzerdefiniert

**Sicherheit:** Row Level Security (Tasks nur in eigenen Projekten)

**Beziehungen:**
- Task → Projekt (project_id, CASCADE on delete)
- Task → Person (assigned_to, SET NULL on delete)

### Tech-Entscheidungen

**1. Kanban-Board als Haupt-Ansicht**
- Perfekt für Software-Teams (Agile)
- Status visuell sofort erkennbar
- Natürliches Drag & Drop (wie Trello)

**2. Drag & Drop für Status-Änderung**
- Schneller als Dropdown (weniger Klicks)
- Intuitive Bedienung
- Technologie: `@dnd-kit/core` (barrierefrei)

**3. Sheet (Seitenpanel) für Task-Details**
- Mehr Platz als Dialog
- Kontext bleibt sichtbar
- Inline-Bearbeitung fühlt sich schnell an

**4. Farbcodierung**
- Schnelle visuelle Erfassung
- To Do: Grau, In Progress: Blau, Completed: Grün
- Überfällig: Roter Akzent

**5. Optimistic Updates + Realtime Sync**
- UI reagiert sofort (< 300ms Ziel)
- Drag & Drop ohne Verzögerung
- Supabase Realtime für Team-Sync

**6. DatePicker für Fälligkeitsdatum**
- Verhindert ungültige Eingaben
- Kalender intuitiver als manuell
- Warnung bei Vergangenheits-Datum

**7. Filter kombinierbar**
- Flexibilität ("Meine überfälligen Tasks")
- Filter-Chips zeigen aktive Filter

### Benötigte Pakete

**Neu zu installieren:**
- `@dnd-kit/core` - Drag & Drop Kern
- `@dnd-kit/sortable` - Sortierbare Listen
- `@dnd-kit/utilities` - DnD Hilfs-Funktionen
- `date-fns` - Datums-Formatierung und Vergleich

**Bereits vorhanden:**
- `@supabase/supabase-js`, `@supabase/ssr` (PROJ-1)
- `react-hook-form`, `@hookform/resolvers`, `zod` (PROJ-1)
- shadcn/ui: Card, Button, Dialog, Sheet, Input, Textarea, Select, Badge, Table, Dropdown-Menu, Skeleton, Toast

**Optional:**
- shadcn/ui DatePicker (basiert auf `react-day-picker`)

## QA Test Results (Re-test #2 -- Post tsk_ Refactoring)

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Context:** Full re-test after database table rename (tsk_ prefix). Build passes successfully.

### Database Refactoring Verification (tsk_ prefix)
- [x] GET /api/tasks uses .from('tsk_tasks') with JOINs on tsk_projects and tsk_profiles -- CORRECT
- [x] POST /api/tasks uses .from('tsk_tasks') with same JOINs -- CORRECT
- [x] GET/PUT/DELETE /api/tasks/[id] all use tsk_tasks, tsk_projects, tsk_profiles -- CORRECT
- [x] Foreign key hint syntax correct: tsk_profiles!assigned_to -- CORRECT
- [x] No remaining references to old table names

### Important Finding: Two Competing useTasks Hooks Exist
There are TWO useTasks hooks in the codebase:
1. /home/joachim/git/kit2/src/hooks/use-tasks.ts -- OLD: uses localStorage + MOCK_TASKS (also exports useTeamMembers with MOCK_TEAM_MEMBERS, useProject with MOCK_PROJECTS, useProjects with MOCK_PROJECTS)
2. /home/joachim/git/kit2/src/hooks/use-tasks-api.ts -- NEW: fetches from /api/tasks API

The project detail page (/projects/[id]/page.tsx line 20) imports from use-tasks-api -- CORRECT.
However, the OLD use-tasks.ts file still exists and exports competing mock-based hooks that could be accidentally imported elsewhere.

### Acceptance Criteria Status

#### AC-1: Benutzer kann einen neuen Task erstellen (Titel Pflichtfeld, Beschreibung optional, Faelligkeitsdatum optional)
- [x] FIXED (was BUG-18): Project detail page now imports useTasks from use-tasks-api.ts which calls /api/tasks
- [x] PASS: TaskFormDialog with title (required, max 200), description (optional), due_date (optional)
- [x] PASS: API creates task in tsk_tasks table via Supabase

#### AC-2: Task erhaelt automatisch den Status "To Do"
- [x] FIXED (was BUG-19): TaskStatus type in /home/joachim/git/kit2/src/lib/types/task.ts line 1 now uses "to_do" | "in_progress" | "completed" -- matches API/DB
- [x] PASS: API Zod schema defaults to 'to_do'

#### AC-3: Task kann einer Person zugewiesen werden (Dropdown mit Teammitgliedern)
- [x] FIXED (was BUG-20): Project detail page imports useTeamMembers from /home/joachim/git/kit2/src/hooks/use-team.ts (line 22) which fetches from /api/teams/members
- [ ] BUG: useTeamMembers (use-team.ts) calls /api/teams/members WITHOUT a team_id parameter (line 23). The API requires team_id as a query parameter and returns 400 "Team-ID ist erforderlich" without it. This means the assignee dropdown will fail to load team members.

#### AC-4: Benutzer sieht alle Tasks eines Projekts in einer Liste
- [x] PASS: Kanban board and list view both functional. API fetched via use-tasks-api.ts

#### AC-5: Task-Liste zeigt: Titel, Zustaendige Person, Status, Faelligkeitsdatum
- [x] PASS: All columns shown in both Kanban cards and list table

#### AC-6: Benutzer kann Task-Status aendern: To Do -> In Progress -> Completed
- [x] PASS: Status change via dropdown, drag & drop, and TaskDetailsSheet -- all using API via use-tasks-api.ts

#### AC-7: Benutzer kann Task-Details bearbeiten
- [x] PASS: TaskFormDialog in edit mode, sends PUT to /api/tasks/{id}

#### AC-8: Benutzer kann einen Task loeschen (mit Bestaetigungsmeldung)
- [x] PASS: TaskDeleteDialog with confirmation, sends DELETE to /api/tasks/{id}

#### AC-9: Tasks koennen nach Status, Zustaendiger Person oder Faelligkeitsdatum gefiltert werden
- [x] PASS: TaskToolbar filters with Status, Assignee, Due Date. filterTasks() in use-tasks-api.ts handles all combinations.

#### AC-10: Ueberfaellige Tasks werden visuell hervorgehoben (rot)
- [x] PASS: Overdue highlighting with destructive colors, completed tasks excluded

### Edge Cases Status

#### EC-1: Task without title
- [x] PASS: Zod enforces min 1 char, "Task-Titel ist erforderlich" message

#### EC-2: Project with no tasks (empty state)
- [x] PASS: TaskEmptyState with "Ersten Task erstellen" button

#### EC-3: Due date in the past
- [x] PASS: Warning shown, submission allowed

#### EC-4: Unassigned task
- [x] PASS: "Nicht zugewiesen" shown correctly

#### EC-5: Assigned user removed from team
- [ ] STILL CANNOT TEST: Requires live Supabase environment to test team member removal

#### EC-6: Task title > 200 chars
- [x] PASS: Zod max 200, maxLength=200 attribute, character counter

### Security Audit Results
- [x] FIXED: Tasks now stored in Supabase via API (not localStorage). RLS provides data isolation.
- [ ] STILL OPEN (BUG-22): Task API routes GET/POST do not explicitly check authentication. Rely solely on RLS.
- [ ] STILL OPEN (BUG-21): GET /api/tasks does not use .limit()
- [x] tsk_ prefix applied consistently. Foreign key hint tsk_profiles!assigned_to is correct syntax.

### Regression Concern: Dead Code
- [ ] BUG-T1 (NEW): The OLD use-tasks.ts file (/home/joachim/git/kit2/src/hooks/use-tasks.ts) still exists with localStorage-based implementation and MOCK data exports. It also exports useTeamMembers(), useProject(), and useProjects() that return mock data. While the project detail page correctly imports from use-tasks-api.ts, the old file is confusing dead code that could be accidentally imported. Mock data file (/home/joachim/git/kit2/src/lib/mock-data.ts) is also still present.

### Bugs Found (Updated)

#### BUG-18: Tasks use localStorage instead of API [FIXED]
- Project detail page now uses use-tasks-api.ts which fetches from /api/tasks

#### BUG-19: Status value mismatch [FIXED]
- TaskStatus type updated to "to_do" | "in_progress" | "completed" matching API/DB

#### BUG-20: Team members are hardcoded mock data [FIXED]
- useTeamMembers in use-team.ts now fetches from /api/teams/members

#### BUG-T2: useTeamMembers calls /api/teams/members without team_id [NEW -- related to BUG-25 in PROJ-4]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/hooks/use-team.ts line 23
- **Steps to Reproduce:**
  1. Navigate to /projects/{id}
  2. Open task create/edit dialog
  3. Expected: Assignee dropdown shows team members
  4. Actual: API returns 400 "Team-ID ist erforderlich" -- dropdown empty or errored
- **Priority:** Fix before deployment

#### BUG-21: No .limit() on task list query [STILL OPEN]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/app/api/tasks/route.ts line 25
- **Priority:** Fix in next sprint

#### BUG-22: No explicit auth check in task API routes [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/api/tasks/route.ts GET (line 14) and POST (line 64)
- **Priority:** Fix before deployment

#### BUG-T1: Dead code -- old mock-based hooks and mock data files still present [NEW]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/hooks/use-tasks.ts, /home/joachim/git/kit2/src/lib/mock-data.ts
- **Steps to Reproduce:** Files exist with competing exports that could be accidentally used
- **Priority:** Fix in next sprint (cleanup)

### Cross-Browser / Responsive Notes
- [x] Kanban board responsive (md:flex-row)
- [x] List view responsive (hidden md:table-cell)
- [x] Task toolbar responsive (flex-col sm:flex-row)

### Summary
- **Acceptance Criteria:** 9/10 passed (up from 7/10)
- **Previously found bugs:** 3 FIXED (BUG-18, BUG-19, BUG-20), 2 STILL OPEN (BUG-21, BUG-22)
- **New bugs:** 2 (BUG-T2 high, BUG-T1 low)
- **Remaining bugs:** 4 total (0 critical, 1 high, 1 medium, 2 low)
- **tsk_ Refactoring Impact:** Table names correctly updated. No regression from rename. Foreign key hint tsk_profiles!assigned_to works correctly.
- **Security:** Greatly improved -- tasks now use real API with RLS protection instead of localStorage
- **Production Ready:** NO (1 high-severity bug: BUG-T2 missing team_id parameter blocks assignee dropdown)
- **Recommendation:** Fix BUG-T2 (team_id parameter) to enable assignee functionality. Clean up dead code (BUG-T1).

## Deployment
_To be added by /deploy_
