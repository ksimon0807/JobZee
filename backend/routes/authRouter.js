import express from 'express';
import passport from '../config/passport.js';
import { sendToken } from '../utils/jwtToken.js';
import { catchAsyncError } from '../middlewares/catchAsyncError.js';

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  catchAsyncError(async (req, res) => {
    // Successful authentication, send token and redirect
    const user = req.user;
    
    // Generate JWT token
    const token = user.getJWTToken();
    
    // Set cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    
    res.cookie('token', token, options);
    
    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
  })
);

// Google OAuth login endpoint for frontend
router.post('/google/login', catchAsyncError(async (req, res, next) => {
  const { googleToken } = req.body;
  
  // Here you would verify the Google token
  // For now, we'll create a simple endpoint that handles the OAuth flow
  res.status(200).json({
    success: true,
    message: 'Use the /auth/google endpoint to initiate Google OAuth',
    redirectUrl: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/v1/auth/google`
  });
}));

export default router;
