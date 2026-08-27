// Central place for the API contract's fixed error codes + a typed AppError
// that the centralized error handler knows how to serialize into the
// contract's error envelope: { success: false, error: { code, message } }

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "OTP_EXPIRED"
  | "OTP_INVALID"
  | "SERVER_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode?: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode ?? AppError.defaultStatusFor(code);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private static defaultStatusFor(code: ErrorCode): number {
    switch (code) {
      case "VALIDATION_ERROR":
        return 400;
      case "UNAUTHORIZED":
        return 401;
      case "FORBIDDEN":
        return 403;
      case "NOT_FOUND":
        return 404;
      case "CONFLICT":
        return 409;
      case "OTP_EXPIRED":
      case "OTP_INVALID":
        return 400;
      case "SERVER_ERROR":
      default:
        return 500;
    }
  }
}

export const Errors = {
  validation: (message: string) => new AppError("VALIDATION_ERROR", message),
  unauthorized: (message = "Unauthorized") => new AppError("UNAUTHORIZED", message),
  forbidden: (message = "Forbidden") => new AppError("FORBIDDEN", message),
  notFound: (message = "Not found") => new AppError("NOT_FOUND", message),
  conflict: (message: string) => new AppError("CONFLICT", message),
  otpExpired: (message = "OTP has expired") => new AppError("OTP_EXPIRED", message),
  otpInvalid: (message = "Invalid OTP") => new AppError("OTP_INVALID", message),
  server: (message = "Something went wrong") => new AppError("SERVER_ERROR", message),
};
