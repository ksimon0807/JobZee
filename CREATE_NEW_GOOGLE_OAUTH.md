# How to Create a New Google OAuth Client ID

## Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Create a new project or select an existing one

## Step 2: Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" 
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth 2.0 Client IDs"

## Step 4: Configure the OAuth Client
1. **Application type**: Web application
2. **Name**: JobZee App (or any name you prefer)
3. **Authorized JavaScript origins**:
   - http://localhost:5173
   - http://localhost:4000
4. **Authorized redirect URIs** (optional for our implementation):
   - http://localhost:5173/auth/callback
   - http://localhost:4000/auth/callback

## Step 5: Get Your New Credentials
After creating, you'll get:
- **Client ID**: Something like `123456789-abcdef.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abcdef123456`

## Step 6: Update Your Configuration Files
Update the following files with your new credentials:

### Backend config.env:
```
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
```

### Frontend .env:
```
VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID
```

## Step 7: Restart Servers
1. Restart backend: `cd backend && npm start`
2. Restart frontend: `cd frontend && npm run dev`
