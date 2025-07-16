import express from "express";

const router = express.Router();

// Test endpoint to verify environment variables are loaded
router.get("/test-env", (req, res) => {
  res.json({
    success: true,
    message: "Environment variables test",
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0,
    frontendUrl: process.env.FRONTEND_URL
  });
});

export default router;
