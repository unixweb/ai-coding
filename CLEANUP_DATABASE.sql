-- ============================================
-- CLEANUP: Löscht das komplette taskmanager Schema
-- ACHTUNG: Löscht ALLE Daten in diesem Schema!
-- ============================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_create_team ON auth.users;

-- Drop all functions
DROP FUNCTION IF EXISTS taskmanager.create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS taskmanager.create_default_team_for_user() CASCADE;

-- Drop the entire schema (CASCADE removes all tables, types, policies automatically)
DROP SCHEMA IF EXISTS taskmanager CASCADE;

-- Verify cleanup
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'taskmanager';
-- Should return 0 rows if cleanup was successful
