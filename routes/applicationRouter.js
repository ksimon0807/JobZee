import express from "express";
import { employerGetAllApplications } from "../controllers/applicationController.js";
import { jobseekerDeleteApplication } from "../controllers/applicationController.js";
import { jobseekerGetAllApplications } from "../controllers/applicationController.js";
import { isAuthorized } from "../middlewares/auth.js";
import { postApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.get("/jobseeker/getall",isAuthorized,jobseekerGetAllApplications);
router.get("/employer/getall",isAuthorized,employerGetAllApplications);
router.delete("/delete/:id",isAuthorized,jobseekerDeleteApplication);
router.post("/post",isAuthorized,postApplication);

export default router;
 