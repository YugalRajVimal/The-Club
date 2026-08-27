import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyUserToken, hashToken, UserTokenPayload } from "../utils/jwt";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { Errors } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";

// Augment Express's Request type so controllers get typed access to the
// decoded user token payload after this middleware runs.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userAuth?: UserTokenPayload;
      rawToken?: string;
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

// [USER AUTH] — requires a valid, non-blacklisted user-audience JWT.
// A token signed for adminAuth will fail verifyUserToken (wrong secret AND
// wrong audience claim), so admin tokens can never pass as user auth.
export const userAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBearerToken(req);

  let payload: UserTokenPayload;
  try {
    payload = verifyUserToken(token);
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

  req.userAuth = payload;
  req.rawToken = token;
  next();
});
