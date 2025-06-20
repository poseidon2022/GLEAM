import { ServiceResponse } from "@/miidleware/serviceResponse";
import { db } from "@/db";
import { jobs, applications, users } from "@/schema";
import type { JobPostInput } from "@/validators/job.validator";
import { type SQLWrapper, and, eq, inArray, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

class JobPostingService {
  async createJob(
    jobData: JobPostInput,
    userId: string,
  ): Promise<ServiceResponse<JobPostInput | null>> {
    try {
      const jobDataWithId = {
        ...jobData,
        createdBy: userId
      };
      const createdJob = await db.insert(jobs).values(jobDataWithId).returning();
      return ServiceResponse.success<JobPostInput>(
        "Job Posting Created Successfully",
        createdJob[0] as unknown as JobPostInput,
        StatusCodes.CREATED,
      );
    } catch (error) {
      console.error(error);
      return ServiceResponse.failure<null>("Failed to create job posting", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteJob(id: string): Promise<ServiceResponse<JobPostInput | null>> {
    try {
      const jobData = await db.delete(jobs).where(eq(jobs.id, id)).returning();
      const deletedJob = jobData ? jobData[0] : null;
      return ServiceResponse.success<JobPostInput>(
        "Job Posting Deleted Successfully",
        deletedJob as unknown as JobPostInput,
        StatusCodes.OK,
      );
    } catch (error) {
      return ServiceResponse.failure<null>("Failed to delete job posting", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateJob(id: string, data: JobPostInput): Promise<ServiceResponse<JobPostInput | null>> {
    try {
      const jobData = await db
        .update(jobs)
        .set({
          ...data,
        })
        .where(eq(jobs.id, id))
        .returning();
      const updatedJob = jobData ? jobData[0] : null;
      return ServiceResponse.success<JobPostInput>(
        "Job Posting Updated Successfully",
        updatedJob as unknown as JobPostInput,
        StatusCodes.OK,
      );
    } catch (error) {
      return ServiceResponse.failure<null>("Failed to update job posting", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const jobPostingService = new JobPostingService();
