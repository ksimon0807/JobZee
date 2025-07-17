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
      
      // Generate token
      const token = generateToken(user);

      // Set cookie with proper options for cross-site authentication
      const isProduction = process.env.NODE_ENV === 'production';
      const options = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: isProduction, // Only set to true in production (HTTPS)
        sameSite: isProduction ? 'none' : 'lax', // Allow cross-site requests in production
        path: '/'
      };

      // Set cookie and redirect to frontend homepage instead of callback path
      res
        .status(200)
        .cookie("token", token, options)
        .redirect(`${process.env.FRONTEND_URL}`);
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
