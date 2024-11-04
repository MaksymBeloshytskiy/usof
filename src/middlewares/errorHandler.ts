import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/CustomErrors";

/**
 * Middleware function to handle errors in the application.
 *
 * @param err - The error object, which can be an instance of `BaseError` or any other error.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 *
 * If the error is an instance of `BaseError`, it sends a JSON response with the error message and details,
 * and sets the response status code to the error's status code.
 * If the error is not an instance of `BaseError`, it logs the error to the console and sends a JSON response
 * with a generic "Internal Server Error" message and a 500 status code.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({ error: err.message, details: err.errors });
  } else {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
