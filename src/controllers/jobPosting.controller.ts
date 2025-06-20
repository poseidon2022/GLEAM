import { ServiceResponse } from "@/miidleware/serviceResponse";
import { ApiError } from "@/miidleware/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "@/utils/catchAsync.util";
import type { Request, Response } from "express";
import { handleServiceResponse } from "@/miidleware/validateRequest.middleware";
import { jobPostingService } from "@/services/jobPosting.services";

class JobPostingController {
    public createJob = catchAsync(async (req: Request, res: Response) => {
        const jobDetails = req.body;
        const userId = req.user.id;
        if (!userId) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }
        const jobResponse = await jobPostingService.createJob(jobDetails, userId);
        return handleServiceResponse(jobResponse, res)
    })

    public updateJob = catchAsync(async (req: Request, res: Response) => {
        const jobDetails = req.body;
        const { id } = req.params;
        const serviceResponse = await jobPostingService.updateJob(id, jobDetails);
        return handleServiceResponse(serviceResponse, res)
    })

    public deleteJob = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const serviceResponse = await jobPostingService.deleteJob(id);
        return handleServiceResponse(serviceResponse, res)
    })
}

export const jobPostingController = new JobPostingController()