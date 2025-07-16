# Supabase Integration Checklist

This checklist will guide you through the final steps needed to complete the Supabase integration for resume storage in your JobZee application.

## 1. Run the SQL Script in Supabase

- [ ] Login to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
- [ ] Navigate to the SQL Editor
- [ ] Create a new query
- [ ] Copy the contents of `supabase/resumes_table.sql` and paste it into the SQL Editor
- [ ] Run the query to create the:
  - `resumes` table
  - `resumes` storage bucket
  - Required security policies

## 2. Verify Backend Configuration

- [ ] Confirm that `config/supabase.js` correctly initializes the Supabase client
- [ ] Ensure that `services/resumeService.js` implements the required functions:
  - `uploadResume`
  - `getUserResume`
  - `deleteResume`
- [ ] Check that the `middlewares/upload.js` is properly configured to use memory storage for Supabase uploads

## 3. Test the Backend Integration

- [ ] Run the test script: `node scripts/test-supabase.js`
- [ ] Verify that the script can:
  - Connect to Supabase
  - Upload a test file to the storage bucket
  - Create a record in the `resumes` table
  - Clean up the test data

## 4. Test the Frontend Integration

- [ ] Start both the backend and frontend servers
- [ ] Login to the application
- [ ] Navigate to the Profile page
- [ ] Test resume upload functionality:
  - Upload a PDF or image file
  - Verify it appears in the profile
- [ ] Test resume preview:
  - Click "View Resume"
  - Confirm that the resume preview works for both PDF and image files
- [ ] Test resume deletion:
  - Click "Delete Resume"
  - Verify that the resume is removed from both the UI and Supabase

## 5. Verify Storage in Supabase

- [ ] After uploading a resume, check the Supabase dashboard:
  - Go to Storage and verify the file exists in the `resumes` bucket
  - Go to Table Editor and verify the record exists in the `resumes` table

## 6. Final Cleanup

- [ ] Remove any outdated Cloudinary resume code from the project
- [ ] Update any documentation or comments to reflect the switch to Supabase
- [ ] Test all resume-related features one final time

## 7. Potential Enhancements (Optional)

- [ ] Add progress indicator during resume upload
- [ ] Implement file type validation on the frontend
- [ ] Add better error handling for Supabase connection issues
- [ ] Implement resume version history
- [ ] Add ability for employers to download applicant resumes

## Troubleshooting

If you encounter issues:

- Check browser console and server logs for specific errors
- Verify Supabase credentials in `config.env`
- Confirm that the SQL script ran successfully
- Verify that the `resumes` table and storage bucket exist
- Ensure proper CORS configuration in backend
