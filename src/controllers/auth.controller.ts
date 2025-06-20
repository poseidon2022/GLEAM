import { ApiError } from "@/miidleware/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "@/utils/catchAsync.util";
import type { Request, Response } from "express";
import { handleServiceResponse } from "@/miidleware/validateRequest.middleware";
import { SignupInput } from "@/validators/signup.validator";
import { LoginInput } from "@/validators/login.validator";
import { authService } from "@/services/auth.service";

class AuthController {
    public signup = catchAsync(async ( req: Request, res: Response ) => {
        const signupDetails: SignupInput = req.body;
        const signupResponse = await authService.signup(signupDetails);
        return handleServiceResponse(signupResponse, res);
    });

    public login = catchAsync(async (req: Request, res: Response) => {

        const loginCredentials: LoginInput = req.body;
        const loginResponse = await authService.login(loginCredentials);
        return handleServiceResponse(loginResponse, res);
    });
}

export const authController = new AuthController();
