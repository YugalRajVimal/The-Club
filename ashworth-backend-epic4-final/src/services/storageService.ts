import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { getSettings, UploadProvider } from "../models/Settings";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export interface UploadResult {
  fileUrl: string;
  storageProvider: UploadProvider;
}

/**
 * The ONE place any route/controller goes through to persist an uploaded
 * file. It reads Settings.uploadProvider at call time (not at boot), so an
 * admin flipping the toggle takes effect on the very next upload without a
 * restart. Response shape is identical regardless of which provider is
 * active — callers never need to branch on it.
 *
 * `folder` should be a document-type-ish subfolder, e.g. "documents/aadhar"
 * or "documents/pan" — kept consistent between the multer and Cloudinary
 * paths so the two storage backends mirror each other's organization.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  originalName: string,
  folder: string
): Promise<UploadResult> {
  const settings = await getSettings();
  const provider = settings.uploadProvider;

  if (provider === "cloudinary") {
    return uploadToCloudinary(fileBuffer, originalName, folder);
  }
  return uploadToLocalDisk(fileBuffer, originalName, folder);
}

function safeExt(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  // Allow only a small known-safe set of extensions; anything else is
  // dropped so we never write out an executable-looking filename.
  const allowed = [".jpg", ".jpeg", ".png", ".pdf", ".webp"];
  return allowed.includes(ext) ? ext : "";
}

function generatedFilename(originalName: string): string {
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt(originalName)}`;
}

async function uploadToLocalDisk(
  fileBuffer: Buffer,
  originalName: string,
  folder: string
): Promise<UploadResult> {
  const targetDir = path.join(UPLOADS_ROOT, folder);
  await fs.promises.mkdir(targetDir, { recursive: true });

  const filename = generatedFilename(originalName);
  const targetPath = path.join(targetDir, filename);
  await fs.promises.writeFile(targetPath, fileBuffer);

  // Servable URL path — app.ts serves /uploads statically from UPLOADS_ROOT.
  const fileUrl = `/uploads/${folder}/${filename}`.replace(/\\/g, "/");
  return { fileUrl, storageProvider: "multer" };
}

async function uploadToCloudinary(
  fileBuffer: Buffer,
  originalName: string,
  folder: string
): Promise<UploadResult> {
  const publicId = generatedFilename(originalName).replace(/\.[^.]+$/, "");
  const cloudFolder = `ashworth-club/${folder}`;

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: cloudFolder, public_id: publicId, resource_type: "auto" },
      (err, res) => {
        if (err || !res) return reject(err ?? new Error("Cloudinary upload failed"));
        resolve(res as { secure_url: string });
      }
    );
    uploadStream.end(fileBuffer);
  });

  return { fileUrl: result.secure_url, storageProvider: "cloudinary" };
}
