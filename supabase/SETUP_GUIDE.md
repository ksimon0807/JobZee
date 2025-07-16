# Supabase Table Setup Guide

This document provides instructions for setting up the Supabase tables needed for resume storage in the JobZee application.

## Prerequisites

1. You should already have a Supabase account and project created.
2. Your Supabase credentials should be set in `backend/config/config.env`.

## Setup Steps

### 1. Login to Supabase Dashboard

- Go to [https://app.supabase.com/](https://app.supabase.com/) and log in.
- Select your project (the one with the URL matching your `SUPABASE_PROJECT_URL` in `config.env`).

### 2. Run the SQL Script

1. In the Supabase dashboard, click on **SQL Editor** in the left sidebar.
2. Click on **New query** to create a new SQL query.
3. Open the file `supabase/resumes_table.sql` in your local project.
4. Copy all the contents of this file.
5. Paste the contents into the SQL Editor in the Supabase dashboard.
6. Click the **Run** button to execute the script.

### 3. Verify Setup

After running the script, you should verify that everything was set up correctly:

1. Go to **Table Editor** in the left sidebar.
2. You should see a `resumes` table in the list.
3. Go to **Storage** in the left sidebar.
4. You should see a `resumes` bucket in the list.

### 4. Verify Policies

1. In the Supabase dashboard, click on **Authentication** in the left sidebar.
2. Click on **Policies**.
3. Ensure there are policies for the `resumes` table allowing users to:
   - View their own resumes
   - Insert their own resumes
   - Update their own resumes
   - Delete their own resumes

## Test the Implementation

After completing the setup, run the test script from your local machine:

```bash
cd backend
node scripts/test-supabase.js
```

If everything is set up correctly, you should see a successful test result without any errors.

## Troubleshooting

If you encounter errors:

- Check that your Supabase credentials are correct in `config.env`.
- Ensure the SQL script ran successfully without errors.
- Verify that the `resumes` table and storage bucket exist.
- Check that the Row Level Security policies are correctly set up.
