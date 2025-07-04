import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";

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

// export const login = catchAsyncError(async (req, res, next) => {
//   const { email, password, role } = req.body;

//   // 🛑 Check if email, password, and role are provided
//   if (!email || !password || !role) {
//     return next(
//       new ErrorHandler("Please enter email, password, and role!", 400)
//     );
//   }

//   // 🔍 Find the user with matching email and role
//   const user = await User.findOne({ email }).select("+password");

//   // ❌ Check if the user exists
//   if (!user) {
//     return next(new ErrorHandler("Invalid email, password, or role!", 400));
//   }

//   // 🔐 Compare provided password with hashed password
//   const isPasswordMatched = await user.comparePassword(password);

//   if (!isPasswordMatched) {
//     return next(new ErrorHandler("Invalid email or password!", 400));
//   }

//   if (user.role !== role) {
//     return next(new ErrorHandler("User with this role not found", 400));
//   }

//   // ✅ Send token if everything is correct
//   sendToken(user, 200, res, "User logged in successfully");
// });

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
  res
    .status(201)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "User logged out successfully!",
    });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});
