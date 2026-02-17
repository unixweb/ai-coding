# Backend Setup Anleitung

## 🚀 Supabase Konfiguration

### 1. Environment Variables einrichten

Kopiere `.env.local.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.local.example .env.local
```

Füge deine Supabase-Credentials hinzu:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

**Wo finde ich diese Werte?**
1. Gehe zu [supabase.com](https://supabase.com)
2. Öffne dein Projekt
3. Navigiere zu **Settings** → **API**
4. Kopiere **Project URL** und **anon public** key

### 2. SQL Migrations ausführen

Die SQL-Migrations befinden sich in `supabase/migrations/`. Führe sie in dieser Reihenfolge aus:

1. Gehe zu deinem Supabase Dashboard
2. Navigiere zu **SQL Editor**
3. Erstelle eine neue Query
4. Kopiere den Inhalt von **001_create_teams.sql** und führe ihn aus
5. Wiederhole das für **002_create_profiles.sql**, **003_create_projects.sql**, **004_create_tasks.sql**

**Migrations:**
- `001_create_teams.sql` - Teams, Team Members, Invitations (mit RLS)
- `002_create_profiles.sql` - User Profiles (mit RLS)
- `003_create_projects.sql` - Projects (team-basiert, mit RLS)
- `004_create_tasks.sql` - Tasks (mit Foreign Keys, mit RLS)

### 3. E-Mail-Authentifizierung konfigurieren

1. Gehe zu **Authentication** → **Settings** im Supabase Dashboard
2. Aktiviere **Email** als Auth Provider (sollte standardmäßig aktiviert sein)
3. **Optional:** Passe E-Mail-Templates an unter **Email Templates**

### 4. Lokaler Test

```bash
npm run dev
```

Navigiere zu `http://localhost:3000` und teste:
- Registrierung
- Login
- Projekt erstellen
- Task erstellen

## 📚 API Routes Übersicht

### Auth (PROJ-1)
- `POST /api/auth/signup` - Registrierung
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/reset-password` - Passwort zurücksetzen
- `POST /api/auth/update-password` - Neues Passwort setzen
- `GET /api/auth/profile` - Profil abrufen
- `PUT /api/auth/profile` - Profil aktualisieren

### Projects (PROJ-2)
- `GET /api/projects` - Alle Projekte abrufen
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/[id]` - Projekt-Details
- `PUT /api/projects/[id]` - Projekt aktualisieren
- `DELETE /api/projects/[id]` - Projekt löschen

### Tasks (PROJ-3)
- `GET /api/tasks` - Alle Tasks abrufen (mit Filtern)
- `POST /api/tasks` - Neuen Task erstellen
- `GET /api/tasks/[id]` - Task-Details
- `PUT /api/tasks/[id]` - Task aktualisieren
- `DELETE /api/tasks/[id]` - Task löschen

### Teams (PROJ-4)
- `GET /api/teams/members` - Team-Mitglieder abrufen
- `PUT /api/teams/members/[id]` - Rolle ändern
- `DELETE /api/teams/members/[id]` - Mitglied entfernen
- `GET /api/teams/invitations` - Einladungen abrufen
- `POST /api/teams/invitations` - Einladung senden
- `POST /api/teams/invitations/accept` - Einladung annehmen

### Dashboard (PROJ-5)
- `GET /api/dashboard/stats` - Statistiken abrufen
- `GET /api/dashboard/project-progress` - Projekt-Fortschritt

## 🔒 Sicherheit

### Row Level Security (RLS)
Alle Tabellen haben RLS aktiviert:
- **teams** - Nur Team-Mitglieder können ihr Team sehen
- **team_members** - Nur Team-Mitglieder können Mitglieder sehen, nur Admins können verwalten
- **team_invitations** - Nur Admins können Einladungen sehen/erstellen
- **profiles** - Benutzer können nur ihr eigenes Profil sehen
- **projects** - Nur Team-Mitglieder können Projekte sehen, nur Admins/Members können erstellen/bearbeiten
- **tasks** - Nur Team-Mitglieder können Tasks sehen, nur Admins/Members können erstellen/bearbeiten

### Rate Limiting
Implementiert in `src/lib/rate-limit.ts`:
- Standard: 100 Requests pro Minute pro IP
- Bei Überschreitung: 429 Too Many Requests
- Für Production: Verwende Redis oder Upstash Rate Limit

## 🎯 Team-basierte Architektur

**Wichtig:** Dieses Projekt verwendet ein **team-basiertes Ownership-Modell**:

- Jeder neue Benutzer bekommt automatisch ein Standard-Team erstellt (via Trigger)
- Der erste Benutzer wird automatisch **Admin** seines Teams
- Projekte gehören zu einem **Team**, nicht zu einem einzelnen User
- Alle Team-Mitglieder können Projekte sehen (basierend auf ihrer Rolle)
- Tasks gehören zu Projekten und folgen den gleichen Berechtigungen

**Rollen:**
- **Admin** - Volle Rechte (Team verwalten, Projekte/Tasks erstellen/bearbeiten)
- **Member** - Kann Projekte/Tasks erstellen/bearbeiten (kann kein Team verwalten)
- **Viewer** - Nur Lese-Zugriff

## 🐛 Troubleshooting

### "Relation does not exist" Fehler
→ SQL Migrations noch nicht ausgeführt. Siehe Schritt 2 oben.

### "Row Level Security policy violation"
→ Prüfe, ob du eingeloggt bist und Mitglied des Teams bist.

### "Email not confirmed"
→ Gehe zu Supabase Dashboard → **Authentication** → **Settings** → Deaktiviere **Confirm email**

### Rate Limit Fehler (429)
→ Warte 60 Sekunden oder lösche den In-Memory Store (Server neu starten)

## 📝 Nächste Schritte

1. ✅ Supabase konfiguriert
2. ✅ SQL Migrations ausgeführt
3. ✅ Lokal getestet
4. 🚀 **Deploy auf Vercel:**
   - Push zu Git
   - Vercel Project erstellen
   - Environment Variables in Vercel hinzufügen
   - Automatic deployment!
