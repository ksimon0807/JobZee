import express from 'express';
import { isAuthorized } from '../middlewares/auth.js';
import { recalculateAllApplicantCounts } from '../utils/applicationCountUtils.js';
import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../middlewares/error.js';

const router = express.Router();

// Route to recalculate application counts for all jobs
// This is an admin-only route for maintenance purposes
router.post(
  '/recalculate-counts', 
  isAuthorized,
  catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    
    // Only allow employers to recalculate their counts
    if (role !== 'Employer') {
      return next(
        new ErrorHandler('Only employers can recalculate application counts', 403)
      );
    }
    
    const success = await recalculateAllApplicantCounts();
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Application counts recalculated successfully'
      });
    } else {
      return next(
        new ErrorHandler('Failed to recalculate application counts', 500)
      );
    }
  })
);

export default router;
