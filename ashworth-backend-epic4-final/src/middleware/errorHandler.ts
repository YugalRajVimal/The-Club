import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

// Centralized error handler — the ONLY place that turns a thrown error into
// the contract's { success: false, error: { code, message } } envelope.
// Every controller should throw AppError (via the Errors.* helpers) or let
// unexpected errors bubble up here, where they become SERVER_ERROR.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  sendError(res, "SERVER_ERROR", "Something went wrong", 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, "NOT_FOUND", `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
