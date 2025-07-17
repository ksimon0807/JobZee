import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
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

/*
 * Configure CORS (Cross-Origin Resource Sharing) for this Express app.
 * - origin: Read from environment variable to work in different environments
 * - methods: Allow standard HTTP methods
 * - credentials: Allow cookies and authorization headers
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handle file uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// Initialize passport configuration
import { initializePassport } from "./config/passport.js";
initializePassport();

// Session middleware configuration
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // Session TTL in seconds (24 hours)
      autoRemove: 'native',
      collectionName: 'sessions'
    })
  })
);

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
app.use("/auth/google", googleAuthRouter);  // Mount Google auth routes at /auth/google

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
