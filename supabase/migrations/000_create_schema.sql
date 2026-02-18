-- Create new schema for the project management app
CREATE SCHEMA IF NOT EXISTS taskmanager;

-- Grant usage on schema
GRANT USAGE ON SCHEMA taskmanager TO anon, authenticated, service_role;
GRANT ALL ON SCHEMA taskmanager TO postgres, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA taskmanager
GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA taskmanager
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Add schema to search path (optional, makes queries easier)
ALTER DATABASE postgres SET search_path TO taskmanager, public, extensions;
