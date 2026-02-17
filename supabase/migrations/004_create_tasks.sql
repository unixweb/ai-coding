-- Tasks table
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'completed');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status task_status NOT NULL DEFAULT 'to_do',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view tasks"
  ON tasks FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and Members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can update tasks"
  ON tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

CREATE POLICY "Admins and Members can delete tasks"
  ON tasks FOR DELETE
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      INNER JOIN team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid() AND tm.role IN ('admin', 'member')
    )
  );

-- Trigger for tasks
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
