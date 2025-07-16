import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Helper function to generate token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

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
      failureRedirect: '/auth/callback?error=true'
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=Authentication failed`);
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
      
      // Generate token
      const token = generateToken(user);

      // Set cookie
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };

      // Set cookie and redirect to frontend
      res
        .status(200)
        .cookie("token", token, options)
        .redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
    } catch (error) {
      console.error("Error in Google OAuth:", error.message);
      console.error("Full error:", error);
      
      // Send a more specific error message
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?error=${errorMessage}`
      );
    }
  }
);

export default router;
