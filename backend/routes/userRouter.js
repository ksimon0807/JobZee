import express from "express";

import { 
    register, 
    googleRegister, 
    googleLogin, 
    login, 
    logout, 
    getCurrentUser,
    updateProfile,
    handleAvatarUpload,
    handleResumeUpload,
    getUserResume,
    deleteResume,
    getUserPublicProfile
} from "../controllers/userController.js";
import { isAuthorized } from "../middlewares/auth.js";
import { uploadAvatar, uploadResume } from "../middlewares/upload_express.js";

const router = express.Router();
// Employer view applicant profile
router.get("/profile/public/:userId", isAuthorized, getUserPublicProfile);

// Auth routes
router.post("/register", register);
router.post("/google/register", googleRegister);
router.post("/login", login);
router.post("/google/login", googleLogin);
router.get("/logout", isAuthorized, logout);
router.get("/getuser", isAuthorized, getCurrentUser);

// Profile routes
router.put("/profile/update", isAuthorized, updateProfile);
router.post("/profile/avatar", isAuthorized, uploadAvatar, handleAvatarUpload);
router.post("/profile/resume", isAuthorized, uploadResume, handleResumeUpload);
router.get("/profile/resume", isAuthorized, getUserResume);
router.get("/profile/resume/:userId", isAuthorized, getUserResume);
router.delete("/profile/resume/:resumeId", isAuthorized, deleteResume);

export default router;
