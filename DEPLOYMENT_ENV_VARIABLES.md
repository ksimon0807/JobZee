# Deployment Environment Variables Guide

This document explains the required environment variables for deploying the JobZee application.

## Backend Environment Variables

In your Render deployment or environment configuration, set the following variables:

```
NODE_ENV=production

# MongoDB (Replace with your production MongoDB URI)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Auth
JWT_SECRET_KEY=<your-secret-key>
JWT_EXPIRE=7d
COOKIE_EXPIRE=5

# URLs (These will be set by Render automatically, but you can override if needed)
FRONTEND_URL=<your-frontend-url>
BACKEND_URL=<your-backend-url>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# Supabase
SUPABASE_PROJECT_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_URL=<your-supabase-url>
```

## Frontend Environment Variables

For the frontend Vite application, create a `.env` file with these variables:

```
VITE_BACKEND_URL=<your-backend-url>
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

## Important Notes

1. **Security**: Never commit your environment files to version control
2. **CORS**: Make sure your FRONTEND_URL is correctly set to allow cross-origin requests
3. **OAuth Redirect**: Your Google OAuth redirect URI should be `<your-backend-url>/auth/google/callback`
4. **MongoDB**: Use a production MongoDB instance, not localhost
5. **SSL**: Make sure both frontend and backend use HTTPS in production for secure cookie transmission

## Render Deployment

The `render.yaml` file is already configured to deploy both the frontend and backend services.
It will automatically set `NODE_ENV=production` and connect the frontend to the backend URL.
