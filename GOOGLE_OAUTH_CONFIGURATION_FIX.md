# Google OAuth Configuration Issues - Solutions

## Current Error Analysis
The error `[GSI_LOGGER]: The given origin is not allowed for the given client ID` occurs because:

1. **Google OAuth Client ID** `839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com` is not configured to allow `http://localhost:5173`
2. **Google Cloud Console** needs to be updated with the correct authorized origins

## Solution 1: Fix Google Cloud Console (Recommended)

### Steps:
1. **Go to**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Find your OAuth 2.0 Client ID**: `839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com`
4. **Click to edit**
5. **Add to "Authorized JavaScript origins"**:
   - `http://localhost:5173`
   - `http://localhost:4000`
6. **Save and wait 5-10 minutes**

### Screenshots/Visual Guide:
```
Google Cloud Console → APIs & Services → Credentials
│
├── OAuth 2.0 Client IDs
│   └── 839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
│       ├── Authorized JavaScript origins
│       │   ├── http://localhost:5173 ← ADD THIS
│       │   └── http://localhost:4000 ← ADD THIS
│       └── Authorized redirect URIs (optional)
```

## Solution 2: Create New Google OAuth Client (Alternative)

If you don't have access to modify the existing client:

1. **Create a new OAuth 2.0 Client ID**
2. **Set Application Type**: Web application
3. **Add Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:4000`
4. **Update your .env files** with the new client ID

## Solution 3: Development Mode (Temporary)

For immediate testing without Google Console access, you can create a mock Google login:

### Frontend Mock Implementation:
```javascript
// Add this to your components for testing
const handleMockGoogleLogin = async () => {
  if (!role) {
    toast.error("Please select a role before signing in with Google");
    return;
  }

  const mockGoogleData = {
    googleId: "mock_google_id_123",
    name: "Test User",
    email: "test@gmail.com",
    imageUrl: "https://via.placeholder.com/150",
  };

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/google/register`,
      { 
        name: mockGoogleData.name,
        email: mockGoogleData.email, 
        role: role,
        googleId: mockGoogleData.googleId 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    
    toast.success(data.message);
    setIsAuthorized(true);
    setUser(data.user);
  } catch (error) {
    toast.error(error.response?.data?.message || "Registration failed");
  }
};
```

## Solution 4: Production Setup

For production deployment:

1. **Add your production domain** to authorized origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

2. **Update environment variables** for production:
   ```
   VITE_BACKEND_URL=https://your-api-domain.com
   GOOGLE_CLIENT_ID=your-google-client-id
   ```

## Testing After Fix

1. **Clear browser cache** and cookies
2. **Restart your development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```
3. **Test Google OAuth**:
   - Select a role
   - Click "Continue with Google"
   - Should work without errors

## Common Issues After Fix

### Issue: Still getting 403 errors
**Solution**: Wait 5-10 minutes after saving changes in Google Console

### Issue: "Pop-up blocked" error
**Solution**: Allow pop-ups for localhost:5173 in your browser

### Issue: "Invalid client" error
**Solution**: Double-check the Client ID is correct in both frontend and backend

## Environment Variables Checklist

### Backend config.env:
```
GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Frontend .env:
```
VITE_BACKEND_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=839466896691-sbp75gvd382h6omr7uvdjed94mob92db.apps.googleusercontent.com
```

## Success Indicators

✅ **Working correctly when you see**:
- Google login popup appears
- User can select Google account
- No console errors
- User is logged in/registered successfully

❌ **Still having issues if you see**:
- "The given origin is not allowed" error
- 403 Forbidden errors
- Google login popup doesn't appear
