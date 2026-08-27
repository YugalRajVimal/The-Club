import { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/errors";

/**
 * When a route accepts multipart/form-data (because it also takes a file
 * upload, e.g. admin club create/update with a hero image), any nested
 * object field (membershipFee, whatWeOffer) has to travel as a
 * JSON-stringified form field — multipart has no native way to express
 * nested objects. This middleware JSON-parses those specific fields IF
 * they arrived as strings, before the request reaches Zod validation.
 *
 * A plain JSON request (no file, Content-Type: application/json) already
 * has these as real objects courtesy of express.json(), so this is a
 * no-op in that case — it only touches fields that are actually strings.
 */
export function parseJsonFields(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const field of fields) {
      const value = req.body?.[field];
      if (typeof value === "string" && value.length > 0) {
        try {
          req.body[field] = JSON.parse(value);
        } catch {
          throw Errors.validation(`${field} must be valid JSON when sent as a form field`);
        }
      }
    }
    next();
  };
}
