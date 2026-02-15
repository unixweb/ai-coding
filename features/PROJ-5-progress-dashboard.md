# PROJ-5: Fortschritts-Dashboard

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
