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
