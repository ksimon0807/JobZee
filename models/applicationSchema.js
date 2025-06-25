import mongoose from "mongoose";
import validator from "validator";
// import { User } from "./userSchema.js";


const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    minLength: [3, "Name must be at least 3 characters long"],
    maxLength: [30, "Name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: Number,
    required: [true, "Please provide your phone number"],
  },
  address: {
    type: String,
    required: [true, "Please provide your address"],
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  applicantId: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Job seeker"],
      required: true,
    },
  },
  employerId: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["Employer"],
      required: true,
    },
  },
  coverLetter: {
    type: String,
    required: [true, "Please provide your cover letter"],
    maxLength: [1000, "Cover letter cannot exceed 1000 characters"],
  },
});

export const Application = mongoose.model("Application", applicationSchema);
