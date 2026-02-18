
-- ============================================
-- ALLE MIGRATIONEN KOMBINIERT
-- Führe diese Datei in Supabase SQL Editor aus
-- ============================================

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
-- Teams table in taskmanager schema
CREATE TABLE taskmanager.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table with roles
CREATE TYPE taskmanager.team_role AS ENUM ('admin', 'member', 'viewer');

CREATE TABLE taskmanager.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES taskmanager.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role taskmanager.team_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TYPE taskmanager.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

CREATE TABLE taskmanager.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES taskmanager.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role taskmanager.team_role NOT NULL DEFAULT 'member',
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  status taskmanager.invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_members_team_id ON taskmanager.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON taskmanager.team_members(user_id);
CREATE INDEX idx_team_invitations_token ON taskmanager.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON taskmanager.team_invitations(email);

-- RLS Policies for teams
ALTER TABLE taskmanager.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams they are members of"
  ON taskmanager.teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their team"
  ON taskmanager.teams FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_members
ALTER TABLE taskmanager.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their teams"
  ON taskmanager.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team members"
  ON taskmanager.team_members FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for team_invitations
ALTER TABLE taskmanager.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invitations for their teams"
  ON taskmanager.team_invitations FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create invitations"
  ON taskmanager.team_invitations FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update invitations"
  ON taskmanager.team_invitations FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create default team for new users
CREATE OR REPLACE FUNCTION taskmanager.create_default_team_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Create a default team for the new user
  INSERT INTO taskmanager.teams (name)
  VALUES (NEW.email || '''s Team')
  RETURNING id INTO new_team_id;

  -- Add user as admin of their team
  INSERT INTO taskmanager.team_members (team_id, user_id, role)
  VALUES (new_team_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create team for new users
CREATE TRIGGER on_auth_user_created_create_team
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION taskmanager.create_default_team_for_user();
-- Profiles table in taskmanager schema (extends auth.users)
CREATE TABLE taskmanager.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE taskmanager.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON taskmanager.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON taskmanager.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile for new users
CREATE OR REPLACE FUNCTION taskmanager.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO taskmanager.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION taskmanager.create_profile_for_user();
-- Projects table in taskmanager schema (team-based ownership)
CREATE TYPE taskmanager.project_status AS ENUM ('active', 'archived');

CREATE TABLE taskmanager.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES taskmanager.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT,
  status taskmanager.project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_team_id ON taskmanager.projects(team_id);
CREATE INDEX idx_projects_status ON taskmanager.projects(status);

-- RLS Policies
ALTER TABLE taskmanager.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view projects"
  ON taskmanager.projects FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and Members can create projects"
  ON taskmanager.projects FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can update projects"
  ON taskmanager.projects FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can delete projects"
  ON taskmanager.projects FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM taskmanager.team_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'member')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION taskmanager.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for projects
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON taskmanager.projects
  FOR EACH ROW
  EXECUTE FUNCTION taskmanager.update_updated_at();
-- Tasks table in taskmanager schema
CREATE TYPE taskmanager.task_status AS ENUM ('to_do', 'in_progress', 'completed');

CREATE TABLE taskmanager.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES taskmanager.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status taskmanager.task_status NOT NULL DEFAULT 'to_do',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_project_id ON taskmanager.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON taskmanager.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON taskmanager.tasks(status);
CREATE INDEX idx_tasks_due_date ON taskmanager.tasks(due_date);

-- RLS Policies
ALTER TABLE taskmanager.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view tasks"
  ON taskmanager.tasks FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM taskmanager.projects p
      INNER JOIN taskmanager.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and Members can create tasks"
  ON taskmanager.tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM taskmanager.projects p
      INNER JOIN taskmanager.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can update tasks"
  ON taskmanager.tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM taskmanager.projects p
      INNER JOIN taskmanager.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can delete tasks"
  ON taskmanager.tasks FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM taskmanager.projects p
      INNER JOIN taskmanager.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

-- Trigger for tasks
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON taskmanager.tasks
  FOR EACH ROW
  EXECUTE FUNCTION taskmanager.update_updated_at();
-- Add INSERT policy for profiles table
-- This allows the API to create profiles automatically if they don't exist

CREATE POLICY "Users can insert their own profile"
  ON taskmanager.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
-- Backfill: Create default teams for existing users without team membership
-- This fixes users who were created before the auto-team trigger was deployed

DO $$
DECLARE
  user_record RECORD;
  new_team_id UUID;
BEGIN
  -- Loop through all users who don't have a team membership
  FOR user_record IN
    SELECT u.id, u.email
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM taskmanager.team_members tm
      WHERE tm.user_id = u.id
    )
  LOOP
    -- Create a default team for this user
    INSERT INTO taskmanager.teams (name)
    VALUES (user_record.email || '''s Team')
    RETURNING id INTO new_team_id;

    -- Add user as admin of their team
    INSERT INTO taskmanager.team_members (team_id, user_id, role)
    VALUES (new_team_id, user_record.id, 'admin');

    RAISE NOTICE 'Created team for user: %', user_record.email;
  END LOOP;
END $$;
-- Add INSERT policy for teams table
-- This allows users to create their own teams

CREATE POLICY "Users can create teams"
  ON taskmanager.teams FOR INSERT
  WITH CHECK (true);  -- Any authenticated user can create a team

-- Add INSERT policy for team_members table
-- This allows the API to add the user as admin of their new team

CREATE POLICY "Users can join as team admin"
  ON taskmanager.team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);  -- Users can only add themselves
