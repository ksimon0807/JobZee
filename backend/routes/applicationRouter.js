import express from "express";
import { employerGetAllApplications, jobseekerDeleteApplication, jobseekerGetAllApplications, postApplication, updateApplicationStatus } from "../controllers/applicationController.js";
import { isAuthorized } from "../middlewares/auth.js";
import { uploadResume } from "../middlewares/upload_express.js";

const router = express.Router();

router.get("/jobseeker/getall", isAuthorized, jobseekerGetAllApplications);
router.get("/employer/getall", isAuthorized, employerGetAllApplications);
router.delete("/delete/:id", isAuthorized, jobseekerDeleteApplication);

router.post("/post", isAuthorized, uploadResume, postApplication);
router.patch("/update-status/:id", isAuthorized, updateApplicationStatus);

export default router;
 