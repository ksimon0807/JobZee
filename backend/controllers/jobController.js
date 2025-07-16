import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";

// Middleware to count applications per job
const populateApplicationCounts = async (jobs) => {
  if (!Array.isArray(jobs) || jobs.length === 0) return jobs;

  // Get job IDs
  const jobIds = jobs.map((job) => job._id);

  // Count applications per job
  const applicationCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);

  // Create a map of job ID to count
  const countMap = applicationCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  // Populate counts into job objects
  const jobsWithCounts = jobs.map((job) => {
    const jobObj = job.toObject ? job.toObject() : job;
    jobObj.applicantsCount = countMap[job._id.toString()] || 0;
    return jobObj;
  });

  return jobsWithCounts;
};

// GET /api/v1/job/getall?jobType=&salaryFrom=&salaryTo=&datePosted=
export const getAllJobs = catchAsyncError(async (req, res, next) => {
  let filter = { expired: false };
  const { jobType, salaryFrom, salaryTo, datePosted } = req.query;
  if (jobType) filter.jobType = jobType;
  if (salaryFrom && salaryTo) {
    filter.$or = [
      { fixedSalary: { $gte: Number(salaryFrom), $lte: Number(salaryTo) } },
      {
        $and: [
          { salaryFrom: { $lte: Number(salaryTo) } },
          { salaryTo: { $gte: Number(salaryFrom) } },
        ],
      },
    ];
  }
  if (datePosted) {
    const days = Number(datePosted);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    filter.jobPostedOn = { $gte: fromDate };
  }
  const jobs = await Job.find(filter);
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job seeker") {
    return next(
      new ErrorHandler(
        "Job seeker is not allowed to access these resources!",
        400
      )
    );
  }

  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    jobType,
  } = req.body;

  if (!title || !description || !category || !country || !city || !location || !jobType) {
    return next(new ErrorHandler("Please fill all required fields including job type!", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(
      new ErrorHandler("Please either provide fixed salary or ranged salary",400)
    );
  }
  if (salaryFrom && salaryTo && fixedSalary) {
    return next(
      new ErrorHandler(
        "Please either provide fixed salary or ranged salary not both",400
      )
    );
  }

  const postedBy = req.user._id;

  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    jobType,
    postedBy,
  });

  res.status(200).json({
    success: true,
    message: "Job posted successfully!",
    job,
  });
});

export const getmyJobs = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job seeker") {
    return next(
      new ErrorHandler(
        "Job seeker is not allowed to access these resources!",
        400
      )
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  const myJobsWithCounts = await populateApplicationCounts(myJobs);
  res.status(200).json({
    success: true,
    myJobs: myJobsWithCounts,
  });
});

export const updateJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job seeker") {
    return next(
      new ErrorHandler(
        "Job seeker is not allowed to access these resources!",
        400
      )
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOps job not found!", 404));
  }
  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    job,
    message: "Job updated successfully",
  });
});

export const deleteJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job seeker") {
    return next(
      new ErrorHandler(
        "Job seeker is not allowed to access these resources!",
        400
      )
    );
  }

  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOps job not found!", 404));
  }

  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "job Deleted Successfully",
  });
});

export const getSinglejob = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler("Invalid ID/ Cast Error", 400));
  }
});
