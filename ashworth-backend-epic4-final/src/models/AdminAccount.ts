import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export type AdminType = "admin" | "sub_admin";

export interface IAdminAccount extends MongooseDocument {
  name: string;
  email: string;
  passwordHash: string;
  type: AdminType;
  roleId: Types.ObjectId | null; // always null when type === "admin"
  passwordResetOtp?: {
    codeHash: string;
    expiresAt: Date;
    attempts: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminAccountSchema = new Schema<IAdminAccount>(
  {
    name: { type: String, required: true, trim: true },
    // Unique within AdminAccount only — deliberately NOT unique across the
    // whole database, since the contract explicitly allows this email to
    // duplicate a User's email. Enforced at the application layer in
    // adminAuthController/subAdminController (checked against THIS
    // collection only), backed by this index for the DB-level guarantee.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    type: { type: String, enum: ["admin", "sub_admin"], required: true },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", default: null },
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

AdminAccountSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    delete ret.passwordResetOtp;
    delete ret.__v;
    return ret;
  },
});

export const AdminAccount = model<IAdminAccount>("AdminAccount", AdminAccountSchema);
