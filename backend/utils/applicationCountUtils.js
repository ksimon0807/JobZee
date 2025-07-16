import { Application } from '../models/applicationSchema.js';
import { Job } from '../models/jobSchema.js';
import mongoose from 'mongoose';

// Utility function to update applicant counts for all jobs or a specific job
export const updateApplicantCounts = async (jobId = null) => {
  try {
    const pipeline = [
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ];
    
    // If jobId is provided, filter for just that job
    if (jobId) {
      pipeline.unshift({ 
        $match: { 
          jobId: new mongoose.Types.ObjectId(jobId) 
        } 
      });
    }
    
    // Run aggregation to count applications per job
    const applicationCounts = await Application.aggregate(pipeline);
    
    // Update all jobs with their counts
    for (const item of applicationCounts) {
      await Job.findByIdAndUpdate(
        item._id,
        { applicantsCount: item.count }
      );
    }
    
    // If jobId was provided but not found in results, ensure it has a count of 0
    if (jobId && !applicationCounts.some(item => item._id.toString() === jobId.toString())) {
      await Job.findByIdAndUpdate(
        jobId,
        { applicantsCount: 0 }
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error updating applicant counts:", error);
    return false;
  }
};

// Function to recalculate counts for all jobs (can be run as a maintenance task)
export const recalculateAllApplicantCounts = async () => {
  try {
    // First reset all counts to zero to handle jobs with no applications
    await Job.updateMany({}, { applicantsCount: 0 });
    
    // Then update counts based on actual applications
    return await updateApplicantCounts();
  } catch (error) {
    console.error("Error recalculating all applicant counts:", error);
    return false;
  }
};
