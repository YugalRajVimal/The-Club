import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyUserToken, hashToken } from "../utils/jwt";
import { TokenBlacklist } from "../models/TokenBlacklist";

// Request.userAuth / Request.rawToken are already declared globally by
// middleware/userAuth.ts — no need to redeclare them here.

/**
 * Like userAuth, but never rejects the request. If a valid, non-blacklisted
 * user-audience JWT is present, req.userAuth / req.rawToken are populated
 * exactly as userAuth would; otherwise the request simply proceeds
 * anonymously (req.userAuth left undefined).
 *
 * Used on endpoints that must stay callable without a login (the signup/*
 * flow) but need to detect + reject an already-logged-in caller, since a
 * User in this schema always has exactly one clubId/membershipStatus —
 * being authenticated at all means "already has a membership."
 */
export async function optionalUserAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = verifyUserToken(token); // throws on invalid/expired/wrong-audience

    const blacklisted = await TokenBlacklist.findOne({ token: hashToken(token) });
    if (blacklisted) return next(); // revoked token — treat as anonymous

    req.userAuth = payload;
    req.rawToken = token;
  } catch (err) {
    // Invalid, expired, or wrong-audience token on an optional-auth route —
    // don't throw jwt.TokenExpiredError etc. here, just proceed anonymously.
    void err;
  }

  next();
}