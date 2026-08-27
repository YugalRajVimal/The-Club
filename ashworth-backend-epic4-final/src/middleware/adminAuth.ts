import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyAdminToken, hashToken, AdminTokenPayload } from "../utils/jwt";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { Errors } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminAuth?: AdminTokenPayload;
    }
  }
}

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw Errors.unauthorized("Missing or malformed Authorization header");
  }
  return header.slice("Bearer ".length).trim();
}

// [ADMIN AUTH] — requires a valid, non-blacklisted admin-audience JWT.
// A user token can never pass this (wrong secret AND wrong `aud` claim),
// mirroring userAuth.ts on the other side.
export const adminAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);

  let payload: AdminTokenPayload;
  try {
    payload = verifyAdminToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw Errors.unauthorized("Token expired");
    }
    throw Errors.unauthorized("Invalid token");
  }

  const blacklisted = await TokenBlacklist.findOne({ token: hashToken(token) });
  if (blacklisted) {
    throw Errors.unauthorized("Token has been revoked");
  }

  req.adminAuth = payload;
  req.rawToken = token;
  next();
});
