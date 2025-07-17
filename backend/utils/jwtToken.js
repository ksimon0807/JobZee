export const sendToken = (user, statusCode, res, message, redirectUrl = null) => {
  console.log('[sendToken] Generating token for user:', { id: user._id, role: user.role });
  
  const token = user.getJWTToken();
  
  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Cookie options - dynamically set based on environment
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: isProduction, // Only set to true in production (HTTPS)
    sameSite: isProduction ? 'None' : 'Lax', // Allow cross-site requests in production ('None' must be capitalized)
    path: '/'
  };
  
  // Remove domain restriction in production
  if (!isProduction) {
    options.domain = 'localhost';
  }

  console.log('[sendToken] Setting cookie with options:', {
    expires: options.expires,
    secure: options.secure,
    sameSite: options.sameSite,
    httpOnly: options.httpOnly,
    environment: process.env.NODE_ENV || 'development'
  });

  // Set cookie in response
  res.cookie("token", token, options);
  
  // Either redirect or return JSON based on whether redirectUrl is provided
  if (redirectUrl) {
    console.log(`[sendToken] Redirecting to: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  } else {
    return res.status(statusCode).json({
      success: true,
      message,
      user,
      token,
    });
  }
};
