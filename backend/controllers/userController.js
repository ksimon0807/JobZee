import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
// ...existing code...

// Get public profile for a user (for employer viewing applicant)
export const getUserPublicProfile = catchAsyncError(async (req, res, next) => {
  const { userId } = req.params;
  console.log('[getUserPublicProfile] called with req.user:', req.user);
  console.log('[getUserPublicProfile] userId param:', userId);
  if (!userId) {
    console.log('[getUserPublicProfile] No userId provided');
    return next(new ErrorHandler("User ID is required", 400));
  }
  if (!req.user || req.user.role !== 'Employer') {
    console.log('[getUserPublicProfile] Not authorized:', req.user);
    return next(new ErrorHandler("Not authorized", 403));
  }
  const user = await User.findById(userId).select('-password -googleId -__v');
  if (!user) {
    console.log('[getUserPublicProfile] User not found for id:', userId);
    return next(new ErrorHandler("User not found", 404));
  }
  console.log('[getUserPublicProfile] Returning user:', user);
  res.status(200).json({ success: true, user });
});
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
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use consistent cookie options with sendToken
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: isProduction, // Only set to true in production (HTTPS)
    sameSite: isProduction ? 'None' : 'Lax', // Must be capitalized 
    path: '/'
  };
  
  console.log('[logout] Clearing cookie with options:', {
    secure: options.secure,
    sameSite: options.sameSite,
    environment: process.env.NODE_ENV || 'development'
  });
  
  res
    .status(201)
    .cookie("token", null, options)
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
  console.log('Avatar data:', req.avatar);
  console.log('Request user:', req.user);

  if (!req.avatar) {
    return next(new ErrorHandler("Avatar upload failed", 400));
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

    // Avatar data was already processed in the middleware
    const avatarData = req.avatar;
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
    if (!req.resume) {
      return next(new ErrorHandler("Resume upload failed", 400));
    }

    console.log("Resume data received:", req.resume);

    // Use the user object already attached by isAuthorized
    const user = req.user;
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    
    // Resume was already uploaded in the middleware
    const resumeData = req.resume;
    
    // Update the user's resume reference in MongoDB
    user.resume = {
      public_id: resumeData.fileName,
      url: resumeData.publicUrl
    };

    // Save user with error handling to prevent server crash
    try {
      await user.save();
      console.log("User updated with resume:", user.resume);
    } catch (saveError) {
      console.error("User save error:", saveError);
      // Try alternative save method
      await User.findByIdAndUpdate(user._id, {
        resume: {
          public_id: resumeData.fileName,
          url: resumeData.publicUrl
        }
      });
      console.log("User updated via findByIdAndUpdate");
    }

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

// Get the user's resume (first from MongoDB, fallback to Supabase)
export const getUserResume = catchAsyncError(async (req, res, next) => {
  try {
    // Use req.user._id since req.user is a lean() object from MongoDB
    const userId = req.params.userId || req.user._id?.toString();
    // Check if the user is authorized to access this resume
    if (req.params.userId && req.user._id?.toString() !== req.params.userId && req.user.role !== 'Employer') {
      return next(new ErrorHandler("Not authorized to access this resume", 403));
    }

    console.log(`[getUserResume] Looking up resume for user ${userId}`);

    // First check if we have a PDF in Supabase - this is our preferred source for PDFs
    try {
      const supabaseResume = await ResumeService.getUserResume(userId);
      if (supabaseResume && supabaseResume.public_url) {
        const isPdf = supabaseResume.file_type === 'application/pdf' || 
                      supabaseResume.public_url.toLowerCase().endsWith('.pdf');
                      
        if (isPdf) {
          console.log('[getUserResume] Found PDF in Supabase storage, returning it');
          return res.status(200).json({
            success: true,
            resume: {
              ...supabaseResume,
              url: supabaseResume.public_url,
              contentType: 'application/pdf'
            }
          });
        }
      }
    } catch (supabaseError) {
      console.warn('[getUserResume] Error checking Supabase first:', supabaseError.message);
      // Continue with MongoDB check if Supabase fails
    }

    // Check MongoDB for the resume URL (fallback or for image formats)
    const user = await User.findById(userId);
    if (user?.resume?.url) {
      console.log('[getUserResume] Resume found in MongoDB user document');
      
      // Check if this is likely a PDF by examining the URL or file extension
      const isPdf = user.resume.url.toLowerCase().endsWith('.pdf') || 
                   (user.resume.public_id && user.resume.public_id.toLowerCase().endsWith('.pdf'));
      
      // For PDFs, try to prioritize getting from Supabase if available
      if (isPdf) {
        console.log('[getUserResume] PDF detected in MongoDB, checking if it exists in Supabase first');
        try {
          const supabaseResume = await ResumeService.getUserResume(userId);
          if (supabaseResume) {
            console.log('[getUserResume] Found PDF in Supabase storage, using that URL instead');
            return res.status(200).json({
              success: true,
              resume: {
                ...supabaseResume,
                url: supabaseResume.public_url || supabaseResume.url,
                contentType: 'application/pdf'
              }
            });
          }
        } catch (supabaseError) {
          console.warn('[getUserResume] Failed to get PDF from Supabase:', supabaseError.message);
          // Continue with MongoDB version
        }
      }
      
      // If no Supabase version or not a PDF, use the MongoDB version
      const mongoResume = {
        id: user.resume.public_id || 'mongodb_resume',
        file_name: user.resume.public_id || 'user_resume',
        url: user.resume.url,
        public_url: user.resume.url,
        user_id: userId,
        file_type: isPdf ? 'application/pdf' : 'image/jpeg',
        contentType: isPdf ? 'application/pdf' : 'image/jpeg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        size: 0 // Size info not available
      };

      // For PDFs in MongoDB that come from Cloudinary, make sure we set the proper headers
      if (isPdf && mongoResume.url.includes('cloudinary')) {
        // Set the response headers for proper PDF rendering
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }

      return res.status(200).json({
        success: true,
        resume: mongoResume
      });
    }
    
    console.log('[getUserResume] No resume in MongoDB, trying Supabase...');
    
    // If not found in MongoDB, try Supabase as a last resort
    const resumeData = await ResumeService.getUserResume(userId);
    if (!resumeData) {
      return next(new ErrorHandler("Resume not found", 404));
    }
    
    // Determine if it's a PDF
    const isPdf = (resumeData.file_type === 'application/pdf') || 
                  (resumeData.public_url && resumeData.public_url.toLowerCase().endsWith('.pdf'));
                  
    // Always return a 'url' field for frontend compatibility
    const normalizedResume = {
      ...resumeData,
      url: resumeData.url || resumeData.public_url || null,
      contentType: isPdf ? 'application/pdf' : (resumeData.file_type || 'image/jpeg')
    };
    
    // For PDFs, set the proper headers
    if (isPdf) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    
    res.status(200).json({
      success: true,
      resume: normalizedResume
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});

// Delete a resume from storage and MongoDB
export const deleteResume = catchAsyncError(async (req, res, next) => {
  try {
    const { resumeId } = req.params;
    
    if (!resumeId) {
      return next(new ErrorHandler("Resume ID is required", 400));
    }
    
    // First, update the user document in MongoDB to remove the resume reference
    const user = await User.findById(req.user._id);
    
    if (user?.resume) {
      // If resume is stored in Cloudinary, delete it
      if (user.resume.public_id) {
        try {
          // Delete from Cloudinary if the URL is from Cloudinary
          if (user.resume.url.includes('cloudinary')) {
            await cloudinary.uploader.destroy(user.resume.public_id);
            console.log(`[deleteResume] Deleted resume from Cloudinary: ${user.resume.public_id}`);
          }
        } catch (err) {
          console.error(`[deleteResume] Failed to delete from Cloudinary: ${err.message}`);
          // Continue anyway - we'll at least remove the reference from MongoDB
        }
      }
      
      // Remove resume reference from user document
      user.resume = undefined;
      await user.save();
      console.log(`[deleteResume] Removed resume reference from MongoDB user document`);
    }
    
    // Try to delete from Supabase as well if available
    try {
      await ResumeService.deleteResume(resumeId, req.user._id?.toString());
      console.log(`[deleteResume] Deleted resume from Supabase: ${resumeId}`);
    } catch (supabaseError) {
      console.error(`[deleteResume] Failed to delete from Supabase: ${supabaseError.message}`);
      // Continue anyway since we've already updated MongoDB
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
