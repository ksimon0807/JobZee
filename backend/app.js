import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { v2 as cloudinary } from 'cloudinary';
import MongoStore from "connect-mongo";
import userRouter from "./routes/userRouter.js";
import applicationRouter from "./routes/applicationRouter.js";
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRouter.js";
import googleAuthRouter from "./routes/googleAuthRouter.js";
import applicationCountRouter from "./routes/applicationCountRouter.js";
import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();
dotenv.config({ path: "./config/config.env" });

// Configure Cloudinary
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '[HIDDEN]' : undefined,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '[HIDDEN]' : undefined
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CORS Configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'https://job-zee-self.vercel.app'
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  })
);

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 day
      autoRemove: 'native',
      collectionName: 'sessions'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  })
);

// Initialize passport configuration
import { initializePassport } from "./config/passport.js";
initializePassport();

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to database
dbConnection();

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/app-counts", applicationCountRouter);
app.use("/auth/google", googleAuthRouter);

// Error Middleware
app.use(errorMiddleware);

export default app;
