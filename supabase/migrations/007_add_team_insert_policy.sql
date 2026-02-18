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
