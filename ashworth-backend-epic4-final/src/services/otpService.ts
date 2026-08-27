import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Errors } from "../utils/errors";

export function generateOtp(): string {
  // 6-digit numeric OTP, zero-padded.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + env.OTP_EXPIRES_IN_SECONDS * 1000);
}

interface OtpRecord {
  codeHash: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Verifies a submitted OTP against a stored (hashed) record.
 * Throws AppError with contract codes OTP_EXPIRED / OTP_INVALID.
 * Mutates and returns the updated attempts count so the caller can persist
 * it (lockout after env.OTP_MAX_ATTEMPTS attempts).
 */
export async function verifyOtp(record: OtpRecord | null, submittedOtp: string): Promise<void> {
  if (!record || !record.codeHash || !record.expiresAt) {
    throw Errors.otpInvalid("No OTP was requested for this session");
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    throw Errors.otpInvalid("Too many incorrect attempts. Please request a new OTP.");
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw Errors.otpExpired();
  }

  const matches = await bcrypt.compare(submittedOtp, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    throw Errors.otpInvalid();
  }
}
