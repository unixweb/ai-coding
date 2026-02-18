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

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Benutzer kann einen neuen Task erstellen (Titel Pflichtfeld, Beschreibung optional, Faelligkeitsdatum optional)
- [x] TaskFormDialog exists with title (required, max 200), description (optional), due_date (optional)
- [x] Zod validation enforces title min 1, max 200 characters
- [x] Character counter shows current length vs. max 200
- [ ] BUG: Task creation uses localStorage (mock data) instead of the /api/tasks API. The useTasks() hook in use-tasks.ts reads/writes to localStorage with MOCK_TASKS as fallback. No fetch call to the API exists.

#### AC-2: Task erhaelt automatisch den Status "To Do"
- [x] TaskFormDialog defaults status to "todo"
- [x] API schema defaults status to "to_do"
- [ ] BUG: Frontend uses "todo" as status value, but the API/database uses "to_do". This mismatch means frontend tasks and API tasks use incompatible status values. The TaskStatus type is "todo" | "in_progress" | "completed" but the API uses 'to_do' | 'in_progress' | 'completed'.

#### AC-3: Task kann einer Person zugewiesen werden (Dropdown mit Teammitgliedern)
- [x] TaskFormDialog includes assignee select dropdown
- [x] TeamMembers are passed as options
- [ ] BUG: useTeamMembers() hook returns hardcoded MOCK_TEAM_MEMBERS instead of fetching from /api/teams/members. Team members shown in the dropdown are static mock data.

#### AC-4: Benutzer sieht alle Tasks eines Projekts in einer Liste
- [x] Kanban board view shows tasks grouped by status
- [x] List view (table) shows all tasks
- [x] Both views available via toggle button

#### AC-5: Task-Liste zeigt: Titel, Zustaendige Person, Status, Faelligkeitsdatum
- [x] TaskListView table has columns: Titel, Status, Zustaendig, Faellig
- [x] TaskCard shows title, assignee avatar, status badge, due date

#### AC-6: Benutzer kann Task-Status aendern: To Do -> In Progress -> Completed
- [x] Status change via dropdown menu in task card
- [x] Status change via drag & drop in Kanban board
- [x] Status change via select dropdown in TaskDetailsSheet
- [x] All three status transitions supported

#### AC-7: Benutzer kann Task-Details bearbeiten
- [x] TaskFormDialog in edit mode pre-fills all fields
- [x] All fields editable: title, description, assignee, due_date
- [x] Changes saved via updateTask in useTasks hook

#### AC-8: Benutzer kann einen Task loeschen (mit Bestaetigungsmeldung)
- [x] TaskDeleteDialog shows confirmation with task title
- [x] "Endgueltig loeschen" button in red (destructive)
- [x] "Abbrechen" button to cancel

#### AC-9: Tasks koennen nach Status, Zustaendiger Person oder Faelligkeitsdatum gefiltert werden
- [x] TaskToolbar has filter popover with Status, Assignee, Due Date filters
- [x] Filter chips show active filters with remove buttons
- [x] filterTasks() function in use-tasks.ts handles all filter combinations

#### AC-10: Ueberfaellige Tasks werden visuell hervorgehoben (rot)
- [x] isOverdue() function checks if due_date < today
- [x] Overdue tasks get "border-destructive/50" border on card
- [x] Due date text shown in "text-destructive" (red) when overdue
- [x] Completed tasks excluded from overdue highlighting

### Edge Cases Status

#### EC-1: Task without title
- [x] Zod schema requires min 1 char for title
- [x] FormMessage displays "Task-Titel ist erforderlich"

#### EC-2: Project with no tasks (empty state)
- [x] TaskEmptyState component shows "Noch keine Tasks in diesem Projekt"
- [x] "Ersten Task erstellen" button triggers create dialog

#### EC-3: Due date in the past
- [x] Alert shown: "Das Faelligkeitsdatum liegt in der Vergangenheit" (warning, but submission allowed)

#### EC-4: Unassigned task
- [x] "Nicht zugewiesen" shown in task card and details sheet
- [x] "unassigned" option available in assignee select

#### EC-5: Assigned user removed from team
- [ ] BUG: Cannot be tested with mock data. Since team members are hardcoded, removing a member cannot be simulated.

#### EC-6: Task title > 200 chars
- [x] Zod schema enforces max 200 chars
- [x] Input has maxLength=200 attribute
- [x] Character counter shows usage

### Security Audit Results
- [ ] BUG: ALL task data is stored in localStorage (client-side only). No authentication or authorization checks are performed on task operations. Any user can read/write all tasks by accessing localStorage directly. This completely bypasses the designed RLS policies.
- [x] API routes exist with proper Zod validation and Supabase RLS -- but are NOT used by the frontend
- [ ] BUG: Task GET API at /api/tasks does not use .limit(). A project with many tasks could return unbounded results.
- [ ] BUG: Task API routes (GET /api/tasks, POST /api/tasks) do not explicitly check authentication. They rely on Supabase RLS only.

### Bugs Found

#### BUG-18: Tasks use localStorage instead of API
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /projects/project-1
  2. Create a task
  3. Open browser DevTools > Application > localStorage
  4. Expected: Task sent to /api/tasks API and stored in Supabase
  5. Actual: Task stored in localStorage under key "kit2_tasks"
- **Priority:** Fix before deployment

#### BUG-19: Status value mismatch between frontend and API
- **Severity:** High
- **Steps to Reproduce:**
  1. Frontend TaskStatus type uses "todo" | "in_progress" | "completed"
  2. API/Database uses "to_do" | "in_progress" | "completed"
  3. Expected: Consistent status values
  4. Actual: "todo" (frontend) vs "to_do" (API/DB) -- would cause errors when integrating
- **Priority:** Fix before deployment

#### BUG-20: Team members are hardcoded mock data
- **Severity:** High
- **Steps to Reproduce:**
  1. Navigate to any project page
  2. Open task create/edit dialog
  3. Expected: Assignee dropdown shows real team members from API
  4. Actual: Shows hardcoded mock names (Anna Schmidt, Max Mustermann, Lisa Weber, Tom Fischer)
- **Priority:** Fix before deployment

#### BUG-21: No .limit() on task list query
- **Severity:** Low
- **Steps to Reproduce:**
  1. Review GET /api/tasks code
  2. Expected: .limit() applied
  3. Actual: No limit, could return thousands of tasks
- **Priority:** Fix in next sprint

#### BUG-22: No explicit auth check in task API routes
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Review GET/POST /api/tasks code
  2. Expected: supabase.auth.getUser() check before processing
  3. Actual: Relies solely on RLS
- **Priority:** Fix before deployment

### Cross-Browser / Responsive Notes
- [x] Kanban board switches from horizontal to vertical layout on mobile (md:flex-row)
- [x] List view hides "Zustaendig" column on mobile (hidden md:table-cell)
- [x] Task toolbar stacks vertically on mobile (flex-col sm:flex-row)
- [x] Filter popover aligns to end

### Summary
- **Acceptance Criteria:** 7/10 passed (most UI is functional but uses mock data)
- **Bugs Found:** 5 total (1 critical, 2 high, 1 medium, 1 low)
- **Security:** Critical issue -- all task data is client-side only, no real backend integration
- **Production Ready:** NO
- **Recommendation:** The task management UI is well-built and feature-rich (Kanban, list view, drag & drop, filters). However, it is completely disconnected from the backend API. The primary work needed is to replace localStorage/mock data with API calls.

## Deployment
_To be added by /deploy_
