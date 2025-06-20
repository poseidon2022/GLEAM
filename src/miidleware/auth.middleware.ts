import { userService } from "@/services/user.service";
import { roles } from "@/types/role.types";
import { PayloadType, TokenTypeEnum } from "@/types/token.types ";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken"
import { ApiError } from "./serviceResponse";
import dotenv from "dotenv"
dotenv.config()

export const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")!.replace("Bearer ", "");
    const decoded = verify(token, process.env.JWT_SECRET) as PayloadType;
    if (!decoded || typeof decoded.sub !== "string") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Please authenticate");
    }
    // check if the type value of the token is a string and is access token
    if (typeof decoded.type !== "string" || decoded.type !== TokenTypeEnum.ACCESS) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Please use a valid token");
    }
    const user = await userService.getUserById(decoded.sub);
    if (!user || !user.responseObject) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Please authenticate");
    }
    req.user = {
      id: user.responseObject.id,
      email: user.responseObject.email,
    };
    req.token = decoded as PayloadType;
    req.role = user.responseObject.role;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Please authenticate"));
  }
};
