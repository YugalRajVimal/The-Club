import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";
import { Errors } from "../utils/errors";

/**
 * validateBody(schema) — parses req.body against a Zod schema, replacing
 * req.body with the parsed (and type-coerced/defaulted) result on success.
 * On failure, throws the contract's VALIDATION_ERROR with a readable,
 * field-by-field message rather than Zod's raw issue array — every
 * POST/PATCH route in the app that takes a body should be wrapped in this
 * so validation failures are reported consistently through the same error
 * envelope as everything else.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw Errors.validation(formatZodError(result.error));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw Errors.validation(formatZodError(result.error));
    }
    // Express's req.query is technically read-only in types but assignable
    // at runtime; controllers read the validated/coerced version back off it.
    req.query = result.data as any;
    next();
  };
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}
