import { validateRequest } from "@/miidleware/validateRequest.middleware";
import { Router } from "express";
import { SignupSchema } from "@/validators/signup.validator";

const loginRouter: Router = Router()
  
export default loginRouter;
  