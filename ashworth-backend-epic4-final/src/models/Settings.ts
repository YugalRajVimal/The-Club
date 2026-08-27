import { Schema, model, Document as MongooseDocument } from "mongoose";

export type UploadProvider = "multer" | "cloudinary";

// Single-document collection: there is exactly one Settings row, upserted
// via a fixed singleton key so we never accidentally create a second one.
export interface ISettings extends MongooseDocument {
  singleton: "singleton";
  uploadProvider: UploadProvider;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    singleton: { type: String, default: "singleton", unique: true },
    uploadProvider: { type: String, enum: ["multer", "cloudinary"], default: "multer" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = model<ISettings>("Settings", SettingsSchema);

export async function getSettings(): Promise<ISettings> {
  let settings = await Settings.findOne({ singleton: "singleton" });
  if (!settings) {
    settings = await Settings.create({ singleton: "singleton", uploadProvider: "multer" });
  }
  return settings;
}
