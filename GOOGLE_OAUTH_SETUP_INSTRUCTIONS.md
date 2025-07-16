# Google OAuth Setup Instructions

## 🚨 Error: "The given origin is not allowed for the given client ID"

This error means your Google Cloud Console OAuth configuration doesn't allow requests from `http://localhost:5173`.

## 🔧 Solution 1: Update Existing OAuth Client

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create a new one)
3. **Navigate to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID**:
   - `839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com`
5. **Click Edit (pencil icon)**
6. **Add Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
7. **Add Authorized redirect URIs**:
   ```
   http://localhost:4000/auth/google/callback
   ```
8. **Click Save**

## 🔧 Solution 2: Create New OAuth Client

If you can't edit the existing client, create a new one:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. **Configure OAuth consent screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (for testing)
   - Fill required fields:
     - App name: "JobZee Job Portal"
     - User support email: your email
     - Developer contact: your email
   - Save and continue through all steps
5. **Create OAuth 2.0 Client ID**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Name: "JobZee Development"
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     http://127.0.0.1:5173
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:4000/auth/google/callback
     ```
   - Click "Create"
6. **Copy the new Client ID and Secret**
7. **Update your environment files** with the new credentials

## 🔄 After Making Changes

1. **Wait 5-10 minutes** for Google's changes to propagate
2. **Clear your browser cache** and cookies
3. **Restart your development servers**:
   ```bash
   # Backend
   cd backend
   npm start
   
   # Frontend
   cd frontend
   npm run dev
   ```
4. **Test the OAuth flow again**

## 🛠️ Quick Test Setup

If you want to test immediately, you can use a different port that might already be authorized:

1. **Change Vite dev server port**:
   ```bash
   cd frontend
   npm run dev -- --port 3000
   ```
2. **Update frontend .env**:
   ```
   VITE_BACKEND_URL=http://localhost:4000
   VITE_GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
   ```
3. **Test at** `http://localhost:3000`

## 🔍 Troubleshooting

- **Still getting 403?** Wait 10 minutes and clear browser cache
- **Can't access Google Console?** Create a new Google account and project
- **Origin still not allowed?** Double-check the exact URL format (no trailing slash)
- **Need help?** The error will disappear once the origin is properly configured

## 📱 Alternative: Test with Different Domain

You can also test by temporarily using a different domain that's already authorized (if any), or use `127.0.0.1` instead of `localhost`.

The key is ensuring your Google Cloud Console OAuth client has the exact origin where your React app is running!
