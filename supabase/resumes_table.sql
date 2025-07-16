/* 
SQL script to create resumes and profile-related tables in Supabase (non-destructive)

To create these tables:
1. Go to your Supabase project: https://ucfwcwdmtnetwljgzavq.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Create a "New Query"
4. Copy and paste this SQL script
5. Click "Run" to execute the script
*/

-- Create the resumes table (non-destructive)
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

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes (user_id);

-- Create or replace function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp whenever a row is updated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_resumes_updated_at'
  ) THEN
    CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'resumes', 'resumes', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'resumes'
);

-- Add upload/download policies for the resumes bucket (if storage.policies table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
    -- Allow authenticated users to upload
    INSERT INTO storage.policies (name, definition, bucket_id)
    SELECT 'Authenticated users can upload', '{"action": "upload", "role": "authenticated"}', 'resumes'
    WHERE NOT EXISTS (
      SELECT 1 FROM storage.policies WHERE bucket_id = 'resumes' AND name = 'Authenticated users can upload'
    );
    -- Allow public download
    INSERT INTO storage.policies (name, definition, bucket_id)
    SELECT 'Public download', '{"action": "download", "role": "anon"}', 'resumes'
    WHERE NOT EXISTS (
      SELECT 1 FROM storage.policies WHERE bucket_id = 'resumes' AND name = 'Public download'
    );
  END IF;
END $$;

-- NOTE: Storage bucket policies must be set via the Supabase Dashboard UI.
-- Go to Storage > resumes bucket > Policies tab and add upload/download policies as needed.

-- Grant RLS privileges on the resumes table
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resumes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resumes' AND tablename = 'resumes') THEN
    CREATE POLICY "Users can view their own resumes" ON public.resumes
      FOR SELECT USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- Policy: Users can insert their own resumes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own resumes' AND tablename = 'resumes') THEN
    CREATE POLICY "Users can insert their own resumes" ON public.resumes
      FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  END IF;
END $$;

-- Policy: Users can update their own resumes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own resumes' AND tablename = 'resumes') THEN
    CREATE POLICY "Users can update their own resumes" ON public.resumes
      FOR UPDATE USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- Policy: Users can delete their own resumes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own resumes' AND tablename = 'resumes') THEN
    CREATE POLICY "Users can delete their own resumes" ON public.resumes
      FOR DELETE USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- Policy: Employers can view job applicants' resumes (commented out until applications schema is finalized)
/*
CREATE POLICY "Employers can view job applicants' resumes" ON public.resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE public.applications.applicant_id = user_id
        AND public.applications.employer_id = auth.uid()::text
    )
  );
*/

-- Allow all actions on resumes table (for testing only!)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_resumes' AND tablename = 'resumes'
  ) THEN
    EXECUTE 'CREATE POLICY allow_all_resumes ON public.resumes FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

COMMENT ON TABLE public.resumes IS 'User resume files stored in Supabase storage';

-- Create the profiles table (non-destructive, for user details)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create the profile_pictures table (non-destructive, for user avatars)
CREATE TABLE IF NOT EXISTS public.profile_pictures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  CONSTRAINT fk_profile_picture_user FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Create the products table (non-destructive)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  features TEXT[], -- Use TEXT[] for array of features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add FK to auth.users for profiles (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Create the orders table (non-destructive)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'paid',
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Create the order_items table (non-destructive)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  product_id UUID,
  name TEXT,
  price NUMERIC,
  quantity INTEGER,
  image TEXT,
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
