import { validateRequest } from "@/miidleware/validateRequest.middleware";
import { JobPostSchema, DeleteJobPostSchema, UpdateJobPostSchema } from "@/validators/job.validator";
import { Router } from "express";
import { jobPostingController } from "@/controllers/jobPosting.controller";

export const jobRouter : Router = Router();

jobRouter.post(
    "/",
    validateRequest(JobPostSchema),
    jobPostingController.createJob
)

jobRouter.patch(
    "/:id",
    validateRequest(UpdateJobPostSchema),
    jobPostingController.updateJob
)

jobRouter.delete(
    "/:id",
    validateRequest(DeleteJobPostSchema),
    jobPostingController.deleteJob
)