# Google OAuth Setup & Troubleshooting Guide

## The Error You Encountered

The error `Error 400: redirect_uri_mismatch` occurs when the redirect URI configured in your Google Cloud Console doesn't match the one being used by your application.

## How to Fix the Google OAuth Configuration

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to "APIs & Services" → "Credentials"

### Step 2: Configure OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID: `839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com`
2. Click on it to edit
3. In the "Authorized JavaScript origins" section, add:
   - `http://localhost:5173` (your frontend URL)
   - `http://localhost:4000` (your backend URL)

### Step 3: Configure Authorized Redirect URIs
For the **newer Google Identity Services** (which we're now using), you typically don't need redirect URIs, but if prompted, add:
- `http://localhost:5173`
- `http://localhost:4000`

### Step 4: Save and Wait
- Click "Save"
- Wait 5-10 minutes for changes to propagate

## Updated Implementation

### What Changed:
1. **Switched to Google Identity Services**: We're now using the newer `https://accounts.google.com/gsi/client` instead of the older `gapi` library
2. **Simplified Authentication Flow**: The new implementation uses JWT tokens directly from Google without server-side redirects
3. **Better Error Handling**: Added proper error handling for network issues and missing roles

### Frontend Changes:
- **Login.jsx**: Updated to use Google Identity Services with `useCallback` and proper dependency management
- **Register.jsx**: Updated similarly with automatic fallback to login if user already exists
- **index.html**: Now loads the Google Identity Services script
- **CSS**: Added proper styling for Google OAuth buttons

### Backend Changes:
- **No server-side redirect needed**: The new implementation handles authentication entirely on the frontend
- **Simplified controllers**: Google OAuth controllers now just validate the Google ID and manage user creation/login
- **Better error responses**: Improved error messages for debugging

## Testing the Implementation

### To Test:
1. **Start your backend**: `cd backend && npm start`
2. **Start your frontend**: `cd frontend && npm run dev`
3. **Open browser**: Go to `http://localhost:5173`
4. **Try Google OAuth**:
   - Select a role (Job Seeker or Employer)
   - Click "Continue with Google"
   - Sign in with your Google account

### Expected Behavior:
- If you're a new user: You'll be registered and logged in automatically
- If you're an existing user: You'll be logged in automatically
- If you don't select a role: You'll get an error message

## Common Issues & Solutions

### Issue 1: "Google Sign-In is not available"
**Solution**: The Google Identity Services script hasn't loaded yet. Wait a few seconds and try again.

### Issue 2: "Please select a role before signing in with Google"
**Solution**: Select either "Job Seeker" or "Employer" from the dropdown before clicking the Google button.

### Issue 3: Console errors about iframe/CSP
**Solution**: These are normal warnings from Google's security measures and don't affect functionality.

### Issue 4: "redirect_uri_mismatch" still appears
**Solution**: 
1. Double-check your Google Cloud Console configuration
2. Make sure you're using the correct Client ID
3. Wait 5-10 minutes after making changes
4. Try in an incognito/private browser window

## Environment Variables

### Backend (.env or config.env):
```
GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Frontend (.env):
```
VITE_BACKEND_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
```

## Security Notes

1. **Client ID is public**: It's safe to expose the Google Client ID in frontend code
2. **Client Secret is private**: Never expose the Client Secret in frontend code
3. **JWT Verification**: Google's JWT tokens are verified automatically by the Google Identity Services
4. **HTTPS in Production**: Always use HTTPS in production for Google OAuth

## Database Changes

The User model now supports:
- `googleId`: Optional field for Google OAuth users
- `password`: Optional for Google OAuth users (they use 'google_oauth_user' as default)
- `phone`: Defaults to 0 for Google OAuth users (can be updated later)

## Next Steps

1. **Update Profile**: Add a profile page where Google OAuth users can update their phone number
2. **Email Verification**: Consider adding email verification for regular users
3. **Social Login Icons**: Add more social login options (Facebook, LinkedIn, etc.)
4. **Production Setup**: Configure proper domain names and HTTPS for production deployment
