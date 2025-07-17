# Instructions for Clean GitHub Push

## 1. Create a clean directory
```powershell
mkdir C:\Users\Ujjawal Mishra\OneDrive\Desktop\JobZee_Clean
```

## 2. Copy all files (except .git folder) to the new directory
```powershell
Get-ChildItem -Path "C:\Users\Ujjawal Mishra\OneDrive\Desktop\JOB2" -Exclude ".git" | 
Copy-Item -Destination "C:\Users\Ujjawal Mishra\OneDrive\Desktop\JobZee_Clean" -Recurse
```

## 3. Sanitize sensitive files
Before pushing to GitHub, make these changes:

1. Edit `backend/config/config.env`:
   - Replace GOOGLE_CLIENT_ID with "YOUR_GOOGLE_CLIENT_ID"
   - Replace GOOGLE_CLIENT_SECRET with "YOUR_GOOGLE_CLIENT_SECRET"
   - Replace CLOUDINARY_API_KEY with "YOUR_CLOUDINARY_API_KEY"
   - Replace CLOUDINARY_API_SECRET with "YOUR_CLOUDINARY_API_SECRET"
   - Replace SUPABASE keys with "YOUR_SUPABASE_KEY"

2. Edit `frontend/.env`:
   - Replace VITE_GOOGLE_CLIENT_ID with "YOUR_GOOGLE_CLIENT_ID"

## 4. Initialize a new Git repository
```powershell
cd "C:\Users\Ujjawal Mishra\OneDrive\Desktop\JobZee_Clean"
git init
git add .
git commit -m "Added profile section, improved UI, filters for job search & applicants, integrated Google OAuth, resume upload"
```

## 5. Push to GitHub
```powershell
git remote add origin https://github.com/ksimon0807/JobZee.git
git push -f origin main
```

Note: This will completely replace the GitHub repository with your clean local version. All commit history will start fresh.
