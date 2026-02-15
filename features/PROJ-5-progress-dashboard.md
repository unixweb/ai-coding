# PROJ-5: Fortschritts-Dashboard

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
