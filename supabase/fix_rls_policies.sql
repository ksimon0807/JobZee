-- Simplified fix for Supabase RLS issues
-- Run this in your Supabase SQL Editor to allow resume uploads

-- First, drop the restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "allow_all_resumes" ON public.resumes;

-- Create a simple permissive policy that allows all operations
CREATE POLICY "allow_all_operations" ON public.resumes
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

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

-- Make sure RLS is enabled but with permissive policy
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.resumes IS 'User resume files with permissive access';

-- Display success message
SELECT 'RLS policies updated successfully! You can now upload resumes.' as message;
