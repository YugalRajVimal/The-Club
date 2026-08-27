import { NextFunction, Request, RequestHandler, Response } from "express";
import { adminAuth } from "./adminAuth";
import { asyncHandler } from "../utils/asyncHandler";
import { Errors } from "../utils/errors";
import { AdminAccount } from "../models/AdminAccount";

/**
 * Roles & Sub-Admins management (Section 10 of the contract) is
 * deliberately NOT gated by requirePermission — no permission flag should
 * ever be able to grant a sub-admin the ability to create other sub-admins
 * or edit roles (including their own), since that would let a sub-admin
 * escalate their own privileges by editing the Role they're assigned to.
 * This is a hard `type === "admin"` check, independent of the
 * permission-map machinery entirely.
 *
 * Re-fetches the AdminAccount's current `type` from the DB (rather than
 * trusting the JWT's embedded `role` claim), consistent with
 * requirePermission.ts's choice to treat the DB as the source of truth for
 * authorization decisions — an admin downgraded to sub_admin mid-session
 * should lose super-admin access immediately, not after their token expires.
 */
export const requireSuperAdmin: RequestHandler[] = [
  adminAuth,
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const admin = await AdminAccount.findById(req.adminAuth!.adminId);
    if (!admin) throw Errors.unauthorized("Admin account no longer exists");
    if (admin.type !== "admin") {
      throw Errors.forbidden("This action is restricted to super admins");
    }
    next();
  }),
];

