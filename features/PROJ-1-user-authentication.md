# PROJ-1: Benutzer-Authentifizierung

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-18

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

## QA Test Results (Re-test #2 -- Post tsk_ Refactoring)

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Context:** Full re-test after database table rename (tsk_ prefix). Build passes successfully.

### Database Refactoring Verification (tsk_ prefix)
- [x] /api/auth/profile uses tsk_profiles -- CORRECT
- [x] No remaining references to old table names (profiles, projects, tasks, etc.) in any API route
- [x] All JOIN references updated (tsk_teams, tsk_profiles, tsk_projects, tsk_tasks)
- [x] Build compiles cleanly with no errors

### Acceptance Criteria Status

#### AC-1: Benutzer kann sich mit E-Mail und Passwort registrieren (min. 8 Zeichen)
- [x] PASS: Signup page at /signup with E-Mail, Password (minLength=8), Name fields
- [x] PASS: Server-side Zod validation enforces min 8 chars for password
- [x] PASS: Rate limiting now applied (3 signup attempts/hour via checkRateLimit)
- [x] PASS: API validates with Zod and calls supabase.auth.signUp

#### AC-2: Nach erfolgreicher Registrierung wird der Benutzer automatisch eingeloggt
- [ ] STILL FAILING (BUG-1): Signup page line 42 calls router.push('/login') after success. User is shown "Bitte melden Sie sich an" and redirected to login page. API returns message "Registrierung erfolgreich! Bitte bestaetigen Sie Ihre E-Mail-Adresse." -- NOT auto-logged-in.

#### AC-3: Benutzer kann sich mit E-Mail und Passwort einloggen
- [x] PASS: Login page at /login with E-Mail and Password fields
- [x] PASS: Generic error "E-Mail oder Passwort ist falsch" (no info leak)

#### AC-4: Nach erfolgreichem Login wird der Benutzer zum Dashboard weitergeleitet
- [x] PASS: window.location.href = '/dashboard' (correct per frontend rules)

#### AC-5: Benutzer kann sich ausloggen und wird zur Login-Seite weitergeleitet
- [ ] STILL FAILING (BUG-2): navigation.tsx line 23 and profile/page.tsx line 88 both use window.location.href = '/' instead of '/login'

#### AC-6: Benutzer kann eine Passwort-Zuruecksetzen-E-Mail anfordern
- [x] PASS: Reset password page at /reset-password, rate-limited (3/hour)

#### AC-7: Passwort-Reset-Link ist 24 Stunden gueltig
- [x] PASS: Supabase Auth manages token expiry

#### AC-8: Benutzer kann seinen Namen und E-Mail-Adresse im Profil aendern
- [ ] STILL FAILING (BUG-3): Email field disabled at profile/page.tsx line 179 with disabled attribute and "bg-muted" class. Text says "E-Mail-Adresse kann nicht geaendert werden". handleSubmit (line 67) only sends { name: formData.name } without email.
- [x] PASS: Name field editable, submits to PUT /api/auth/profile

#### AC-9: E-Mail-Adresse muss eindeutig sein (keine Duplikate)
- [x] PASS: API checks for duplicates on both signup and profile update

#### AC-10: Fehlermeldungen werden klar und verstaendlich angezeigt
- [x] PASS: All German error messages, toast notifications

### Edge Cases Status

#### EC-1: Already registered email at signup
- [x] PASS: Returns "Diese E-Mail-Adresse ist bereits registriert"

#### EC-2: Too short password
- [x] PASS: Zod min 8, HTML minLength=8

#### EC-3: Wrong login credentials
- [x] PASS: Generic error message

#### EC-4: Expired password reset link
- [x] PASS: Handled correctly

#### EC-5: Change email to existing email in profile
- [ ] STILL BLOCKED: Cannot test -- email field disabled (BUG-3)

### Security Audit Results
- [x] FIXED (was BUG-4): Rate limiting NOW applied to login (5/15min), signup (3/hr), reset-password (3/hr) via checkRateLimit import
- [x] FIXED (was BUG-5): Security headers NOW configured in next.config.ts: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: origin-when-cross-origin, HSTS, X-XSS-Protection, Permissions-Policy
- [x] FIXED (was BUG-6): Auth callback NOW validates redirect with ALLOWED_REDIRECTS whitelist and isValidRedirect() function. External URLs rejected.
- [x] Authentication: Middleware protects /projects, /profile, /team, /dashboard routes
- [x] Password hashing: Handled by Supabase Auth (bcrypt)
- [x] Server-side validation: All auth APIs use Zod schemas
- [ ] STILL OPEN (BUG-7): Login API (login/route.ts line 36-39) returns session: data.session in response body. Session token should not be in response body since cookies handle session.
- [ ] STILL OPEN (BUG-R1): Password-reset redirectTo URL uses request.headers.get('origin') (reset-password/route.ts line 24) which can be spoofed. Should use a hardcoded or env-var URL.
- [ ] STILL OPEN (BUG-R2): Signup emailRedirectTo also uses request.headers.get('origin') (signup/route.ts line 32). Same spoofing concern.
- [ ] STILL OPEN (BUG-R3): Profile GET endpoint uses .select('*') instead of specific columns. Could leak internal fields if tsk_profiles table gains sensitive columns.

### Bugs Found (Updated)

#### BUG-1: Auto-login after registration not implemented [STILL OPEN]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/app/signup/page.tsx line 42
- **Steps to Reproduce:**
  1. Go to /signup, fill valid data, submit
  2. Expected: Auto-logged-in, redirected to dashboard
  3. Actual: Redirected to /login with "Bitte melden Sie sich an"
- **Priority:** Fix before deployment

#### BUG-2: Logout redirects to landing page instead of login page [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/components/navigation.tsx line 23, /home/joachim/git/kit2/src/app/profile/page.tsx line 88
- **Steps to Reproduce:**
  1. Click "Abmelden" anywhere
  2. Expected: Redirected to /login
  3. Actual: Redirected to /
- **Priority:** Fix before deployment

#### BUG-3: Profile page does not allow email editing [STILL OPEN]
- **Severity:** High
- **Location:** /home/joachim/git/kit2/src/app/profile/page.tsx lines 175-184
- **Steps to Reproduce:**
  1. Navigate to /profile
  2. Expected: Email field editable
  3. Actual: Email field disabled
- **Priority:** Fix before deployment

#### BUG-4: No rate limiting on auth endpoints [FIXED]
- Rate limiting now applied via checkRateLimit on login, signup, reset-password

#### BUG-5: Missing security headers [FIXED]
- All required headers configured in next.config.ts

#### BUG-6: Open redirect vulnerability [FIXED]
- Auth callback now uses ALLOWED_REDIRECTS whitelist

#### BUG-7: Session token leaked in login API response body [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/api/auth/login/route.ts lines 36-39
- **Steps to Reproduce:**
  1. POST to /api/auth/login with valid credentials
  2. Response includes session: data.session with access_token
- **Priority:** Fix before deployment

#### BUG-8: Password visibility toggle missing [STILL OPEN]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/app/login/page.tsx, /home/joachim/git/kit2/src/app/signup/page.tsx
- **Priority:** Fix in next sprint

#### BUG-R1: Origin header spoofable in password-reset redirectTo [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/api/auth/reset-password/route.ts line 24
- **Priority:** Fix before deployment

#### BUG-R2: Origin header spoofable in signup emailRedirectTo [STILL OPEN]
- **Severity:** Medium
- **Location:** /home/joachim/git/kit2/src/app/api/auth/signup/route.ts line 32
- **Priority:** Fix before deployment

#### BUG-R3: Profile GET uses .select('*') [STILL OPEN]
- **Severity:** Low
- **Location:** /home/joachim/git/kit2/src/app/api/auth/profile/route.ts line 21
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 7/10 passed (up from 6/10)
- **Previously found bugs:** 3 FIXED (BUG-4, BUG-5, BUG-6), 5 STILL OPEN (BUG-1, BUG-2, BUG-3, BUG-7, BUG-8)
- **New bugs:** 3 (BUG-R1, BUG-R2, BUG-R3 -- all previously noted but now formally tracked)
- **Remaining bugs:** 8 total (0 critical, 2 high, 4 medium, 2 low)
- **tsk_ Refactoring Impact:** NONE -- auth feature uses tsk_profiles correctly, no regression
- **Security:** Significantly improved (rate limiting added, security headers added, open redirect fixed)
- **Production Ready:** NO (2 high-severity bugs remain: BUG-1, BUG-3)
- **Recommendation:** Fix BUG-1 (auto-login) and BUG-3 (email editing) before deployment. BUG-7 and BUG-2 are medium priority.

## Deployment
_To be added by /deploy_
