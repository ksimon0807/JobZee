import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "Name must be at least 3 characters long"],
    maxLength: [30, "Name must be not more than 30 characters long"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: {
    type: Number,
    required: function() {
      return !this.googleId; // Phone not required for Google OAuth users
    },
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google OAuth users
    },
    minLength: [8, "Password must be at least 8 characters long"],
    maxLength: [32, "Password must be not more than 32 characters long"],
    select: false,
  },
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    required: [true, "Please provide your role"],
    enum: ["Job seeker", "Employer"],
  },
  avatar: {
    public_id: {
      type: String,
      default: 'default_avatar'
    },
    url: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    }
  },
  resume: {
    public_id: String,
    url: String,
    fileName: String
  },
  skills: [String],
  education: [{
    school: String,
    degree: String,
    fieldOfStudy: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  bio: {
    type: String,
    maxLength: [500, "Bio cannot be more than 500 characters"]
  },
  location: String,
  social: {
    linkedin: String,
    github: String,
    website: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hashing the password

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // Don't hash password for Google OAuth users
  if (this.googleId && this.password === 'google_oauth_user') {
    next();
  } else {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Comparing passwords

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// generating a jwt token for authorization

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);
