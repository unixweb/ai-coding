# PROJ-1: Benutzer-Authentifizierung

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- None (Grundlage für alle anderen Features)

## User Stories
- Als neuer Benutzer möchte ich mich mit E-Mail und Passwort registrieren können, damit ich ein Konto erstellen kann
- Als registrierter Benutzer möchte ich mich einloggen können, damit ich auf meine Projekte und Tasks zugreifen kann
- Als eingeloggter Benutzer möchte ich mich ausloggen können, damit ich meine Session beenden kann
- Als Benutzer, der sein Passwort vergessen hat, möchte ich es zurücksetzen können, damit ich wieder Zugang zu meinem Konto erhalte
- Als eingeloggter Benutzer möchte ich mein Profil (Name, E-Mail) bearbeiten können, damit meine Informationen aktuell sind

## Acceptance Criteria
- [ ] Benutzer kann sich mit E-Mail und Passwort registrieren (min. 8 Zeichen)
- [ ] Nach erfolgreicher Registrierung wird der Benutzer automatisch eingeloggt
- [ ] Benutzer kann sich mit E-Mail und Passwort einloggen
- [ ] Nach erfolgreichem Login wird der Benutzer zum Dashboard weitergeleitet
- [ ] Benutzer kann sich ausloggen und wird zur Login-Seite weitergeleitet
- [ ] Benutzer kann eine Passwort-Zurücksetzen-E-Mail anfordern
- [ ] Passwort-Reset-Link ist 24 Stunden gültig
- [ ] Benutzer kann seinen Namen und E-Mail-Adresse im Profil ändern
- [ ] E-Mail-Adresse muss eindeutig sein (keine Duplikate)
- [ ] Fehlermeldungen werden klar und verständlich angezeigt

## Edge Cases
- Was passiert, wenn ein Benutzer versucht, sich mit einer bereits registrierten E-Mail anzumelden?
  → Fehlermeldung: "Diese E-Mail-Adresse ist bereits registriert"
- Was passiert, wenn ein Benutzer ein zu kurzes Passwort eingibt?
  → Fehlermeldung: "Passwort muss mindestens 8 Zeichen lang sein"
- Was passiert, wenn ein Benutzer falsche Login-Daten eingibt?
  → Fehlermeldung: "E-Mail oder Passwort ist falsch" (nicht spezifizieren welches)
- Was passiert, wenn ein Passwort-Reset-Link abgelaufen ist?
  → Fehlermeldung: "Dieser Link ist abgelaufen. Bitte fordern Sie einen neuen an"
- Was passiert, wenn ein Benutzer die E-Mail-Adresse im Profil zu einer bereits existierenden ändert?
  → Fehlermeldung: "Diese E-Mail-Adresse wird bereits verwendet"

## Technical Requirements
- **Performance:** Login/Logout < 1 Sekunde
- **Security:**
  - Passwörter werden mit bcrypt gehasht
  - Session-basierte Authentifizierung über Supabase Auth
  - HTTPS für alle Auth-Endpoints
- **Browser Support:** Chrome, Firefox, Safari (aktuelle Versionen)
- **Backend:** Supabase Auth

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Added:** 2026-02-15

### Komponenten-Struktur

```
Authentifizierungs-System
│
├── Registrierungs-Seite (/signup)
│   ├── E-Mail-Eingabefeld
│   ├── Passwort-Eingabefeld (mit Sichtbarkeits-Toggle)
│   ├── Name-Eingabefeld
│   ├── "Registrieren"-Button
│   └── Link zur Login-Seite
│
├── Login-Seite (/login)
│   ├── E-Mail-Eingabefeld
│   ├── Passwort-Eingabefeld (mit Sichtbarkeits-Toggle)
│   ├── "Einloggen"-Button
│   ├── "Passwort vergessen?"-Link
│   └── Link zur Registrierungs-Seite
│
├── Passwort-Zurücksetzen-Seite (/reset-password)
│   ├── E-Mail-Eingabefeld
│   ├── "Link senden"-Button
│   └── Erfolgsmeldung
│
├── Neues-Passwort-Seite (/update-password)
│   ├── Neues-Passwort-Eingabefeld
│   ├── Passwort-Bestätigung-Eingabefeld
│   ├── "Passwort aktualisieren"-Button
│   └── Erfolgsmeldung
│
└── Profil-Seite (/profile)
    ├── Name-Eingabefeld (editierbar)
    ├── E-Mail-Eingabefeld (editierbar)
    ├── "Änderungen speichern"-Button
    └── "Ausloggen"-Button
```

**Zusätzlich benötigt:**
- Auth-Schutz-Komponente (prüft Login-Status vor geschützten Seiten)
- Error-Toast-Komponente (bereits vorhanden: Sonner)
- Loading-States (Spinner während Aktionen)

### Datenmodell

**Benutzer-Informationen (Supabase Auth):**
- Eindeutige Benutzer-ID (UUID)
- E-Mail-Adresse (eindeutig, validiert)
- Passwort (gehasht mit bcrypt)
- Name (editierbar im Profil)
- Erstellungsdatum
- Letzte Anmeldung

**Session-Informationen:**
- Session-Token (verschlüsselt, im Browser-Cookie)
- Ablaufzeit (automatisch verwaltet)

**Speicherort:** Supabase Auth (Cloud-Datenbank)

### Tech-Entscheidungen

**1. Supabase Auth**
- Supabase kümmert sich um Sicherheit (bcrypt, Token-Verwaltung, HTTPS)
- E-Mail-Versand für Passwort-Reset integriert
- Kostenlos bis 50.000 monatliche Benutzer

**2. Session-basierte Authentifizierung**
- Sicherer als JWT-Tokens im Browser-Storage
- Session-Cookie automatisch bei jedem Request
- Benutzer bleibt eingeloggt nach Browser-Neustart

**3. shadcn/ui Komponenten**
- Bereits installiert, einheitliches Design
- Barrierefrei (ARIA-Labels)

**4. React Hook Form + Zod**
- Einfache Validierung (z.B. Passwort min. 8 Zeichen)
- Fehler werden sofort angezeigt
- Weniger Server-Requests

### Benötigte Pakete

**Neu zu installieren:**
- `@supabase/supabase-js` - Supabase Client
- `@supabase/ssr` - Server-Side Rendering Support
- `react-hook-form` - Formular-Handling
- `@hookform/resolvers` - Zod-Integration
- `zod` - Schema-Validierung

**Bereits vorhanden:**
- shadcn/ui (Button, Input, Card, Form, Label, Toast)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
