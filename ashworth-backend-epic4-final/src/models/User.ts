// import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

// export type MembershipStatus =
//   | "payment_pending"
//   | "documents_pending"
//   | "pending_approval"
//   | "approved"
//   | "rejected";

// export interface IUser extends MongooseDocument {
//   clubId: Types.ObjectId;
//   fullName: string;
//   email: string;
//   phone: string;
//   dob: Date;
//   address: string;
//   occupation: string;
//   passwordHash: string;
//   emailVerified: boolean;
//   membershipStatus: MembershipStatus;
//   consent: {
//     accepted: boolean;
//     consentVersion: string;
//     signedName: string;
//     acceptedAt: Date;
//   } | null;
//   googleId?: string | null;
//   kyc: {
//     aadharNumber: string | null;
//     panNumber: string | null;
//   };
//   reviewNote?: string | null;
//   passwordResetOtp?: {
//     codeHash: string;
//     expiresAt: Date;
//     attempts: number;
//   } | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const UserSchema = new Schema<IUser>(
//   {
//     clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
//     fullName: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     phone: { type: String, required: true },
//     dob: { type: Date, required: true },
//     address: { type: String, required: true },
//     occupation: { type: String, required: true },
//     passwordHash: { type: String, required: true },
//     emailVerified: { type: Boolean, default: false },
//     membershipStatus: {
//       type: String,
//       enum: ["payment_pending", "documents_pending", "pending_approval", "approved", "rejected"],
//       default: "payment_pending",
//     },
//     consent: {
//       accepted: { type: Boolean, default: false },
//       consentVersion: { type: String, default: "" },
//       signedName: { type: String, default: "" },
//       acceptedAt: { type: Date, default: null },
//     },
//     googleId: { type: String, default: null },
//     // KYC numbers live directly on the User (not a separate collection) —
//     // there's exactly one KYC record per user and it's always checked
//     // alongside the user record itself (e.g. at documents/submit time), so
//     // a join/lookup would add cost for no benefit. NOT part of the
//     // contract's public User shape, so it's stripped in toJSON below;
//     // internal code reads it straight off the Mongoose document.
//     kyc: {
//       aadharNumber: { type: String, default: null },
//       panNumber: { type: String, default: null },
//     },
//     // Set by Admin at membership approve/reject time (PATCH
//     // /admin/users/:id/membership/approve). Not part of the contract's
//     // public User shape, so it's included in toJSON — it's informational
//     // for the user to see why they were rejected, unlike the OTP/KYC
//     // internals which stay hidden. (Flip to `select:false` + delete-in-
//     // toJSON if you'd rather keep review notes admin-only.)
//     reviewNote: { type: String, default: null },
//     // Ephemeral forgot-password OTP, hidden from default queries/JSON.
//     // Not part of the contract's User object — only ever read/written
//     // internally by the forgot-password endpoints.
//     passwordResetOtp: {
//       type: {
//         codeHash: { type: String },
//         expiresAt: { type: Date },
//         attempts: { type: Number, default: 0 },
//       },
//       default: null,
//       select: false,
//     },
//   },
//   { timestamps: true }
// );

// // Never expose passwordHash (or __v) when a User doc is serialized into an API response.
// UserSchema.set("toJSON", {
//   transform: (_doc, ret: any) => {
//     delete ret.passwordHash;
//     delete ret.passwordResetOtp;
//     delete ret.kyc;
//     delete ret.__v;
//     return ret;
//   },
// });

// export const User = model<IUser>("User", UserSchema);


import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export type MembershipStatus =
  | "payment_pending"
  | "documents_pending"
  | "pending_approval"
  | "approved"
  | "rejected";

export interface IUser extends MongooseDocument {
  clubId: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  address: string;
  occupation: string;
  passwordHash: string;
  emailVerified: boolean;
  membershipStatus: MembershipStatus;
  consent: {
    accepted: boolean;
    consentVersion: string;
    signedName: string;
    // Carried over verbatim from SignupSession.consent.signatureImage at
    // otp/verify time. Kept exposed via toJSON (unlike kyc/passwordHash
    // below) since the rest of the consent record is already part of the
    // contract's public User shape — flip to `select: false` + strip it
    // in the transform below if you'd rather not return it on every
    // profile/check-auth fetch.
    signatureImage: string;
    acceptedAt: Date;
  } | null;
  googleId?: string | null;
  kyc: {
    aadharNumber: string | null;
    panNumber: string | null;
  };
  reviewNote?: string | null;
  passwordResetOtp?: {
    codeHash: string;
    expiresAt: Date;
    attempts: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    occupation: { type: String, required: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    membershipStatus: {
      type: String,
      enum: ["payment_pending", "documents_pending", "pending_approval", "approved", "rejected"],
      default: "payment_pending",
    },
    consent: {
      accepted: { type: Boolean, default: false },
      consentVersion: { type: String, default: "" },
      signedName: { type: String, default: "" },
      signatureImage: { type: String, default: "" },
      acceptedAt: { type: Date, default: null },
    },
    googleId: { type: String, default: null },
    // KYC numbers live directly on the User (not a separate collection) —
    // there's exactly one KYC record per user and it's always checked
    // alongside the user record itself (e.g. at documents/submit time), so
    // a join/lookup would add cost for no benefit. NOT part of the
    // contract's public User shape, so it's stripped in toJSON below;
    // internal code reads it straight off the Mongoose document.
    kyc: {
      aadharNumber: { type: String, default: null },
      panNumber: { type: String, default: null },
    },
    // Set by Admin at membership approve/reject time (PATCH
    // /admin/users/:id/membership/approve). Not part of the contract's
    // public User shape, so it's included in toJSON — it's informational
    // for the user to see why they were rejected, unlike the OTP/KYC
    // internals which stay hidden. (Flip to `select:false` + delete-in-
    // toJSON if you'd rather keep review notes admin-only.)
    reviewNote: { type: String, default: null },
    // Ephemeral forgot-password OTP, hidden from default queries/JSON.
    // Not part of the contract's User object — only ever read/written
    // internally by the forgot-password endpoints.
    passwordResetOtp: {
      type: {
        codeHash: { type: String },
        expiresAt: { type: Date },
        attempts: { type: Number, default: 0 },
      },
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

// Never expose passwordHash (or __v) when a User doc is serialized into an API response.
UserSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.passwordResetOtp;
    delete ret.kyc;
    delete ret.__v;
    return ret;
  },
});

export const User = model<IUser>("User", UserSchema);