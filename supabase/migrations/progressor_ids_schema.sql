-- Create progressor_ids table
CREATE TABLE IF NOT EXISTS progressor_ids (
  id text PRIMARY KEY,
  practitioner_id uuid REFERENCES auth.users(id),
  is_claimed boolean DEFAULT false NOT NULL,
  assigned_email text,
  auth_user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE progressor_ids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to progressor_ids" ON progressor_ids;
DROP POLICY IF EXISTS "Allow practitioners to insert progressor_ids" ON progressor_ids;
DROP POLICY IF EXISTS "Allow update for registration claim" ON progressor_ids;

-- Allow public read access to select rows (needed to check if ID exists during registration)
CREATE POLICY "Allow public read access to progressor_ids"
  ON progressor_ids FOR SELECT
  USING (true);

-- Allow authenticated users (practitioners) to insert new IDs
CREATE POLICY "Allow practitioners to insert progressor_ids"
  ON progressor_ids FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow update access during signup registration to claim the ID
CREATE POLICY "Allow update for registration claim"
  ON progressor_ids FOR UPDATE
  USING (true);
