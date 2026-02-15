# PROJ-2: Projekt-Verwaltung

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
