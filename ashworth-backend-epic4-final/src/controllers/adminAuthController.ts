import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { AdminAccount } from "../models/AdminAccount";
import { Role } from "../models/Role";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { signAdminToken, hashToken, decodeExpiry } from "../utils/jwt";
import { generateOtp, hashOtp, otpExpiryDate, verifyOtp } from "../services/otpService";
import { sendPasswordResetOtpEmail } from "../services/emailService";
import { env } from "../config/env";

// POST /api/auth/admin/login
export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw Errors.validation("email and password are required");

  const admin = await AdminAccount.findOne({ email: email.toLowerCase().trim() });
  if (!admin) throw Errors.unauthorized("Invalid email or password");

  const matches = await bcrypt.compare(password, admin.passwordHash);
  if (!matches) throw Errors.unauthorized("Invalid email or password");

  // Permissions are embedded in the token at login time for convenience,
  // but requirePermission.ts deliberately re-fetches fresh permissions from
  // the DB on every permission-gated request rather than trusting this
  // cached copy — see the comment there for why.
  let permissions: Record<string, Record<string, boolean>> | null = null;
  if (admin.type === "sub_admin" && admin.roleId) {
    const role = await Role.findById(admin.roleId);
    // Fix: Don't cast directly, use unknown first to satisfy TS2352 error.
    permissions = (role?.permissions as unknown as Record<string, Record<string, boolean>>) ?? null;
  }

  const token = signAdminToken({
    adminId: admin._id.toString(),
    role: admin.type,
    permissions,
  });

  return sendSuccess(res, { admin, token });
});

// GET /api/auth/admin/check-auth   [ADMIN AUTH]
export const adminCheckAuth = asyncHandler(async (req: Request, res: Response) => {
  const admin = await AdminAccount.findById(req.adminAuth!.adminId).populate("roleId");
  if (!admin) throw Errors.unauthorized("Admin account no longer exists");
  return sendSuccess(res, { admin });
});

// POST /api/auth/admin/logout   [ADMIN AUTH]
export const adminLogout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.rawToken!;
  const expiresAt = decodeExpiry(token) ?? new Date(Date.now() + 24 * 3600 * 1000);
  await TokenBlacklist.updateOne(
    { token: hashToken(token) },
    { $set: { token: hashToken(token), expiresAt } },
    { upsert: true }
  );
  return sendSuccess(res, { message: "Logged out" });
});

// POST /api/auth/admin/forgot-password/otp/send
export const adminForgotPasswordOtpSend = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email) throw Errors.validation("email is required");

  const admin = await AdminAccount.findOne({ email: email.toLowerCase().trim() });
  // Same non-leaking pattern as the user-side endpoint: always return success.
  if (admin) {
    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = otpExpiryDate();
    await AdminAccount.updateOne(
      { _id: admin._id },
      { $set: { passwordResetOtp: { codeHash, expiresAt, attempts: 0 } } }
    );
    await sendPasswordResetOtpEmail(admin.email, otp);
  }

  return sendSuccess(res, {
    message: "If that email exists, an OTP has been sent",
    expiresInSeconds: env.OTP_EXPIRES_IN_SECONDS,
  });
});

// POST /api/auth/admin/forgot-password/otp/verify
export const adminForgotPasswordOtpVerify = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body ?? {};
  if (!email || !otp || !newPassword) throw Errors.validation("email, otp, and newPassword are required");
  if (newPassword.length < 8) throw Errors.validation("newPassword must be at least 8 characters");

  const admin = await AdminAccount.findOne({ email: email.toLowerCase().trim() }).select("+passwordResetOtp");
  const record = (admin as any)?.passwordResetOtp ?? null;
  if (!admin || !record) {
    throw Errors.otpInvalid("No password reset was requested for this email");
  }

  try {
    await verifyOtp(record, otp);
  } catch (err) {
    await AdminAccount.updateOne({ _id: admin._id }, { $set: { "passwordResetOtp.attempts": record.attempts } });
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await AdminAccount.updateOne(
    { _id: admin._id },
    { $set: { passwordHash }, $unset: { passwordResetOtp: "" } }
  );

  return sendSuccess(res, { message: "Password reset" });
});
