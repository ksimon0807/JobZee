# JobZee Deployment Guide for Render.com

## Prerequisites
1. GitHub repository with your JobZee code
2. Render.com account
3. MongoDB Atlas account or other MongoDB provider
4. Google Developer Console project for OAuth
5. Cloudinary account
6. Supabase account

## Environment Variables Setup

### Required Environment Variables for Backend
Create these environment variables in your Render.com dashboard:

```
NODE_ENV=production
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET_KEY=<your-jwt-secret>
JWT_EXPIRE=7d
COOKIE_EXPIRE=5
FRONTEND_URL=<your-frontend-url>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
SUPABASE_PROJECT_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
```

### Frontend Environment Variables
In your frontend deployment on Render, add:

```
VITE_BACKEND_URL=<your-backend-url>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

## Deployment Steps

### Using Render.com Blueprint (Recommended)
1. Make sure your code is pushed to GitHub
2. Log in to Render.com
3. Click "New" and select "Blueprint"
4. Connect your GitHub repository
5. Render will use the `render.yaml` file in your repository to create the services
6. Configure the environment variables for both services
7. Deploy

### Manual Deployment

#### Backend Deployment
1. Log in to Render.com
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `jobzee-backend`
   - Runtime: `Node`
   - Build Command: `cd backend && npm install --legacy-peer-deps`
   - Start Command: `cd backend && npm start`
5. Add the environment variables
6. Deploy

#### Frontend Deployment
1. Log in to Render.com
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: `jobzee-frontend`
   - Runtime: `Node`
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm run preview -- --host`
5. Add the environment variables
6. Deploy

## Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Open your project or create a new one
3. Go to "APIs & Services" > "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add your production URLs:
   - Authorized JavaScript origins: `<your-frontend-url>`
   - Authorized redirect URIs: `<your-backend-url>/auth/google/callback`
6. Save changes

## Verifying Deployment

1. Visit your frontend URL
2. Try to register a new account
3. Try to log in with existing credentials
4. Test Google OAuth login
5. Test regular email/password login
6. Test file uploads with Cloudinary
7. Check if cookies are being set properly

## Troubleshooting

### Cookie Issues
- Ensure `sameSite: 'none'` and `secure: true` are set in production
- Check that your frontend and backend are both on HTTPS

### Google OAuth Issues
- Verify redirect URIs in Google Console
- Check environment variables
- Look for CORS errors in browser console

### MongoDB Connection Issues
- Check your MongoDB URI
- Ensure IP access is allowed from Render.com

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits

## Monitoring

- Use Render.com logs to monitor your application
- Set up alerts for errors or downtime
- Monitor MongoDB performance

## Backups

- Set up regular backups for your MongoDB database
- Consider exporting important data periodically
