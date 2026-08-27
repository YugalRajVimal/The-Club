import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export type DocumentType = "aadhar_front" | "aadhar_back" | "pan_front";
export type StorageProvider = "multer" | "cloudinary";

export interface IUserDocument extends MongooseDocument {
  userId: Types.ObjectId;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  storageProvider: StorageProvider;
  verified: boolean;
  verifiedBy: Types.ObjectId | null;
  verifiedAt: Date | null;
  uploadedAt: Date;
}

const UserDocumentSchema = new Schema<IUserDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  documentType: { type: String, enum: ["aadhar_front", "aadhar_back", "pan_front"], required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  storageProvider: { type: String, enum: ["multer", "cloudinary"], required: true },
  verified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "AdminAccount", default: null },
  verifiedAt: { type: Date, default: null },
  uploadedAt: { type: Date, default: Date.now },
});

// A user can re-upload the same documentType (e.g. correcting a bad photo);
// we keep the latest one authoritative via upsert-by-(userId, documentType)
// in the controller rather than accumulating duplicates.
UserDocumentSchema.index({ userId: 1, documentType: 1 }, { unique: true });

export const UserDocument = model<IUserDocument>("Document", UserDocumentSchema);
