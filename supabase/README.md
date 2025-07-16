# Supabase Integration for Resume Management

This document outlines the integration of Supabase for resume storage and management in the JobZee application.

## Overview

The integration replaces Cloudinary with Supabase for resume storage, providing:
- File storage in Supabase Storage (pdf, jpg, png)
- Resume metadata in a Supabase table
- Upload, retrieve, and delete functionality
- Preview capabilities in the frontend

## Setup Instructions

### 1. Create Supabase Project

If you haven't already, create a Supabase project at [supabase.com](https://supabase.com).

### 2. Setup Environment Variables

Ensure these environment variables are set in `backend/config/config.env`:

```
SUPABASE_PROJECT_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Create Storage Bucket and Table

Run the SQL script in `supabase/resumes_table.sql` using the Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Select "SQL Editor" from the left sidebar
3. Create a "New Query"
4. Paste the contents of `supabase/resumes_table.sql`
5. Click "Run"

### 4. Test the Implementation

Run the test script to verify the Supabase connection:

```bash
cd backend
node scripts/test-supabase.js
```

## Usage

### Backend

The resume management functionality is implemented through:

- `config/supabase.js` - Supabase client initialization
- `services/resumeService.js` - Resume operations (upload, retrieve, delete)
- `controllers/userController.js` - API endpoints for resume operations
- `routes/userRouter.js` - API routes for resume endpoints
- `middlewares/upload.js` - File upload middleware

### Frontend

Resume management in the frontend includes:

- `src/components/Profile/Profile.jsx` - Resume upload/display in user profile
- `src/components/Profile/ResumePreview.jsx` - Resume preview component

## API Endpoints

- `POST /api/v1/user/profile/resume` - Upload a resume
- `GET /api/v1/user/profile/resume` - Get current user's resume
- `GET /api/v1/user/profile/resume/:userId` - Get specific user's resume (for employers)
- `DELETE /api/v1/user/profile/resume/:resumeId` - Delete a resume

## Testing

After setup, test the full flow:

1. Log in to the application
2. Go to the Profile page
3. Upload a resume file (PDF or image)
4. Verify the resume appears in the profile
5. Test the preview functionality
6. Test the delete functionality

## Troubleshooting

If you encounter issues:

1. Check browser console and server logs for errors
2. Verify Supabase credentials are correct
3. Ensure the SQL script ran successfully
4. Check CORS settings if you see cross-origin errors
5. Run the test script to verify connectivity

## Security Considerations

- Row-Level Security (RLS) policies are in place to protect resume data
- Users can only access their own resumes
- Employers can only access resumes of applicants to their jobs

## Known Limitations

- File size is limited to 5MB
- Only PDF and image files are supported
