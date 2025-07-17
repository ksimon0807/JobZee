import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/jwtToken.js";

const router = express.Router();

// Route to initiate Google OAuth
router.get('/', (req, res, next) => {
  // Preserve the state parameter (role)
  const state = req.query.state || '';
  console.log('Starting Google OAuth with state:', state);
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: state
  })(req, res, next);
});

// Google OAuth callback route
router.get("/callback", 
  (req, res, next) => {
    console.log('Callback route - state parameter:', req.query.state);
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
      }
      
      // Get the role from state parameter
      const role = req.query.state;
      console.log('Callback handler - role from state:', role);
      
      // Update user role if provided
      if (role && ['Employer', 'Job seeker'].includes(role)) {
        user.role = role;
        await user.save();
        console.log(`Updated user role to ${role}`);
      }
      
      // Use the sendToken utility for consistent cookie handling
      console.log('[OAuth] Generating token for Google OAuth user:', { id: user._id, role: user.role });
      
      // Call sendToken but capture the modified response so we can redirect
      const redirectUrl = `${process.env.FRONTEND_URL}`;
      console.log(`[OAuth] Will redirect to: ${redirectUrl}`);
      
      // Use the sendToken utility with redirect
      sendToken(user, 200, res, "Google authentication successful", redirectUrl);
    } catch (error) {
      console.error("Error in Google OAuth:", error.message);
      console.error("Full error:", error);
      
      // Send a more specific error message and redirect to login page with error
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=${errorMessage}`
      );
    }
  }
);

export default router;
