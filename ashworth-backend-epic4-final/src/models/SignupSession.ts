import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { env } from "../config/env";

export type SignupSessionStatus = "consent_pending" | "otp_pending" | "verified";

// DESIGN DECISION (password field):
// The contract's signup/start body is "clubId, fullName, email, phone, dob,
// address, occupation, ...otherMembershipFormFields" and never explicitly
// lists a password, yet the User model requires passwordHash and the login
// endpoint is password-based. Forcing a *separate* "set password" step after
// auto-login would be an extra screen the contract's flow diagram
// (Membership Form -> Consent -> OTP -> Account + Auto-Login) doesn't show,
// and a random generated password the user never sees would leave them
// unable to log in again without a forced reset.
// Chosen approach: treat `password` as one of the membership form's
// "...otherMembershipFormFields" and require it in signup/start's body. It is
// hashed immediately (never stored in plaintext, even in this pending
// session) and carried in formData until the real User is created at
// otp/verify time.
export interface ISignupSessionFormData {
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  address: string;
  occupation: string;
  passwordHash: string;
  [key: string]: unknown; // room for future membership-form fields
}

export interface ISignupSession extends MongooseDocument {
  clubId: Types.ObjectId;
  formData: ISignupSessionFormData;
  consent: {
    accepted: boolean;
    consentVersion: string;
    signedName: string;
    acceptedAt: Date;
  } | null;
  otp: {
    codeHash: string;
    expiresAt: Date;
    attempts: number;
  } | null;
  status: SignupSessionStatus;
  createdAt: Date;
}

const SignupSessionSchema = new Schema<ISignupSession>({
  clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
  formData: { type: Schema.Types.Mixed, required: true },
  consent: {
    accepted: { type: Boolean, default: false },
    consentVersion: { type: String, default: "" },
    signedName: { type: String, default: "" },
    acceptedAt: { type: Date, default: null },
  },
  otp: {
    codeHash: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["consent_pending", "otp_pending", "verified"],
    default: "consent_pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: abandoned/incomplete signup sessions auto-expire so they don't
// pile up (a verified session is deleted explicitly right after User
// creation anyway, well before this ever fires).
SignupSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: env.SIGNUP_SESSION_TTL_HOURS * 3600 }
);

export const SignupSession = model<ISignupSession>("SignupSession", SignupSessionSchema);
