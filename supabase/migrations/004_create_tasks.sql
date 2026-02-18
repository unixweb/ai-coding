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
