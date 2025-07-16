import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const isAuthorized = catchAsyncError(async (req, res, next) => {
  console.log('[Auth Middleware] Checking authorization...');
  
  const { token } = req.cookies;
  console.log('[Auth Middleware] Token from cookies:', token ? 'Present' : 'Missing');
  
  if (!token) {
    console.log('[Auth Middleware] No token found');
    return next(new ErrorHandler("Not authorized, please login first", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('[Auth Middleware] Token verified, fetching user...');
    
    // Remove .lean() so we get a real Mongoose document
    const user = await User.findById(decoded.id)
      .select('+googleId');
    
    if (!user) {
      console.log('[Auth Middleware] User not found');
      return next(new ErrorHandler("User not found", 404));
    }
    
    console.log('[Auth Middleware] User authenticated:', { id: user._id, role: user.role });
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ErrorHandler("Session expired, please login again", 401));
    }
    return next(error);
  }
});
