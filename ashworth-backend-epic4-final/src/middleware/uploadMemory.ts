import multer from "multer";
import { Errors } from "../utils/errors";

// Parses multipart/form-data into memory (never disk) — the buffer is then
// handed to storageService.uploadFile(), which is the ONLY place that
// decides where the bytes actually end up (local disk vs Cloudinary). This
// keeps multer purely a request-parsing concern, never a storage decision.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(Errors.validation(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});
