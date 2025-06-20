import { validateRequest } from "@/miidleware/validateRequest.middleware";
import { Router } from "express";
import { LoginSchema } from "@/validators/login.validator";
import { SignupSchema } from "@/validators/signup.validator";
import { authController } from "@/controllers/auth.controller";

const authRouter: Router = Router()

authRouter.post(
    "/login",
    validateRequest(LoginSchema),
    authController.login            
  );

authRouter.post(
  "/signup",
  validateRequest(SignupSchema),
  authController.signup
)     
  
export default authRouter;
  