import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type ZodSchema } from "zod";

import { ServiceResponse } from "./serviceResponse";

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parsing the request using the schema
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    // Check if the error is a ZodError
    if (err instanceof ZodError) {
      // Mapping each error to extract the field path and message
      const errorDetails = err.errors.map((e) => ({
        path: e.path.join("."), // Joins the path for nested fields
        message: e.message,
      }));

      const statusCode = StatusCodes.BAD_REQUEST;
      const serviceResponse = ServiceResponse.failure("Invalid input", errorDetails, statusCode);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    }

    // Handle other types of errors (if necessary)
    next(err);
  }
};
