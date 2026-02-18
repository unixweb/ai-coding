# PROJ-5: Fortschritts-Dashboard

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-18

## Dependencies
- **Requires:** PROJ-2 (Projekt-Verwaltung) - Benötigt Projektdaten
- **Requires:** PROJ-3 (Task-Verwaltung) - Benötigt Task-Daten für Statistiken

## User Stories
- Als Benutzer möchte ich eine Übersicht aller meiner Projekte sehen, damit ich den Gesamtstatus auf einen Blick erfasse
- Als Benutzer möchte ich sehen, wie viele Tasks insgesamt erledigt sind, damit ich den Fortschritt messen kann
- Als Benutzer möchte ich Tasks nach Status filtern können, damit ich fokussiert arbeiten kann
- Als Benutzer möchte ich Tasks nach Zuständiger Person filtern können, damit ich sehe, woran bestimmte Personen arbeiten
- Als Benutzer möchte ich überfällige Tasks auf einen Blick sehen, damit ich priorisieren kann

## Acceptance Criteria
- [ ] Dashboard zeigt Gesamtanzahl der Projekte (Active)
- [ ] Dashboard zeigt Gesamtanzahl der Tasks (To Do, In Progress, Completed)
- [ ] Dashboard zeigt Abschlussrate aller Tasks in Prozent
- [ ] Dashboard zeigt Liste der überfälligen Tasks (Fälligkeitsdatum < heute, Status ≠ Completed)
- [ ] Benutzer kann Tasks nach Status filtern (To Do, In Progress, Completed)
- [ ] Benutzer kann Tasks nach Zuständiger Person filtern
- [ ] Benutzer kann Tasks nach Fälligkeitsdatum filtern (heute, diese Woche, überfällig)
- [ ] Dashboard zeigt Fortschrittsbalken pro Projekt (Anzahl erledigte Tasks / Gesamtanzahl Tasks)
- [ ] Filter können kombiniert werden (z.B. "Meine Tasks" + "In Progress")
- [ ] Dashboard lädt beim Öffnen der App als Startseite

## Edge Cases
- Was passiert, wenn ein Benutzer noch keine Projekte oder Tasks hat?
  → Leerer Zustand mit Anleitung: "Erstellen Sie Ihr erstes Projekt, um loszulegen"
- Was passiert, wenn alle Tasks erledigt sind?
  → Dashboard zeigt "100% abgeschlossen" mit Erfolgsmeldung
- Was passiert, wenn ein Filter keine Ergebnisse liefert?
  → Leerer Zustand: "Keine Tasks gefunden. Passen Sie die Filter an"
- Was passiert, wenn ein Projekt keine Tasks hat?
  → Fortschrittsbalken zeigt "0/0 Tasks" oder "Noch keine Tasks"
- Was passiert, wenn ein Benutzer viele überfällige Tasks hat (> 50)?
  → Liste zeigt nur die ersten 20, Rest über "Alle anzeigen" Button
- Was passiert, wenn ein Teammitglied entfernt wird?
  → Tasks zeigen "Nicht zugewiesen", Filter "Nach Person" listet nur aktive Teammitglieder

## Technical Requirements
- **Performance:** Dashboard lädt in < 1 Sekunde (auch bei 100+ Tasks)
- **Caching:** Statistiken werden gecacht (Refresh alle 30 Sekunden)
- **Security:**
  - Row Level Security (RLS): Benutzer sehen nur ihre eigenen Daten
  - Authentication erforderlich
- **Database:**
  - Aggregierte Queries: COUNT, GROUP BY für Statistiken
  - Index auf status, due_date, assigned_to für schnelle Filterung
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Added:** 2026-02-15

### Komponenten-Struktur

```
Fortschritts-Dashboard (Startseite nach Login)
│
├── Dashboard-Seite (/)
│   ├── Willkommens-Header
│   │   ├── "Willkommen zurück, [Name]!"
│   │   ├── Aktuelles Datum
│   │   └── Quick-Actions (Neues Projekt, Neuer Task)
│   │
│   ├── Statistik-Karten-Grid (responsive)
│   │   ├── Gesamt-Projekte-Card
│   │   │   ├── Zahl (z.B. "12")
│   │   │   ├── Label: "Aktive Projekte"
│   │   │   └── Icon (Ordner)
│   │   ├── Tasks-Nach-Status-Card
│   │   │   ├── Drei Spalten: To Do / In Progress / Completed
│   │   │   ├── Zahlen mit farbigen Badges
│   │   │   └── Icon (Checkbox)
│   │   ├── Abschlussrate-Card
│   │   │   ├── Großer Prozentsatz (z.B. "68%")
│   │   │   ├── Fortschrittsring (Circular Progress)
│   │   │   ├── Label: "Tasks abgeschlossen"
│   │   │   └── Icon (Trophy bei 100%)
│   │   └── Überfällige-Tasks-Card (rot hervorgehoben)
│   │       ├── Zahl (z.B. "3")
│   │       ├── Label: "Überfällige Tasks"
│   │       └── Icon (Alert)
│   │
│   ├── Projekt-Fortschritt-Sektion
│   │   ├── Titel: "Projekt-Fortschritt"
│   │   ├── Projekt-Fortschritts-Card (wiederverwendbar)
│   │   │   ├── Projekt-Name
│   │   │   ├── Fortschrittsbalken (horizontal)
│   │   │   ├── Text: "X von Y Tasks abgeschlossen"
│   │   │   ├── Prozent-Anzeige (z.B. "75%")
│   │   │   └── Klick → navigiert zu Projekt-Detail
│   │   └── Sortierung: Nach Anzahl offener Tasks (viele zuerst)
│   │
│   ├── Task-Filter-Toolbar
│   │   ├── Filter-Button-Group
│   │   │   ├── "Alle Tasks"
│   │   │   ├── "Meine Tasks" (zugewiesen an mich)
│   │   │   └── "Überfällig"
│   │   ├── Status-Filter (Multi-Select)
│   │   ├── Person-Filter (Dropdown)
│   │   ├── Fälligkeitsdatum-Filter (Dropdown)
│   │   └── Aktive-Filter-Chips (X-Button zum Entfernen)
│   │
│   ├── Gefilterte-Task-Liste
│   │   ├── Task-Card (kompakt, aus PROJ-3)
│   │   │   ├── Projekt-Name (Badge)
│   │   │   ├── Task-Titel
│   │   │   ├── Status-Badge
│   │   │   ├── Zuständige Person (Avatar)
│   │   │   ├── Fälligkeitsdatum (rot wenn überfällig)
│   │   │   └── Klick → öffnet Task-Details-Drawer
│   │   ├── Pagination (bei > 50 Tasks)
│   │   └── "Weitere laden"-Button
│   │
│   └── Leerer Zustand (wenn keine Projekte/Tasks)
│       ├── Illustration/Icon
│       ├── Titel: "Willkommen bei Ihrem Projekt-Dashboard!"
│       ├── Text: "Erstellen Sie Ihr erstes Projekt, um loszulegen"
│       └── "Erstes Projekt erstellen"-Button
│
└── Zusätzliche Komponenten
    ├── Refresh-Button (manuell)
    ├── Loading-Skeleton
    └── Erfolgs-Konfetti (bei 100%)
```

**Zusätzlich:**
- Auto-Refresh (alle 30s)
- Loading-States (Skeleton)
- Empty-States (pro Filter)
- Real-time Updates

### Datenmodell

**Keine neuen Daten!** Dashboard aggregiert Daten aus PROJ-2 und PROJ-3.

**Dashboard-Statistiken (berechnet):**
- Gesamt-Projekte: COUNT (status = Active)
- Tasks nach Status: COUNT per status
- Abschlussrate: (Completed / Total) * 100
- Überfällige Tasks: COUNT (due_date < heute AND status ≠ Completed)
- Projekt-Fortschritt: COUNT Tasks per Projekt

**Caching:**
- 30 Sekunden Browser-Cache
- Manueller Refresh überschreibt
- Cache-Invalidierung bei Task-Änderungen

**Speicherort:** Keine neue Datenbank - berechnet aus PROJ-2 + PROJ-3

### Tech-Entscheidungen

**1. Dashboard als Startseite (/)**
- Wichtigste Info nach Login
- Schneller Überblick ohne Navigation

**2. Statistik-Karten (Metrics)**
- Große Zahlen schnell erfassbar
- Grid-Layout (responsive)

**3. Circular Progress Ring**
- Visuell ansprechender
- Fortschritt greifbarer

**4. Farbcodierung**
- Überfällig: Rot (Alarm)
- In Progress: Blau
- Completed: Grün

**5. Kombinierbare Filter**
- Flexibilität für Power-User
- Filter-Chips zeigen aktive Filter

**6. Caching (30s)**
- Performance-Ziel < 1s
- Akzeptabler Trade-off

**7. Auto-Refresh (30s)**
- Dashboard bleibt aktuell
- Nur wenn Tab aktiv

**8. Pagination**
- Besser als Infinite Scroll (> 50 Tasks)
- Performance

**9. Fortschritts-Balken**
- Einfacher als Charts
- Native HTML/CSS (barrierefrei)

### Benötigte Pakete

**Keine neuen Pakete erforderlich!**

Alle bereits vorhanden:
- `@supabase/supabase-js`, `@supabase/ssr` (PROJ-1)
- `date-fns` (PROJ-3)
- shadcn/ui: Card, Badge, Button, Progress, Skeleton, Avatar

**Optional (später):**
- `recharts` - für detaillierte Charts (nicht im MVP)

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Dashboard zeigt Gesamtanzahl der Projekte (Active)
- [x] Stats card "Aktive Projekte" displays total_projects
- [x] API GET /api/dashboard/stats counts projects with status='active'

#### AC-2: Dashboard zeigt Gesamtanzahl der Tasks (To Do, In Progress, Completed)
- [x] "Task Status" card shows breakdown by status with badges
- [x] API calculates tasks_by_status with all three categories

#### AC-3: Dashboard zeigt Abschlussrate aller Tasks in Prozent
- [x] "Abschlussrate" card shows percentage with Progress bar
- [x] API calculates completion_rate = (completed / total) * 100
- [x] Shows "X von Y erledigt" text

#### AC-4: Dashboard zeigt Liste der ueberfaelligen Tasks
- [x] "Ueberfaellig" card shows count with destructive styling when > 0
- [x] API calculates overdue_tasks (due_date < today AND status != completed)
- [ ] BUG: Dashboard does NOT show a LIST of overdue tasks. It only shows the count. The spec requires "Liste der ueberfaelligen Tasks" but only a number is displayed. There is no task list anywhere on the dashboard.

#### AC-5: Benutzer kann Tasks nach Status filtern
- [ ] BUG: Dashboard has NO task filter functionality. There are no filter buttons, dropdowns, or filtered task list on the dashboard page. The spec requires status/person/date filters but the dashboard only shows statistics cards and project progress.

#### AC-6: Benutzer kann Tasks nach Zustaendiger Person filtern
- [ ] BUG: No person filter on dashboard (same as AC-5)

#### AC-7: Benutzer kann Tasks nach Faelligkeitsdatum filtern
- [ ] BUG: No due date filter on dashboard (same as AC-5)

#### AC-8: Dashboard zeigt Fortschrittsbalken pro Projekt
- [x] Project progress section with Progress bar per project
- [x] Shows "X von Y Tasks erledigt" with percentage
- [x] Click on project navigates to project detail page
- [x] Projects sorted by progress (least progress first)

#### AC-9: Filter koennen kombiniert werden
- [ ] BUG: No filters exist on dashboard (same as AC-5)

#### AC-10: Dashboard laedt beim Oeffnen der App als Startseite
- [ ] BUG: The root path '/' shows a landing/welcome page, NOT the dashboard. After login, user is redirected to '/dashboard' which is correct. But the spec says "Dashboard laedt beim Oeffnen der App als Startseite" -- the dashboard is at /dashboard, not /. If a logged-in user visits '/', they see the landing page instead of being redirected to the dashboard.

### Edge Cases Status

#### EC-1: No projects or tasks (empty state)
- [x] Dashboard shows "Noch keine Projekte" empty state with "Erstes Projekt erstellen" button
- [x] API returns zeros for all stats when no teams/projects exist

#### EC-2: All tasks completed (100%)
- [x] Completion rate card would show 100%
- [ ] BUG: No special "success" message or visual indicator at 100% as specified. Spec says "Dashboard zeigt '100% abgeschlossen' mit Erfolgsmeldung" but no Erfolgsmeldung exists.

#### EC-3: Filter returns no results
- [ ] BUG: Cannot test -- no filters exist on dashboard

#### EC-4: Project with no tasks
- [x] Project progress section shows "Ihre Projekte haben noch keine Tasks" when projects exist but have no tasks

#### EC-5: > 50 overdue tasks (pagination)
- [ ] BUG: No overdue tasks list or pagination exists. Only count shown.

#### EC-6: Removed team member
- [x] API only counts tasks for teams the user belongs to

### Security Audit Results
- [x] Both dashboard API routes check authentication (supabase.auth.getUser())
- [x] Data scoped to user's teams only via team membership lookup
- [ ] BUG: Dashboard stats API fetches ALL tasks for ALL projects in user's teams into memory (line 52-57 of stats/route.ts). For users with thousands of tasks, this is a performance/DoS vector. Should use database-level COUNT/aggregation instead of client-side array filtering.
- [x] No sensitive data exposed in API responses

### Bugs Found

#### BUG-30: No overdue tasks LIST on dashboard
- **Severity:** High
- **Steps to Reproduce:**
  1. Navigate to /dashboard
  2. Expected: List of overdue tasks with details
  3. Actual: Only a count number in a card
- **Priority:** Fix before deployment

#### BUG-31: No task filters on dashboard
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Navigate to /dashboard
  2. Expected: Filter toolbar with status, person, due date filters and filtered task list
  3. Actual: No filters or task list exist. Dashboard only shows summary cards.
- **Priority:** Fix before deployment

#### BUG-32: Logged-in users see landing page at root URL
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in successfully
  2. Navigate to '/' directly
  3. Expected: Redirected to /dashboard or dashboard shown
  4. Actual: Landing page with "Jetzt registrieren" and "Anmelden" buttons
- **Priority:** Fix before deployment

#### BUG-33: No 100% completion celebration/message
- **Severity:** Low
- **Steps to Reproduce:**
  1. Complete all tasks in all projects
  2. Expected: Special "100% abgeschlossen" message or celebration
  3. Actual: Just shows 100% number like any other percentage
- **Priority:** Nice to have

#### BUG-34: Dashboard stats loaded into memory instead of aggregated in DB
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Have a user with 10,000+ tasks
  2. Load /api/dashboard/stats
  3. Expected: Database-level COUNT/aggregation
  4. Actual: All tasks fetched into memory and counted with JavaScript array.filter()
- **Priority:** Fix before deployment

#### BUG-35: No auto-refresh (30s) on dashboard
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open /dashboard
  2. Wait 30+ seconds
  3. Expected: Data auto-refreshes as specified in tech requirements (caching/refresh every 30s)
  4. Actual: No auto-refresh implemented. Data only loaded once on mount.
- **Priority:** Fix in next sprint

### Cross-Browser / Responsive Notes
- [x] Stats grid uses responsive columns (md:grid-cols-2 lg:grid-cols-4)
- [x] Project progress section uses standard card layout, works at all widths
- [x] Dashboard header text scales appropriately

### Summary
- **Acceptance Criteria:** 4/10 passed
- **Bugs Found:** 6 total (1 critical, 1 high, 2 medium, 2 low)
- **Security:** Minor performance concern with in-memory aggregation
- **Production Ready:** NO
- **Recommendation:** The dashboard shows summary stats and project progress well, but is missing the complete task list and filter system that is core to the feature. The filter toolbar + filtered task list section needs to be implemented.

## Deployment
_To be added by /deploy_
