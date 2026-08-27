import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { User, MembershipStatus } from "../models/User";
import { Club } from "../models/Club";
import { UserDocument } from "../models/Document";
import { Payment } from "../models/Payment";
import { Receipt } from "../models/Receipt";

const VALID_STATUSES: MembershipStatus[] = [
  "payment_pending",
  "documents_pending",
  "pending_approval",
  "approved",
  "rejected",
];

function receiptToApiShape(receipt: InstanceType<typeof Receipt>) {
  return {
    id: receipt._id,
    userId: receipt.userId,
    receiptNumber: receipt.receiptNumber,
    clubName: receipt.clubName,
    memberName: receipt.memberName,
    amount: receipt.amount,
    currency: receipt.currency,
    paidAt: receipt.issuedAt,
    downloadUrl: "/api/membership/receipt/download",
  };
}

// GET /api/admin/users   [requirePermission("users.view")]
// Query filters: ?status=&clubId=&search=
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { status, clubId, search } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) {
    if (!VALID_STATUSES.includes(status as MembershipStatus)) {
      throw Errors.validation(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    filter.membershipStatus = status;
  }
  if (clubId) filter.clubId = clubId;
  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ fullName: regex }, { email: regex }];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, users);
});

// GET /api/admin/users/:id   [requirePermission("users.view")]
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw Errors.notFound("User not found");

  const [club, documents, payments] = await Promise.all([
    Club.findById(user.clubId),
    UserDocument.find({ userId: user._id }).sort({ uploadedAt: -1 }),
    Payment.find({ userId: user._id }).sort({ createdAt: -1 }),
  ]);

  return sendSuccess(res, { user, club, documents, payments });
});

// POST /api/admin/users   [requirePermission("users.add")]
// Manual add: admin sets password directly, skips the OTP flow entirely.
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { clubId, fullName, email, phone, dob, address, occupation, password, membershipStatus } =
    req.body ?? {};

  const missing = ["clubId", "fullName", "email", "phone", "dob", "address", "occupation", "password"].filter(
    (field) => !req.body?.[field]
  );
  if (missing.length > 0) {
    throw Errors.validation(`Missing required field(s): ${missing.join(", ")}`);
  }
  if (password.length < 8) throw Errors.validation("Password must be at least 8 characters");

  const club = await Club.findById(clubId);
  if (!club) throw Errors.notFound("Club not found");

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw Errors.conflict("A user with this email already exists");

  if (membershipStatus && !VALID_STATUSES.includes(membershipStatus)) {
    throw Errors.validation(`membershipStatus must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    clubId: club._id,
    fullName,
    email: email.toLowerCase().trim(),
    phone,
    dob,
    address,
    occupation,
    passwordHash,
    emailVerified: true, // admin-created accounts skip the OTP flow entirely
    membershipStatus: membershipStatus || "payment_pending",
    consent: {
      accepted: true,
      consentVersion: "admin-created",
      signedName: fullName,
      acceptedAt: new Date(),
    },
  });

  return sendSuccess(res, user, 201);
});

// PATCH /api/admin/users/:id   [requirePermission("users.update")]
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const editableFields = [
    "fullName",
    "email",
    "phone",
    "dob",
    "address",
    "occupation",
    "clubId",
    "membershipStatus",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const field of editableFields) {
    if (req.body?.[field] !== undefined) update[field] = req.body[field];
  }

  if (update.email) {
    update.email = String(update.email).toLowerCase().trim();
    const existing = await User.findOne({ email: update.email, _id: { $ne: req.params.id } });
    if (existing) throw Errors.conflict("Another user already uses this email");
  }
  if (update.clubId) {
    const club = await Club.findById(update.clubId);
    if (!club) throw Errors.notFound("Club not found");
  }
  if (update.membershipStatus && !VALID_STATUSES.includes(update.membershipStatus as MembershipStatus)) {
    throw Errors.validation(`membershipStatus must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (Object.keys(update).length === 0) {
    throw Errors.validation("No editable fields provided");
  }

  const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  if (!user) throw Errors.notFound("User not found");

  return sendSuccess(res, user);
});

// DELETE /api/admin/users/:id   [requirePermission("users.delete")]
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw Errors.notFound("User not found");

  // Clean up dependent records so a deleted user doesn't leave orphaned
  // documents/payments/receipts lying around.
  await Promise.all([
    UserDocument.deleteMany({ userId: user._id }),
    Payment.deleteMany({ userId: user._id }),
    Receipt.deleteMany({ userId: user._id }),
  ]);

  return sendSuccess(res, { message: "User deleted" });
});

// PATCH /api/admin/users/:id/documents/:docId/verify   [requirePermission("users.verifyDocuments")]
export const verifyUserDocument = asyncHandler(async (req: Request, res: Response) => {
  const { verified, note } = req.body ?? {};
  if (typeof verified !== "boolean") throw Errors.validation("verified (boolean) is required");

  const document = await UserDocument.findOne({ _id: req.params.docId, userId: req.params.id });
  if (!document) throw Errors.notFound("Document not found for this user");

  document.verified = verified;
  document.verifiedBy = req.adminAuth!.adminId as any;
  document.verifiedAt = new Date();
  await document.save();

  // `note` isn't part of the contract's Document shape (no field for it on
  // the model), so it's accepted in the request but not persisted or
  // echoed back — the response is the Document itself, per the contract.
  // If a verification audit trail with notes becomes a real requirement,
  // this is the point to add a `verificationNote` field to Document.
  void note;

  return sendSuccess(res, document);
});

// PATCH /api/admin/users/:id/membership/approve   [requirePermission("users.approveMembership")]
export const approveMembership = asyncHandler(async (req: Request, res: Response) => {
  const { approve, note } = req.body ?? {};
  if (typeof approve !== "boolean") throw Errors.validation("approve (boolean) is required");

  const user = await User.findById(req.params.id);
  if (!user) throw Errors.notFound("User not found");

  // Only meaningfully transitions when currently "pending_approval" — an
  // approve/reject call on a user in any other state is a no-op response
  // rather than a silent state change, per the contract's spec.
  if (user.membershipStatus !== "pending_approval") {
    throw Errors.conflict(
      `User is not pending approval (current status: ${user.membershipStatus})`
    );
  }

  user.membershipStatus = approve ? "approved" : "rejected";
  if (note !== undefined) user.reviewNote = note;
  await user.save();

  return sendSuccess(res, { membershipStatus: user.membershipStatus });
});

// GET /api/admin/users/:id/payments   [requirePermission("users.view")]
export const getUserPayments = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw Errors.notFound("User not found");

  const receipts = await Receipt.find({ userId: user._id }).sort({ issuedAt: -1 });
  return sendSuccess(res, receipts.map(receiptToApiShape));
});
