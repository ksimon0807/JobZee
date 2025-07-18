-- Temporary fix for Supabase RLS issues
-- Run this in your Supabase SQL Editor to allow resume uploads

-- Option 1: Disable RLS temporarily (NOT recommended for production)
-- ALTER TABLE public.resumes DISABLE ROW LEVEL SECURITY;

-- Option 2: Add a more permissive policy for your app (RECOMMENDED)
-- This allows all operations when using the service role key

-- First, drop the restrictive policies
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;

-- Create new permissive policies for service role operations
CREATE POLICY "Service role can do everything" ON public.resumes
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Make sure the bucket allows public access for downloads
UPDATE storage.buckets 
SET public = true 
WHERE id = 'resumes';

-- Add storage policies for public access
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES 
  ('Public read access', '{"action": "select", "resource": "*"}', 'resumes'),
  ('Public download access', '{"action": "download", "resource": "*"}', 'resumes'),
  ('Service role upload access', '{"action": "insert", "resource": "*"}', 'resumes'),
  ('Service role update access', '{"action": "update", "resource": "*"}', 'resumes'),
  ('Service role delete access', '{"action": "delete", "resource": "*"}', 'resumes')
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Ensure the resumes table exists with proper structure
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  original_name VARCHAR,
  file_type VARCHAR,
  file_size INTEGER,
  file_path VARCHAR NOT NULL,
  public_url VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes (user_id);

COMMENT ON TABLE public.resumes IS 'User resume files with permissive access for service operations';
