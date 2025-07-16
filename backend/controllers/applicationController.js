// Update application status
export const updateApplicationStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return next(new ErrorHandler("Status is required", 400));
  }
  const validStatuses = ["Applied", "Viewed", "Shortlisted", "Rejected", "Interview"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status value", 400));
  }
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found", 404));
  }
  application.status = status;
  await application.save();
  res.status(200).json({ success: true, message: "Status updated", application });
});
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import cloudinary from "cloudinary";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";

export const employerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job seeker") {
      return next(
        new ErrorHandler(
          "Job seeker is not allowed to access these resources!",
          400
        )
      );
    }
    const { _id } = req.user;
    // Populate job title for each application
    const applications = await Application.find({ "employerId.user": _id }).populate('jobId', 'title');
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    console.log('jobseekerGetAllApplications req.user:', req.user); // Debug: check if req.user is set
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access these resources!",
          400
        )
      );
    }
    const { _id } = req.user;
    // Populate job title for each application
    const applications = await Application.find({ "applicantId.user": _id })
      .populate({ path: 'jobId', select: 'title', strictPopulate: false });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler(
          "Employer is not allowed to access these resources!",
          400
        )
      );
    }
    const { id } = req.params;
    const applications = await Application.findById(id);
    if (!applications) {
      return next(new ErrorHandler("OOps, application not found!", 404));
    }
    await applications.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  }
);

export const postApplication = catchAsyncError(async (req, res, next) => {
  console.log("[postApplication] Starting application process...");
  console.log("[postApplication] Request body:", req.body);
  console.log("[postApplication] Request files:", req.files);
  const { role } = req.user;
  
  // Always fetch the latest user profile from DB to ensure resume is up-to-date
  const freshUser = await User.findById(req.user._id);
  console.log("[postApplication] Fresh user resume:", freshUser.resume);

  // Check role
  if (role === "Employer") {
    return next(
      new ErrorHandler(
        "Employer is not allowed to access these resources!",
        400
      )
    );
  }

  // Validate job ID
  const { jobId } = req.body;
  console.log("[postApplication] Looking for job:", jobId);
  
  // Log the full request for debugging
  console.log("[postApplication] Headers:", req.headers);
  console.log("[postApplication] Content-Type:", req.headers['content-type']);
  
  if (!jobId) {
    return next(new ErrorHandler("Job ID is required", 400));
  }

  // Find the job first
  const job = await Job.findById(jobId);
  console.log("[postApplication] Job found:", job ? "Yes" : "No");

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  // Get other application data
  const { name, email, phone, address, coverLetter } = req.body;
  
  let resumeData;

  // Check if a new resume is being uploaded
  if (req.files && req.files.resume) {
    console.log("[postApplication] Processing new resume upload");
    const { resume } = req.files;
    
    // Support both PDF and image formats
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(
        new ErrorHandler(
          "Invalid file format. Please upload a PDF, PNG, JPG or WEBP file.",
          400
        )
      );
    }

    try {
      // Set different options based on file type
      const uploadOptions = {
        resource_type: resume.mimetype === "application/pdf" ? "raw" : "auto",
        folder: "jobzee/applications",
      };

      console.log("[postApplication] Uploading resume to Cloudinary...");
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        uploadOptions
      );

      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("[postApplication] Cloudinary Error:", cloudinaryResponse?.error || "Upload failed");
        return next(new ErrorHandler("Resume upload failed", 500));
      }

      resumeData = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url
      };
      console.log("[postApplication] Resume uploaded successfully");
    } catch (error) {
      console.error("[postApplication] Resume Upload Error:", error);
      return next(new ErrorHandler("Resume upload failed", 500));
    }
  } else if (freshUser.resume && freshUser.resume.url) {
    // Use existing resume from user profile if available
    console.log("[postApplication] Using existing resume from profile");
    resumeData = {
      public_id: freshUser.resume.public_id,
      url: freshUser.resume.url
    };
  } else {
    return next(new ErrorHandler("Resume is required. Please upload a resume or complete your profile first.", 400));
  }

  try {
    console.log("[postApplication] Creating application record...");
    // Create application with all data
    const application = await Application.create({
      name,
      email,
      phone,
      address,
      coverLetter,
      resume: resumeData,
      applicantId: {
        user: req.user._id,
        role: "Job seeker"
      },
      employerId: {
        user: job.postedBy,
        role: "Employer"
      },
      jobId: job._id
    });

    // Increment the applicantsCount for this job
    await Job.findByIdAndUpdate(
      job._id, 
      { $inc: { applicantsCount: 1 } }
    );

    console.log("[postApplication] Application created successfully");
    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application
    });
  } catch (error) {
    console.error("[postApplication] Error creating application:", error);
    return next(new ErrorHandler("Failed to submit application", 500));
  }
});
