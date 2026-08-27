import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { Club } from "../models/Club";
import { User } from "../models/User";
import { SignupSession } from "../models/SignupSession";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { signUserToken, hashToken, decodeExpiry } from "../utils/jwt";
import { generateOtp, hashOtp, otpExpiryDate, verifyOtp } from "../services/otpService";
import { sendOtpEmail, sendPasswordResetOtpEmail } from "../services/emailService";
import { env } from "../config/env";

const googleClient = new OAuth2Client();

/* ───────────────────────────── SIGNUP FLOW ───────────────────────────── */

// POST /api/auth/user/signup/start
export const signupStart = asyncHandler(async (req: Request, res: Response) => {
  const { clubId, fullName, email, phone, dob, address, occupation, password } = req.body ?? {};

  const missing = ["clubId", "fullName", "email", "phone", "dob", "address", "occupation", "password"].filter(
    (field) => !req.body?.[field]
  );
  if (missing.length > 0) {
    throw Errors.validation(`Missing required field(s): ${missing.join(", ")}`);
  }
  if (typeof password !== "string" || password.length < 8) {
    throw Errors.validation("Password must be at least 8 characters");
  }

  const club = await Club.findById(clubId);
  if (!club) throw Errors.notFound("Club not found");
  if (!club.membershipOpen) throw Errors.conflict("Membership is currently closed for this club");

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser && existingUser.emailVerified) {
    throw Errors.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const session = await SignupSession.create({
    clubId: club._id,
    formData: {
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      dob,
      address,
      occupation,
      passwordHash,
    },
    status: "consent_pending",
  });

  return sendSuccess(res, { signupSessionId: session._id, status: session.status });
});

// POST /api/auth/user/signup/consent
export const signupConsent = asyncHandler(async (req: Request, res: Response) => {
  const { signupSessionId, consentAccepted, consentVersion, signedName } = req.body ?? {};

  if (!signupSessionId || consentAccepted !== true || !consentVersion || !signedName) {
    throw Errors.validation(
      "signupSessionId, consentAccepted (true), consentVersion, and signedName are required"
    );
  }

  const session = await SignupSession.findById(signupSessionId);
  if (!session) throw Errors.notFound("Signup session not found");
  if (session.status !== "consent_pending") {
    throw Errors.conflict(`Session is not awaiting consent (current status: ${session.status})`);
  }

  session.consent = {
    accepted: true,
    consentVersion,
    signedName,
    acceptedAt: new Date(),
  };
  session.status = "otp_pending";
  await session.save();

  return sendSuccess(res, { signupSessionId: session._id, status: session.status });
});

// POST /api/auth/user/signup/otp/send
export const signupOtpSend = asyncHandler(async (req: Request, res: Response) => {
  const { signupSessionId } = req.body ?? {};
  if (!signupSessionId) throw Errors.validation("signupSessionId is required");

  const session = await SignupSession.findById(signupSessionId);
  if (!session) throw Errors.notFound("Signup session not found");
  if (session.status !== "otp_pending") {
    throw Errors.conflict(`Session is not awaiting OTP (current status: ${session.status})`);
  }

  const otp = generateOtp();
  session.otp = {
    codeHash: await hashOtp(otp),
    expiresAt: otpExpiryDate(),
    attempts: 0,
  };
  await session.save();

  await sendOtpEmail(session.formData.email, otp);

  return sendSuccess(res, { message: "OTP sent to email", expiresInSeconds: env.OTP_EXPIRES_IN_SECONDS });
});

// POST /api/auth/user/signup/otp/verify
// (verifyOtp mutates the attempts counter in place on a wrong guess before
// throwing; we persist that via session.save() in the catch block below so
// lockout counts correctly across requests, then rethrow for the error
// handler to serialize as OTP_INVALID / OTP_EXPIRED.)
export const signupOtpVerify = asyncHandler(async (req: Request, res: Response) => {
  const { signupSessionId, otp } = req.body ?? {};
  if (!signupSessionId || !otp) throw Errors.validation("signupSessionId and otp are required");

  const session = await SignupSession.findById(signupSessionId);
  if (!session) throw Errors.notFound("Signup session not found");
  if (session.status !== "otp_pending") {
    throw Errors.conflict(`Session is not awaiting OTP verification (current status: ${session.status})`);
  }

  try {
    await verifyOtp(session.otp, otp);
  } catch (err) {
    await session.save(); // persist incremented attempts even on failure
    throw err;
  }

  const { fullName, email, phone, dob, address, occupation, passwordHash } = session.formData;

  const alreadyExists = await User.findOne({ email });
  if (alreadyExists) {
    throw Errors.conflict("An account with this email already exists");
  }

  const user = await User.create({
    clubId: session.clubId,
    fullName,
    email,
    phone,
    dob,
    address,
    occupation,
    passwordHash,
    emailVerified: true,
    membershipStatus: "payment_pending",
    consent: session.consent,
  });

  await SignupSession.deleteOne({ _id: session._id });

  const token = signUserToken({ userId: user._id.toString(), membershipStatus: user.membershipStatus });

  return sendSuccess(res, { user, token, status: user.membershipStatus }, 201);
});

/* ───────────────────────────── LOGIN / SESSION ───────────────────────────── */

// POST /api/auth/user/login
export const userLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw Errors.validation("email and password are required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.emailVerified) {
    throw Errors.unauthorized("Invalid email or password");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw Errors.unauthorized("Invalid email or password");

  const token = signUserToken({ userId: user._id.toString(), membershipStatus: user.membershipStatus });
  return sendSuccess(res, { user, token });
});

// POST /api/auth/user/login/google
export const userLoginGoogle = asyncHandler(async (req: Request, res: Response) => {
  const { googleIdToken } = req.body ?? {};
  if (!googleIdToken) throw Errors.validation("googleIdToken is required");

  let email: string | undefined;
  let googleId: string | undefined;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: googleIdToken });
    const payload = ticket.getPayload();
    email = payload?.email?.toLowerCase().trim();
    googleId = payload?.sub;
  } catch {
    throw Errors.unauthorized("Invalid Google ID token");
  }

  if (!email) throw Errors.unauthorized("Invalid Google ID token");

  // Only succeeds if a User already exists with that email and is verified —
  // this endpoint never creates an account, per the contract.
  const user = await User.findOne({ email });
  if (!user || !user.emailVerified) {
    throw Errors.notFound("No membership account found for this email");
  }

  if (googleId && !user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const token = signUserToken({ userId: user._id.toString(), membershipStatus: user.membershipStatus });
  return sendSuccess(res, { user, token });
});

// POST /api/auth/user/forgot-password/otp/send
export const forgotPasswordOtpSend = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email) throw Errors.validation("email is required");

  const user = await User.findOne({ email: email.toLowerCase().trim(), emailVerified: true });
  // Deliberately return the same success shape whether or not the account
  // exists, to avoid leaking account existence via this endpoint.
  if (user) {
    const otp = generateOtp();
    const codeHash = await hashOtp(otp);
    const expiresAt = otpExpiryDate();
    await User.updateOne(
      { _id: user._id },
      { $set: { passwordResetOtp: { codeHash, expiresAt, attempts: 0 } } }
    );
    await sendPasswordResetOtpEmail(user.email, otp);
  }

  return sendSuccess(res, { message: "If that email exists, an OTP has been sent", expiresInSeconds: env.OTP_EXPIRES_IN_SECONDS });
});

// POST /api/auth/user/forgot-password/otp/verify
export const forgotPasswordOtpVerify = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body ?? {};
  if (!email || !otp || !newPassword) throw Errors.validation("email, otp, and newPassword are required");
  if (newPassword.length < 8) throw Errors.validation("newPassword must be at least 8 characters");

  const user = await User.findOne({ email: email.toLowerCase().trim(), emailVerified: true }).select(
    "+passwordResetOtp"
  );
  const record = (user as any)?.passwordResetOtp ?? null;
  if (!user || !record) {
    throw Errors.otpInvalid("No password reset was requested for this email");
  }

  try {
    await verifyOtp(record, otp);
  } catch (err) {
    await User.updateOne({ _id: user._id }, { $set: { "passwordResetOtp.attempts": record.attempts } });
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash: user.passwordHash }, $unset: { passwordResetOtp: "" } }
  );

  return sendSuccess(res, { message: "Password reset" });
});

// POST /api/auth/user/logout   [USER AUTH]
export const userLogout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.rawToken!;
  const expiresAt = decodeExpiry(token) ?? new Date(Date.now() + 24 * 3600 * 1000);
  await TokenBlacklist.updateOne(
    { token: hashToken(token) },
    { $set: { token: hashToken(token), expiresAt } },
    { upsert: true }
  );
  return sendSuccess(res, { message: "Logged out" });
});

// GET /api/auth/user/check-auth   [USER AUTH]
export const userCheckAuth = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userAuth!.userId);
  if (!user) throw Errors.unauthorized("User no longer exists");
  return sendSuccess(res, { user });
});
