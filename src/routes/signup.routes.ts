import { validateRequest } from "@/miidleware/validateRequest.middleware";
import { Router } from "express";
import { SignupSchema } from "@/validators/signup.validator";

const loginRouter: Router = Router()

loginRouter.post(
    "/signup",
    validateRequest(SignupSchema),
    SignUpController  
)     
  
export default loginRouter;
  