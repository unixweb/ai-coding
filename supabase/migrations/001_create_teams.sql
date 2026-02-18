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
