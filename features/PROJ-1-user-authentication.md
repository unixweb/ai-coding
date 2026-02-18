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

## QA Test Results

**Tested:** 2026-02-18
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Benutzer kann sich mit E-Mail und Passwort registrieren (min. 8 Zeichen)
- [x] Signup page exists at /signup with E-Mail, Password, Name fields
- [x] Server-side Zod validation enforces min 8 chars for password
- [x] Client-side HTML minLength=8 attribute present
- [x] API route /api/auth/signup validates with Zod and calls supabase.auth.signUp

#### AC-2: Nach erfolgreicher Registrierung wird der Benutzer automatisch eingeloggt
- [ ] BUG: After successful signup, user is redirected to /login with message "Bitte melden Sie sich an" -- NOT auto-logged-in as required. The signup page calls router.push('/login') instead of logging in. The API also returns a message saying "Bitte bestaetigen Sie Ihre E-Mail-Adresse" suggesting email confirmation is required before login. This contradicts the AC that says user should be auto-logged-in after registration.

#### AC-3: Benutzer kann sich mit E-Mail und Passwort einloggen
- [x] Login page exists at /login with E-Mail and Password fields
- [x] API route /api/auth/login validates with Zod and calls supabase.auth.signInWithPassword
- [x] Generic error message "E-Mail oder Passwort ist falsch" used (does not leak which is wrong)

#### AC-4: Nach erfolgreichem Login wird der Benutzer zum Dashboard weitergeleitet
- [x] Login page uses window.location.href = '/dashboard' after successful login (correct per frontend rules)

#### AC-5: Benutzer kann sich ausloggen und wird zur Login-Seite weitergeleitet
- [ ] BUG: Logout redirects to '/' (root/landing page) instead of '/login' as required. Both navigation.tsx (line 23) and profile/page.tsx (line 75) use window.location.href = '/' after logout.

#### AC-6: Benutzer kann eine Passwort-Zuruecksetzen-E-Mail anfordern
- [x] Reset password page exists at /reset-password
- [x] API route calls supabase.auth.resetPasswordForEmail
- [x] Success state shows confirmation message

#### AC-7: Passwort-Reset-Link ist 24 Stunden gueltig
- [x] Frontend displays "Der Link ist 24 Stunden gueltig" message
- [x] Supabase Auth manages token expiry server-side (configurable in Supabase dashboard)

#### AC-8: Benutzer kann seinen Namen und E-Mail-Adresse im Profil aendern
- [ ] BUG: Profile page has E-Mail field DISABLED (line 121: disabled, className="bg-muted") with text "E-Mail-Adresse kann nicht geaendert werden". The AC requires that users CAN change their email. The API PUT /api/auth/profile supports email updates but the frontend prevents it.
- [x] Name field is editable and submits to PUT /api/auth/profile

#### AC-9: E-Mail-Adresse muss eindeutig sein (keine Duplikate)
- [x] API checks for duplicate key error from Supabase and returns "Diese E-Mail-Adresse wird bereits verwendet"
- [x] Signup API returns "Diese E-Mail-Adresse ist bereits registriert" for duplicate emails

#### AC-10: Fehlermeldungen werden klar und verstaendlich angezeigt
- [x] All API routes return German error messages
- [x] Toast notifications used for success/error feedback
- [x] Zod validation messages in German

### Edge Cases Status

#### EC-1: Already registered email at signup
- [x] API checks for 'already registered' in error message and returns appropriate German error

#### EC-2: Too short password
- [x] Server-side Zod schema enforces min 8 chars
- [x] Client-side HTML minLength=8 attribute present

#### EC-3: Wrong login credentials
- [x] Generic error message "E-Mail oder Passwort ist falsch" used (correct -- does not reveal which is wrong)

#### EC-4: Expired password reset link
- [x] Update-password page checks URL hash for recovery token
- [x] Redirects to /reset-password with error toast if invalid/missing token

#### EC-5: Change email to existing email in profile
- [ ] BUG: Cannot be tested because the email field is disabled in the profile UI (see AC-8 bug above)

### Security Audit Results
- [x] Authentication: Middleware protects /projects, /profile, /team, /dashboard routes; redirects to /login if no user
- [ ] BUG: Rate limiting is NOT applied to ANY auth endpoint. The rate-limit.ts utility exists but is never imported or used in any API route. Login, signup, and reset-password endpoints are all vulnerable to brute-force attacks.
- [ ] BUG: Security headers are NOT configured. next.config.ts is empty -- no X-Frame-Options, no X-Content-Type-Options, no Referrer-Policy, no Strict-Transport-Security headers. This violates the security rules in .claude/rules/security.md.
- [ ] BUG: Login API returns full session object (data.session) in response body (line 33 of login/route.ts). This is unnecessary since session is managed via cookies. Exposing the session token in the response body is an information leak.
- [x] Password hashing: Handled by Supabase Auth (bcrypt)
- [x] Server-side validation: All auth APIs use Zod schemas
- [ ] BUG: Auth callback route at /api/auth/callback uses unvalidated 'next' query parameter for redirect (line 7). An attacker could craft a URL like /api/auth/callback?code=...&next=https://evil.com to redirect users to a malicious site (Open Redirect vulnerability).
- [ ] BUG: The password-reset redirectTo URL uses request.headers.get('origin') which can be spoofed by an attacker in certain environments. Should use a hardcoded or env-var-based URL.
- [x] Input validation: Zod used for all request body parsing
- [ ] BUG: Profile GET endpoint returns all columns with .select('*') instead of specific columns. Could leak internal fields if profiles table gains sensitive columns in the future.

### Bugs Found

#### BUG-1: Auto-login after registration not implemented
- **Severity:** High
- **Steps to Reproduce:**
  1. Go to /signup
  2. Fill in valid name, email, password
  3. Click "Registrieren"
  4. Expected: User is automatically logged in and redirected to dashboard
  5. Actual: User is redirected to /login with message to sign in manually
- **Priority:** Fix before deployment

#### BUG-2: Logout redirects to landing page instead of login page
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in successfully
  2. Click "Abmelden" in navigation or profile page
  3. Expected: Redirected to /login
  4. Actual: Redirected to / (landing page)
- **Priority:** Fix before deployment

#### BUG-3: Profile page does not allow email editing
- **Severity:** High
- **Steps to Reproduce:**
  1. Log in and navigate to /profile
  2. Expected: Both name and email fields are editable
  3. Actual: Email field is disabled with message "E-Mail-Adresse kann nicht geaendert werden"
- **Priority:** Fix before deployment

#### BUG-4: No rate limiting on auth endpoints
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Send rapid POST requests to /api/auth/login with different passwords
  2. Expected: After N attempts, receive 429 Too Many Requests
  3. Actual: All requests are processed without any rate limiting
- **Priority:** Fix before deployment

#### BUG-5: Missing security headers
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Inspect response headers from any page
  2. Expected: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS headers present
  3. Actual: None of these security headers are configured
- **Priority:** Fix before deployment

#### BUG-6: Open redirect vulnerability in auth callback
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Craft URL: /api/auth/callback?code=valid_code&next=https://evil.com
  2. Expected: Redirect only to internal paths
  3. Actual: Redirects to arbitrary external URLs
- **Priority:** Fix before deployment

#### BUG-7: Session token leaked in login API response body
- **Severity:** Medium
- **Steps to Reproduce:**
  1. POST to /api/auth/login with valid credentials
  2. Inspect response JSON
  3. Expected: Only success status returned (session managed via cookies)
  4. Actual: Full session object including access_token is in response body
- **Priority:** Fix before deployment

#### BUG-8: Password visibility toggle missing on login and signup forms
- **Severity:** Low
- **Steps to Reproduce:**
  1. Go to /login or /signup
  2. Expected: Password field has a visibility toggle (eye icon) as specified in tech design
  3. Actual: Standard password input without visibility toggle
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 6/10 passed
- **Bugs Found:** 8 total (3 critical, 2 high, 2 medium, 1 low)
- **Security:** Issues found (rate limiting missing, security headers missing, open redirect, session token leak)
- **Production Ready:** NO
- **Recommendation:** Fix critical and high bugs first (BUG-4, BUG-5, BUG-6, BUG-1, BUG-3), then address medium bugs

## Deployment
_To be added by /deploy_
