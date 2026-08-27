import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

// Two entirely separate signing secrets/audiences. A token signed with
// JWT_USER_SECRET will fail verification against JWT_ADMIN_SECRET and vice
// versa — this is what guarantees a user token can never authorize an admin
// route (and vice versa), per the contract.

export interface UserTokenPayload {
  userId: string;
  membershipStatus: string;
  aud: "userAuth";
}

export interface AdminTokenPayload {
  adminId: string;
  role: "admin" | "sub_admin";
  permissions: Record<string, Record<string, boolean>> | null;
  aud: "adminAuth";
}

export function signUserToken(payload: Omit<UserTokenPayload, "aud">): string {
  const options: SignOptions = { expiresIn: env.JWT_USER_EXPIRES_IN as any };
  return jwt.sign({ ...payload, aud: "userAuth" }, env.JWT_USER_SECRET, options);
}

export function signAdminToken(payload: Omit<AdminTokenPayload, "aud">): string {
  const options: SignOptions = { expiresIn: env.JWT_ADMIN_EXPIRES_IN as any };
  return jwt.sign({ ...payload, aud: "adminAuth" }, env.JWT_ADMIN_SECRET, options);
}

export function verifyUserToken(token: string): UserTokenPayload {
  const decoded = jwt.verify(token, env.JWT_USER_SECRET, { audience: "userAuth" });
  return decoded as UserTokenPayload;
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ADMIN_SECRET, { audience: "adminAuth" });
  return decoded as AdminTokenPayload;
}

// TokenBlacklist stores a hash of the token rather than the raw JWT, so a DB
// read/leak doesn't hand out reusable bearer tokens.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Decode without verifying, used only to read the expiry when blacklisting a
// token on logout (we still verify it via the auth middleware before this
// point, so this is safe).
export function decodeExpiry(token: string): Date | null {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
}
