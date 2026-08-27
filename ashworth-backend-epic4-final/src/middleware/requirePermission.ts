import { NextFunction, Request, RequestHandler, Response } from "express";
import { adminAuth } from "./adminAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { Errors } from "../utils/errors";
import { Role } from "../models/Role";
import { AdminAccount } from "../models/AdminAccount";

/**
 * requirePermission("users.view") — a middleware factory.
 *
 * Composes with adminAuth (runs it first, so a single route array like
 * `[requirePermission("users.view")]` is enough — no need to also list
 * adminAuth separately).
 *
 * - type === "admin" (super admin): always passes, no permission lookup.
 * - type === "sub_admin": re-fetches the CURRENT AdminAccount + Role from
 *   the DB on every request (rather than trusting the permissions embedded
 *   in the JWT at login time) and checks the specific dotted path. This is
 *   a deliberate correctness-over-latency tradeoff: the contract itself
 *   flags that embedding permissions in the token risks staleness if a
 *   role is edited mid-session, and a single indexed lookup by roleId is
 *   cheap enough that there's no real reason to accept stale permissions
 *   for a 24h token window. If this ever needs to be cheaper, swap this
 *   for a short-TTL in-memory cache keyed by roleId.
 */
export function requirePermission(permissionPath: string): RequestHandler[] {
  const checker = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.adminAuth!;

    if (auth.role === "admin") {
      return next();
    }

    // sub_admin: re-fetch fresh permissions.
    const admin = await AdminAccount.findById(auth.adminId);
    if (!admin) throw Errors.unauthorized("Admin account no longer exists");
    if (admin.type !== "sub_admin" || !admin.roleId) {
      throw Errors.forbidden("No role assigned");
    }

    const role = await Role.findById(admin.roleId);
    if (!role) throw Errors.forbidden("Assigned role no longer exists");

    const [section, action] = permissionPath.split(".");
    // Avoid guessing at the concrete type. Use unknown and then check structure.
    const permissionsObj = role.permissions as unknown;
    let allowed = false;
    if (
      permissionsObj &&
      typeof permissionsObj === "object" &&
      section in (permissionsObj as Record<string, unknown>) &&
      (permissionsObj as Record<string, unknown>)[section] &&
      typeof (permissionsObj as Record<string, unknown>)[section] === "object" &&
      action in ((permissionsObj as Record<string, Record<string, unknown>>)[section] as Record<string, unknown>)
    ) {
      const permitted =
        ((permissionsObj as Record<string, Record<string, boolean>>)[section] as Record<string, boolean>)[action];
      allowed = Boolean(permitted);
    }

    if (!allowed) {
      throw Errors.forbidden(`Missing permission: ${permissionPath}`);
    }

    next();
  });

  return [adminAuth, checker];
}

// For routes that only need "any valid admin/sub-admin token", no specific
// permission — e.g. GET /api/auth/admin/check-auth.
export const anyAdmin: RequestHandler[] = [adminAuth];
