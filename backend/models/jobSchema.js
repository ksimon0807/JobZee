// import mongoose from "mongoose";

// const jobSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, "Please provide job title!"],
//     minLength: [3, "Job title must contain atleast 3 characters"],
//     maxLength: [50, "Job title cannot exceed 50 characters"],
//   },
//   description: {
//     type: String,
//     required: [true, "Please provide job description!"],
//     minLength: [50, "Job description must contain atleast 50 characters"],
//     maxLength: [350, "Job description cannot exceed 350 characters"],
//   },
//   category: {
//     type: String,
//     enum: [
//       "Software",
//       "Marketing",
//       "Finance",
//       "HR",
//       "Design",
//       "Sales",
//       "Operations",
//     ],
//     required: [true, "Please specify job category!"],
//   },
//   country: {
//     type: String,
//     required: [true, "Please specify the country!"],
//   },
//   city: {
//     type: String,
//     required: [true, "Please provide city name!"],
//   },
//   location: {
//     type: String,
//     required: [true, "Please provide job location!"],
//     minLength: [50, "Job location must contain atleast 50 characters"],
//   },
//   fixedSalary: {
//     type: Number,
//     minLength: [4, "fixed salary must contain at least 4 digits"],
//     maxLength: [9, "fixed salary cannot exceed 9 digits"],
//   },
//   salaryFrom: {
//     type: Number,
//     minLength: [4, "salary From must contain at least 4 digits"],
//     maxLength: [9, "salary From cannot exceed 9 digits"],
//   },
//   salaryTo: {
//     type: Number,
//     minLength: [4, "salary To must contain at least 4 digits"],
//     maxLength: [9, "salary To cannot exceed 9 digits"],
//   },
//   jobPostedOn: {
//     type: Date,
//     default: Date.now,
//   },
//   expired: {
//     type: Boolean,
//     default: false,
//   },
//   type: {
//     type: String,
//     enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
//     required: [true, "Please specify job type!"],
//   },
//   postedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
// });

// export const Job = mongoose.model("Job", jobSchema);


import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title."],
    minLength: [3, "Title must contain at least 3 Characters!"],
    maxLength: [30, "Title cannot exceed 30 Characters!"],
  },
  description: {
    type: String,
    required: [true, "Please provide decription."],
    minLength: [30, "Description must contain at least 30 Characters!"],
    maxLength: [500, "Description cannot exceed 500 Characters!"],
  },
  category: {
    type: String,
    required: [true, "Please provide a category."],
  },
  country: {
    type: String,
    required: [true, "Please provide a country name."],
  },
  city: {
    type: String,
    required: [true, "Please provide a city name."],
  },
  location: {
    type: String,
    required: [true, "Please provide location."],
    minLength: [20, "Location must contian at least 20 characters!"],
  },
  fixedSalary: {
    type: Number,
    minLength: [4, "Salary must contain at least 4 digits"],
    maxLength: [9, "Salary cannot exceed 9 digits"],
  },
  salaryFrom: {
    type: Number,
    minLength: [4, "Salary must contain at least 4 digits"],
    maxLength: [9, "Salary cannot exceed 9 digits"],
  },
  salaryTo: {
    type: Number,
    minLength: [4, "Salary must contain at least 4 digits"],
    maxLength: [9, "Salary cannot exceed 9 digits"],
  },
  jobType: {
    type: String,
    enum: ["Full Time", "Part Time", "Remote", "Contract"],
    required: [true, "Please specify job type!"],
  },
  expired: {
    type: Boolean,
    default: false,
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  applicantsCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Paused"],
    default: "Active",
  },
});

export const Job = mongoose.model("Job", jobSchema);