# PROJ-4: Team-Zusammenarbeit

## Status: In Progress
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
**Added:** 2026-02-15

### Komponenten-Struktur

```
Team-Verwaltungs-System
│
├── Team-Seite (/team)
│   ├── Team-Header
│   │   ├── Team-Name (editierbar für Admins)
│   │   └── "Mitglied einladen"-Button (nur für Admins)
│   │
│   ├── Aktive Teammitglieder-Liste
│   │   ├── Teammitglied-Card (wiederverwendbar)
│   │   │   ├── Avatar (Initialen oder Foto)
│   │   │   ├── Name & E-Mail
│   │   │   ├── Rollen-Badge (Admin/Member/Viewer)
│   │   │   ├── Beitrittsdatum
│   │   │   └── Aktions-Menü (3-Punkte, nur für Admins)
│   │   │       ├── "Rolle ändern" (Submenu: Admin, Member, Viewer)
│   │   │       └── "Aus Team entfernen"
│   │   └── Sortierung: Admins zuerst, dann alphabetisch
│   │
│   ├── Ausstehende Einladungen-Sektion (kollapsierbar)
│   │   ├── Einladungs-Card
│   │   │   ├── E-Mail-Adresse
│   │   │   ├── Rolle (Badge)
│   │   │   ├── Ablaufdatum (z.B. "Läuft ab in 3 Tagen")
│   │   │   ├── "Einladung zurückziehen"-Button
│   │   │   └── "Einladung erneut senden"-Button
│   │   └── Leerer Zustand: "Keine ausstehenden Einladungen"
│   │
│   └── Leerer Zustand (wenn nur 1 Mitglied)
│       ├── Illustration/Icon
│       ├── Text: "Laden Sie Ihr Team ein"
│       └── "Erstes Mitglied einladen"-Button
│
├── Mitglied-Einladen-Dialog (Modal)
│   ├── Titel: "Teammitglied einladen"
│   ├── E-Mail-Adresse-Eingabefeld (Pflichtfeld)
│   ├── Rolle-Select (Admin, Member, Viewer - Standard: Member)
│   ├── Rollen-Erklärung (Info-Box)
│   │   ├── Admin: Volle Rechte, kann Mitglieder verwalten
│   │   ├── Member: Kann Projekte & Tasks erstellen
│   │   └── Viewer: Nur lesen, keine Bearbeitung
│   ├── "Abbrechen"-Button
│   └── "Einladung senden"-Button
│
├── Rolle-Ändern-Dialog (Modal)
│   ├── Titel: "Rolle von [Name] ändern"
│   ├── Aktuell: [Aktuelle Rolle]
│   ├── Neue Rolle-Select (Admin, Member, Viewer)
│   ├── Warnung (wenn letzter Admin zu Member/Viewer wird):
│   │   "Achtung: Dies ist der letzte Admin. Es muss mindestens ein Admin bleiben."
│   ├── "Abbrechen"-Button
│   └── "Rolle ändern"-Button
│
├── Mitglied-Entfernen-Bestätigungs-Dialog
│   ├── Titel: "Mitglied entfernen?"
│   ├── Warntext: "[Name] verliert Zugriff auf alle Projekte"
│   ├── Info: "Zugewiesene Tasks werden auf 'Nicht zugewiesen' gesetzt"
│   ├── Warnung (wenn letzter Admin): "Verhindert - es muss mindestens ein Admin bleiben"
│   ├── "Abbrechen"-Button
│   └── "Entfernen"-Button (rot, disabled wenn letzter Admin)
│
├── Einladungs-Akzeptieren-Seite (/accept-invitation?token=xxx)
│   ├── Team-Info (Name, Anzahl Mitglieder)
│   ├── Einladung-Details (Rolle, von wem eingeladen)
│   ├── Ablaufdatum-Warnung (wenn < 24h)
│   ├── "Einladung annehmen"-Button
│   ├── "Ablehnen"-Button
│   └── Error-State (wenn Token abgelaufen oder ungültig)
│
└── Berechtigungs-Prüfung-Komponenten (unsichtbar)
    ├── Admin-Guard (zeigt Content nur für Admins)
    ├── Member-Guard (zeigt Content nur für Members+Admins)
    └── Viewer-Guard (zeigt Content für alle)
```

**Zusätzlich:**
- E-Mail-Vorlagen (Einladungs-E-Mail)
- Loading-States (Skeleton)
- Error-Handling (Toast)
- Real-time Updates (Mitglieder-Liste)

### Datenmodell

**Team-Informationen (Supabase PostgreSQL):**

**1. Teams-Tabelle:**
- Team-ID (UUID)
- Team-Name (editierbar)
- Erstelldatum

**2. Team-Mitglieder (team_members):**
- Eindeutige ID (UUID)
- User-ID (aus PROJ-1)
- Team-ID
- Rolle (Admin / Member / Viewer)
- Beitrittsdatum

**3. Einladungen (team_invitations):**
- Einladungs-ID (UUID)
- E-Mail-Adresse
- Team-ID
- Rolle (Admin / Member / Viewer)
- Einladungs-Token (UUID für Accept-Link)
- Ablaufdatum (erstellt + 7 Tage)
- Eingeladen von (User-ID)
- Erstelldatum
- Status (Pending / Accepted / Expired / Revoked)

**Rollen-Berechtigungen:**
- **Admin:** Volle Rechte
- **Member:** Projekte & Tasks erstellen/bearbeiten
- **Viewer:** Nur lesen

**Speicherort:** Supabase PostgreSQL

**Sicherheit:** Row Level Security (rollenbasiert)

### Tech-Entscheidungen

**1. Supabase Auth für Einladungs-E-Mails**
- E-Mail-Versand bereits integriert (PROJ-1)
- Kostenlos im Free-Tier
- Keine zusätzliche Integration nötig

**2. Token-basierte Einladungen (UUID)**
- Sicherer als E-Mail im Link
- Einmalig verwendbar, läuft ab
- Verhindert Phishing

**3. Row Level Security für Rollen**
- Sicherheit auf Datenbank-Ebene
- Viewer können keine Projekte erstellen (auch via API nicht)
- Admins sehen alle Daten

**4. Automatischer Admin für ersten Benutzer**
- Löst Bootstrap-Problem
- Ältester User im Team = Admin

**5. "Mindestens ein Admin"-Regel**
- Verhindert Aussperren
- Frontend-Validierung + Backend-Constraint

**6. Soft-Delete für Task-Zuweisungen**
- Tasks bleiben bestehen
- assigned_to → NULL (SET NULL)
- Keine Datenverlust

**7. Ablaufende Einladungen (7 Tage)**
- Sicherheit (alte Links ungültig)
- Kann erneut gesendet werden

### Benötigte Pakete

**Keine neuen Pakete erforderlich!**

Alle bereits vorhanden:
- `@supabase/supabase-js`, `@supabase/ssr` (PROJ-1)
- `react-hook-form`, `@hookform/resolvers`, `zod` (PROJ-1)
- `date-fns` (PROJ-3)
- shadcn/ui: Card, Button, Dialog, Select, Badge, Avatar, Toast

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
