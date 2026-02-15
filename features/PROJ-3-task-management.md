# PROJ-3: Task-Verwaltung

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
