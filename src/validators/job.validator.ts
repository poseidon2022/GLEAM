import { z } from "zod";

export const JobPostSchema = z.object({
  title: z.string()
    .min(1, "Title is required and must be at least 1 character long")
    .max(100, "Title cannot exceed 100 characters"),

  description: z.string()
    .min(20, "Description is required and must be at least 20 characters long")
    .max(2000, "Description cannot exceed 2000 characters"),

  location: z.string().optional(),
});

export const UpdateJobPostSchema = z.object({
    params: z.object({
      id: z.string().uuid("Invalid job ID format"),
    }),
    body: JobPostSchema.partial()
  });

export const DeleteJobPostSchema = z.object({
    params: z.object({
        id: z.string().uuid("Invalid job ID format"),
    }),
});
export type JobPostInput = z.infer<typeof JobPostSchema>;

