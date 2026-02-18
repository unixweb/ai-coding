-- Add INSERT policy for profiles table
-- This allows the API to create profiles automatically if they don't exist

CREATE POLICY "Users can insert their own profile"
  ON taskmanager.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
