import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { User } from "../models/User";
import { UserDocument, DocumentType } from "../models/Document";
import { uploadFile } from "../services/storageService";

const DOCUMENT_TYPES: DocumentType[] = ["aadhar_front", "aadhar_back", "pan_front"];

const REQUIRED_LIST = [
  { key: "aadhar_number", label: "Aadhar Number", inputType: "text" },
  { key: "aadhar_front", label: "Aadhar Card (Front)", inputType: "file" },
  { key: "aadhar_back", label: "Aadhar Card (Back)", inputType: "file" },
  { key: "pan_number", label: "PAN Number", inputType: "text" },
  { key: "pan_front", label: "PAN Card (Front)", inputType: "file" },
];

// Folder-per-document-type under uploads/documents/..., mirrored on the
// Cloudinary side by storageService (see storageService.ts's cloudFolder).
function folderForDocumentType(documentType: DocumentType): string {
  if (documentType === "aadhar_front" || documentType === "aadhar_back") {
    return "documents/aadhar";
  }
  return "documents/pan";
}

// GET /api/user/documents/required-list
export const getRequiredList = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, REQUIRED_LIST);
});

// POST /api/user/documents/upload   [USER AUTH]  multipart/form-data
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const { documentType, aadharNumber, panNumber } = req.body ?? {};
  const file = req.file;

  if (!documentType || !DOCUMENT_TYPES.includes(documentType)) {
    throw Errors.validation(`documentType must be one of: ${DOCUMENT_TYPES.join(", ")}`);
  }
  if (!file) throw Errors.validation("file is required");

  const { fileUrl, storageProvider } = await uploadFile(
    file.buffer,
    file.originalname,
    folderForDocumentType(documentType)
  );

  // Upsert-by-(userId, documentType): a re-upload replaces the previous
  // record for that type rather than accumulating duplicates, and resets
  // verification state since the file itself has changed.
  const document = await UserDocument.findOneAndUpdate(
    { userId: req.userAuth!.userId, documentType },
    {
      userId: req.userAuth!.userId,
      documentType,
      fileUrl,
      fileName: file.originalname,
      storageProvider,
      verified: false,
      verifiedBy: null,
      verifiedAt: null,
      uploadedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // KYC numbers may optionally ride along with the first upload, per the
  // contract ("plus a separate JSON field: aadharNumber, panNumber sent
  // alongside first upload OR via /user/documents/kyc-numbers").
  if (aadharNumber || panNumber) {
    const update: Record<string, string> = {};
    if (aadharNumber) update["kyc.aadharNumber"] = aadharNumber;
    if (panNumber) update["kyc.panNumber"] = panNumber;
    await User.updateOne({ _id: req.userAuth!.userId }, { $set: update });
  }

  return sendSuccess(res, { document }, 201);
});

// POST /api/user/documents/kyc-numbers   [USER AUTH]
export const saveKycNumbers = asyncHandler(async (req: Request, res: Response) => {
  const { aadharNumber, panNumber } = req.body ?? {};
  if (!aadharNumber && !panNumber) {
    throw Errors.validation("At least one of aadharNumber or panNumber is required");
  }

  const update: Record<string, string> = {};
  if (aadharNumber) update["kyc.aadharNumber"] = aadharNumber;
  if (panNumber) update["kyc.panNumber"] = panNumber;

  await User.updateOne({ _id: req.userAuth!.userId }, { $set: update });

  return sendSuccess(res, { message: "Saved" });
});

// GET /api/user/documents   [USER AUTH]
export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const documents = await UserDocument.find({ userId: req.userAuth!.userId }).sort({ uploadedAt: -1 });
  return sendSuccess(res, documents);
});

// POST /api/user/documents/submit   [USER AUTH]
export const submitDocuments = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userAuth!.userId);
  if (!user) throw Errors.unauthorized("User no longer exists");

  const documents = await UserDocument.find({ userId: user._id });
  const uploadedTypes = new Set(documents.map((d) => d.documentType));

  const missing: string[] = [];
  for (const type of DOCUMENT_TYPES) {
    if (!uploadedTypes.has(type)) missing.push(type);
  }
  if (!user.kyc?.aadharNumber) missing.push("aadhar_number");
  if (!user.kyc?.panNumber) missing.push("pan_number");

  if (missing.length > 0) {
    throw Errors.validation(`Missing required item(s): ${missing.join(", ")}`);
  }

  user.membershipStatus = "pending_approval";
  await user.save();

  return sendSuccess(res, { membershipStatus: user.membershipStatus });
});
