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
 * - origin: Allow multiple origins for development and production
 * - methods: Allow standard HTTP methods
 * - credentials: Allow cookies and authorization headers
 */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://job-zee-self.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('[CORS] Checking origin:', origin);
    console.log('[CORS] Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('[CORS] No origin provided, allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('[CORS] Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('[CORS] Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS",
  credentials: true,
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Add additional CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  next();
});

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handle file uploads with express-fileupload middleware
// This is used for general file uploads, while multer is used specifically for avatar and resume uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  debug: true,
  parseNested: true,
  abortOnLimit: true,
  limitHandler: (req, res, next) => {
    res.status(413).json({ success: false, message: 'File size limit exceeded' });
  },
  createParentPath: true,
  safeFileNames: true
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

// Connect to database - with retry capability
(async () => {
  try {
    await dbConnection();
    console.log('Connected to database');
    
    // Also check Supabase resources
    try {
      const checkSupabaseResources = (await import('./scripts/check_supabase.js')).default;
      await checkSupabaseResources();
    } catch (supabaseErr) {
      console.warn('Supabase initialization check failed:', supabaseErr.message);
      console.warn('App will continue with limited functionality');
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
    console.log('Retrying database connection...');
    setTimeout(async () => {
      try {
        await dbConnection();
        console.log('Connected to database on retry');
      } catch (retryErr) {
        console.error('Database connection retry failed:', retryErr.message);
      }
    }, 5000);
  }
})();

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/app-counts", applicationCountRouter);
app.use("/auth/google", googleAuthRouter);  // Mount Google auth routes at /auth/google
app.use("/auth/google", googleAuthRouter);

// Error Middleware
app.use(errorMiddleware);

export default app;
