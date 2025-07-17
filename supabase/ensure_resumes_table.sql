CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size BIGINT,
  file_path VARCHAR(255),
  public_url VARCHAR(500) NOT NULL,
  storage VARCHAR(50) DEFAULT 'supabase',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Set up RLS policies to allow authenticated access
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their own resumes
CREATE POLICY IF NOT EXISTS "Users can view own resumes" 
  ON resumes FOR SELECT 
  USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own resumes
CREATE POLICY IF NOT EXISTS "Users can insert own resumes" 
  ON resumes FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow users to update their own resumes
CREATE POLICY IF NOT EXISTS "Users can update own resumes" 
  ON resumes FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Policy to allow users to delete their own resumes
CREATE POLICY IF NOT EXISTS "Users can delete own resumes" 
  ON resumes FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Grant service role full access for backend operations
GRANT ALL ON TABLE resumes TO service_role;
