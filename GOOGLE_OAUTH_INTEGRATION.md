# Google OAuth Integration Guide

## Overview
This project now includes Google OAuth authentication for both login and registration, while maintaining all existing functionality.

## Features Added
- **Google OAuth Login**: Users can sign in using their Google account
- **Google OAuth Registration**: New users can register using their Google account
- **Seamless Integration**: Google OAuth works alongside existing email/password authentication
- **Role Selection**: Users must select their role (Job Seeker/Employer) even when using Google OAuth

## Setup Instructions

### Backend Setup
1. Environment variables have been added to `backend/config/config.env`:
   ```
   GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   ```

2. New dependencies installed:
   - `passport`
   - `passport-google-oauth20`
   - `express-session`

3. New files created:
   - `backend/config/passport.js` - Passport Google OAuth strategy
   - `backend/routes/authRouter.js` - Google OAuth routes

### Frontend Setup
1. Environment variables added to `frontend/.env`:
   ```
   VITE_BACKEND_URL=http://localhost:4000
   VITE_GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
   ```

2. New dependencies installed:
   - `@google-cloud/local-auth`
   - `gapi-script`

3. Updated components:
   - `Login.jsx` - Added Google OAuth login button
   - `Register.jsx` - Added Google OAuth registration button

## How to Use

### For Users
1. **Login/Register with Google**:
   - Select your role (Job Seeker or Employer)
   - Click "Continue with Google" button
   - Sign in with your Google account
   - You'll be automatically logged in/registered

2. **Traditional Login/Register**:
   - All existing functionality remains unchanged
   - Use email/password as before

### For Developers
1. **Start the backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Schema Updates**:
   - Added `googleId` field to User model
   - Password is optional for Google OAuth users
   - Phone defaults to 0 for Google OAuth users (can be updated later)

## API Endpoints

### New Google OAuth Endpoints
- `POST /api/v1/user/google/register` - Register with Google
- `POST /api/v1/user/google/login` - Login with Google
- `GET /api/v1/auth/google` - Initiate Google OAuth flow
- `GET /api/v1/auth/google/callback` - Google OAuth callback

### Existing Endpoints
All existing endpoints remain unchanged and fully functional.

## Security Notes
- Google OAuth tokens are validated on the backend
- JWT tokens are still used for session management
- All existing authentication middleware remains intact
- Google OAuth users get the same permissions as regular users

## Troubleshooting
1. **Google API not loading**: Check if the Google API script is loaded in `index.html`
2. **Role selection required**: Users must select a role before using Google OAuth
3. **Environment variables**: Ensure all environment variables are set correctly
4. **CORS**: Backend is configured to allow requests from the frontend URL

## Notes
- Google OAuth users will have a default phone number of 0 (can be updated in profile)
- The system automatically handles user registration if they don't exist during login
- All existing features (job posting, applications, etc.) work seamlessly with Google OAuth users
