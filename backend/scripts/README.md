# Supabase Integration Testing Scripts

This document explains how to use the provided scripts to verify your Supabase integration for resume storage.

## Prerequisites

Before running these scripts, make sure:

1. You've executed the SQL script from `supabase/resumes_table.sql` in your Supabase dashboard.
2. Your Supabase credentials are correctly set in `backend/config/config.env`.

## Available Scripts

### 1. Test Supabase Connection

This script tests the connection to Supabase, creates a test file, and verifies the storage and database functionality.

```bash
cd backend
node scripts/test-supabase.js
```

**Expected output:** A successful connection message and confirmation that the test file was uploaded and then deleted.

### 2. List Resumes in Database

This script lists all resumes stored in the Supabase database table, with details like file name, size, type, and URL.

```bash
# List all resumes
cd backend
node scripts/list-resumes.js

# List resumes for a specific user
cd backend
node scripts/list-resumes.js [userId]
```

**Expected output:** A list of all resumes in the database, with their metadata.

### 3. List Files in Storage Bucket

This script lists all files stored in the Supabase storage bucket, with details like name, size, and mime type.

```bash
cd backend
node scripts/list-storage-files.js
```

**Expected output:** A list of all files in the storage bucket, with their metadata.

## Troubleshooting

If you encounter errors when running these scripts:

### Connection Issues

- Check that your Supabase URL and API keys in `config.env` are correct.
- Verify that your network connection allows access to Supabase.

### Missing Table or Bucket

- Confirm that you've run the SQL script in the Supabase dashboard.
- Check for any error messages when running the SQL script.

### Permission Denied

- Verify that the Row Level Security (RLS) policies were created correctly.
- Check if your Supabase service role key has the necessary permissions.

## Next Steps

After verifying that the scripts work correctly:

1. Test the full application flow:
   - Upload a resume from the frontend
   - Verify it appears in the database and storage (using these scripts)
   - Test the preview functionality
   - Test the delete functionality

2. Check if the resume upload and retrieval are working correctly in both development and production environments.

By using these scripts, you can easily diagnose any issues with the Supabase integration without having to manually check the Supabase dashboard.
