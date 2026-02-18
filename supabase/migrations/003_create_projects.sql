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
