import { Response } from "express";
import { ErrorCode } from "./errors";

// The single place responses get shaped, so every route matches the
// API CONTRACT envelope exactly:
//   Success: { success: true, data: {...} | [...] }
//   Error:   { success: false, error: { code, message } }

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function sendError(
  res: Response,
  code: ErrorCode,
  message: string,
  statusCode = 400
): Response {
  return res.status(statusCode).json({ success: false, error: { code, message } });
}
