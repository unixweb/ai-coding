# PROJ-4: Team-Zusammenarbeit

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - Nur eingeloggte Benutzer können Teams verwalten

## User Stories
- Als Projekt-Admin möchte ich Teammitglieder per E-Mail einladen können, damit sie am Projekt mitarbeiten können
- Als Benutzer möchte ich alle Teammitglieder sehen, damit ich weiß, wer im Team ist
- Als Admin möchte ich Teammitgliedern Rollen zuweisen können (Admin, Member, Viewer), damit Berechtigungen klar sind
- Als Admin möchte ich Teammitglieder aus dem Team entfernen können, damit nur aktive Mitglieder Zugriff haben
- Als eingeladenes Teammitglied möchte ich die Einladung annehmen können, damit ich dem Team beitrete

## Acceptance Criteria
- [ ] Admin kann Teammitglieder per E-Mail-Adresse einladen
- [ ] Einladungs-E-Mail enthält einen Link zum Akzeptieren der Einladung
- [ ] Eingeladene Person erhält Zugriff auf alle Projekte des Teams
- [ ] Admin kann Rollen zuweisen: Admin (volle Rechte), Member (kann Projekte/Tasks erstellen), Viewer (nur lesen)
- [ ] Benutzer sieht eine Liste aller Teammitglieder mit Name, E-Mail und Rolle
- [ ] Admin kann Teammitglieder aus dem Team entfernen (mit Bestätigungsmeldung)
- [ ] Beim Entfernen werden alle Zuweisungen des Mitglieds auf "Nicht zugewiesen" gesetzt
- [ ] Einladungen sind 7 Tage gültig
- [ ] Benutzer kann ausstehende Einladungen sehen und zurückziehen
- [ ] Der erste Benutzer, der ein Konto erstellt, wird automatisch Admin

## Edge Cases
- Was passiert, wenn ein Admin versucht, eine bereits registrierte E-Mail einzuladen?
  → Benutzer wird direkt dem Team hinzugefügt (keine neue Registrierung nötig)
- Was passiert, wenn eine Einladungs-E-Mail abgelaufen ist?
  → Fehlermeldung: "Diese Einladung ist abgelaufen. Bitte fordern Sie eine neue an"
- Was passiert, wenn ein Admin sich selbst aus dem Team entfernen will?
  → Fehlermeldung: "Sie können sich nicht selbst entfernen. Übertragen Sie zuerst die Admin-Rolle"
- Was passiert, wenn der letzte Admin aus dem Team entfernt wird?
  → Verhindert: "Es muss mindestens ein Admin im Team sein"
- Was passiert, wenn ein Viewer versucht, ein Projekt zu erstellen?
  → Fehlermeldung: "Sie haben keine Berechtigung, Projekte zu erstellen"
- Was passiert, wenn eine E-Mail-Adresse mehrmals eingeladen wird?
  → Fehlermeldung: "Diese E-Mail-Adresse wurde bereits eingeladen"

## Technical Requirements
- **Performance:** Teammitglieder-Liste lädt in < 200ms
- **Security:**
  - Row Level Security (RLS): Nur Admins können Teammitglieder einladen/entfernen
  - Nur Members und Admins können Projekte/Tasks erstellen
  - Viewers haben nur Lesezugriff
- **Database:**
  - Tabelle: team_members (id, user_id, team_id, role, created_at)
  - Tabelle: team_invitations (id, email, team_id, role, token, expires_at, created_at)
  - Index auf user_id, team_id
- **Email:** Supabase Auth für Einladungs-E-Mails
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
