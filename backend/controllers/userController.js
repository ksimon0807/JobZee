import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import { v2 as cloudinary } from 'cloudinary';
import { ResumeService } from '../services/resumeService.js';

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !phone || !role || !password) {
    return next(new ErrorHandler("Please fill full registration details !"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already exists!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password,
  });
  sendToken(user, 200, res, "User Registered successfully");
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncError(async (req, res, next) => {
  // Use the same cookie configuration as login to ensure proper clearing
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    expires: new Date(Date.now()), // Set to past date to clear cookie
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/'
  };
  
  // Remove domain restriction in production
  if (!isProduction) {
    cookieOptions.domain = 'localhost';
  }

  console.log('[logout] Clearing cookie with options:', cookieOptions);
  
  res
    .status(201)
    .cookie("token", null, cookieOptions)
    .json({
      success: true,
      message: "User logged out successfully!",
    });
});

export const getCurrentUser = catchAsyncError(async (req, res, next) => {
  console.log('[getCurrentUser] Fetching current user...');
  
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user._id).select('+googleId').lean();
    
    if (!user) {
      console.log('[getCurrentUser] User not found');
      return next(new ErrorHandler("User not found", 404));
    }

    console.log('[getCurrentUser] User found:', { id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return next(new ErrorHandler("Failed to fetch user data", 500));
  }
});

export const googleRegister = catchAsyncError(async (req, res, next) => {
  const { name, email, role, googleId } = req.body;

  if (!name || !email || !role || !googleId) {
    return next(
      new ErrorHandler(
        "Please provide all required details for Google registration!"
      )
    );
  }

  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already exists!"));
  }

  const user = await User.create({
    name,
    email,
    phone: 0,
    role,
    password: "google_oauth_user",
    googleId,
  });

  sendToken(user, 200, res, "User registered successfully with Google");
});

export const googleLogin = catchAsyncError(async (req, res, next) => {
  const { email, googleId, role } = req.body;
  
  if (!email || !googleId) {
    return next(new ErrorHandler("Please provide email and Google ID!"));
  }
  
  const user = await User.findOne({ email, googleId });
  if (!user) {
    return next(new ErrorHandler("User not found. Please register first.", 404));
  }
  
  if (role && user.role !== role) {
    user.role = role;
    await user.save();
  }
  
  sendToken(user, 201, res, "User logged in successfully with Google!");
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  try {
    console.log('Update Profile Request Body:', req.body);
    
    const { name, email, phone, skills, education, experience, bio, location, social } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;

    // Handle skills (ensure it's an array)
    if (skills) {
      user.skills = Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim());
    }

    // Handle education (ensure it's an array of objects)
    if (education) {
      user.education = Array.isArray(education) ? education : [education];
    }

    // Handle experience (ensure it's an array of objects)
    if (experience) {
      user.experience = Array.isArray(experience) ? experience : [experience];
    }

    // Handle social links
    if (social) {
      user.social = {
        linkedin: social.linkedin || user.social?.linkedin || '',
        github: social.github || user.social?.github || '',
        website: social.website || user.social?.website || ''
      };
    }

    console.log('Updated User Object:', user);
    await user.save();
    console.log('Save successful');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return next(new ErrorHandler(error.message || "Error updating profile", 500));
  }
});

export const handleAvatarUpload = catchAsyncError(async (req, res, next) => {
  console.log('Starting avatar upload handler');
  console.log('Request file:', req.file);
  console.log('Request user:', req.user);

  if (!req.file) {
    return next(new ErrorHandler("Please upload an avatar", 400));
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Delete old avatar from Cloudinary if it exists and isn't the default
    if (user.avatar?.public_id && user.avatar.public_id !== 'default_avatar') {
      try {
        console.log('Deleting old avatar:', user.avatar.public_id);
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    // Update user with new avatar details
    const avatarData = {
      public_id: req.file.filename || req.file.public_id,
      url: req.file.path || req.file.secure_url
    };

    console.log('New avatar data:', avatarData);

    user.avatar = avatarData;
    await user.save();

    console.log('User updated successfully');

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: avatarData
    });
  } catch (error) {
    console.error('Error in handleAvatarUpload:', error);
    return next(error);
  }
});

export const handleResumeUpload = catchAsyncError(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorHandler("Please upload a resume", 400));
    }

    console.log("Resume file received:", req.file);

    // Use the user object already attached by isAuthorized
    const user = req.user;
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Upload the resume to Supabase
    const resumeData = await ResumeService.uploadResume(req.file, user._id.toString());
    
    // Update the user's resume reference in MongoDB
    user.resume = {
      public_id: resumeData.fileName,
      url: resumeData.publicUrl
    };

    await user.save();
    console.log("User updated with resume:", user.resume);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: user.resume
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get the user's resume from Supabase
export const getUserResume = catchAsyncError(async (req, res, next) => {
  try {
    // Fix: req.user.id is undefined because req.user is a lean() object from MongoDB
    // Use req.user._id instead
    const userId = req.params.userId || req.user._id?.toString();
    console.log('[getUserResume] Looking up resume for user', userId);
    // Check if the user is authorized to access this resume
    // Users can access their own resume, or Employers can access any resume
    if (req.params.userId && req.user._id?.toString() !== req.params.userId && req.user.role !== 'Employer') {
      return next(new ErrorHandler("Not authorized to access this resume", 403));
    }
    // Get resume from Supabase
    const resumeData = await ResumeService.getUserResume(userId);
    if (!resumeData) {
      // Check if user has resume in MongoDB user document as fallback
      const user = await User.findById(userId);
      if (user && user.resume) {
        console.log('[getUserResume] Resume found in MongoDB user document');
        return res.status(200).json({
          success: true,
          resume: {
            ...user.resume,
            url: user.resume.url || user.resume.public_url || null
          }
        });
      }
      return next(new ErrorHandler("Resume not found", 404));
    }
    // Always return a 'url' field for frontend compatibility
    const normalizedResume = {
      ...resumeData,
      url: resumeData.url || resumeData.public_url || null
    };
    res.status(200).json({
      success: true,
      resume: normalizedResume
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Delete a resume from Supabase
export const deleteResume = catchAsyncError(async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    
    if (!resumeId) {
      return next(new ErrorHandler("Resume ID is required", 400));
    }
    
    // Delete resume from Supabase
    await ResumeService.deleteResume(resumeId, req.user.id);
    
    // Update the user document
    const user = await User.findById(req.user.id);
    if (user && user.resume) {
      user.resume = null;
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get public profile for a user (for employer viewing applicant)
export const getUserPublicProfile = catchAsyncError(async (req, res, next) => {
  console.log('[getUserPublicProfile] FUNCTION CALLED!!!');
  console.log('[getUserPublicProfile] req.params:', req.params);
  console.log('[getUserPublicProfile] req.user:', req.user);
  console.log('[getUserPublicProfile] req.url:', req.url);
  
  const { userId } = req.params;
  console.log('[getUserPublicProfile] userId param:', userId);
  
  if (!userId) {
    console.log('[getUserPublicProfile] No userId provided');
    return next(new ErrorHandler("User ID is required", 400));
  }
  
  if (!req.user) {
    console.log('[getUserPublicProfile] User not authenticated');
    return next(new ErrorHandler("Authentication required", 401));
  }
  
  try {
    const user = await User.findById(userId).select('-password -googleId -__v');
    if (!user) {
      console.log('[getUserPublicProfile] User not found for id:', userId);
      return next(new ErrorHandler("User not found", 404));
    }
    console.log('[getUserPublicProfile] Successfully found user:', user.name);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log('[getUserPublicProfile] Database error:', error);
    return next(new ErrorHandler("Database error", 500));
  }
});
