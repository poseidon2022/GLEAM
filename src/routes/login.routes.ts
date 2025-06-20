import { validateRequest } from "@/miidleware/validateRequest.middleware";
import { Router } from "express";
import { LoginSchema } from "@/validators/login.validator";

const loginRouter: Router = Router()

loginRouter.post(
    "/login",
    validateRequest(LoginSchema), // Apply validation middleware
    loginController              // Apply the controller function
  );
  
  // Export the router so it can be used in your main Express application
  export default loginRouter;
  