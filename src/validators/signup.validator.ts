import { z } from "zod";
import { roles } from "@/types/role.types";


export const SignupSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only alphabets and spaces"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character") // Matches any character that is NOT an alphanumeric character
    .min(1, "Password is required"), 
  role: z.nativeEnum(roles)
});

export type SignupInput = z.infer<typeof SignupSchema>;
