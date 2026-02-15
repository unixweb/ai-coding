# PROJ-3: Task-Verwaltung

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
