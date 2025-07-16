export const sendToken = (user, statusCode, res, message) => {
  console.log('[sendToken] Generating token for user:', { id: user._id, role: user.role });
  
  const token = user.getJWTToken();
  
  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: false, // Allow JavaScript access for development
    secure: false, // Allow non-HTTPS in development
    sameSite: 'lax',
    path: '/',
    domain: 'localhost' // Explicitly set domain for local development
  };

  console.log('[sendToken] Setting cookie with options:', {
    expires: options.expires,
    secure: options.secure,
    sameSite: options.sameSite
  });

  res.status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      user,
      token,
    });
};
