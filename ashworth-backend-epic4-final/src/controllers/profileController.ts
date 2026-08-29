// import { Request, Response } from "express";
// import { asyncHandler } from "../utils/asyncHandler";
// import { sendSuccess } from "../utils/response";
// import { Errors } from "../utils/errors";
// import { User } from "../models/User";
// import { Club } from "../models/Club";
// import { UserDocument } from "../models/Document";
// import { Receipt } from "../models/Receipt";

// function receiptToApiShape(receipt: InstanceType<typeof Receipt>) {
//   return {
//     id: receipt._id,
//     userId: receipt.userId,
//     receiptNumber: receipt.receiptNumber,
//     clubName: receipt.clubName,
//     memberName: receipt.memberName,
//     amount: receipt.amount,
//     currency: receipt.currency,
//     paidAt: receipt.issuedAt,
//     downloadUrl: "/api/membership/receipt/download",
//   };
// }

// // GET /api/user/profile   [USER AUTH]
// export const getProfile = asyncHandler(async (req: Request, res: Response) => {
//   const user = await User.findById(req.userAuth!.userId);
//   if (!user) throw Errors.unauthorized("User no longer exists");

//   const [club, documents, latestReceipt] = await Promise.all([
//     Club.findById(user.clubId),
//     UserDocument.find({ userId: user._id }).sort({ uploadedAt: -1 }),
//     Receipt.findOne({ userId: user._id }).sort({ issuedAt: -1 }),
//   ]);

//   return sendSuccess(res, {
//     user,
//     club,
//     documents,
//     payment: latestReceipt ? receiptToApiShape(latestReceipt) : null,
//     membershipStatus: user.membershipStatus,
//   });
// });

// // PATCH /api/user/profile   [USER AUTH]
// export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
//   const { phone, address, occupation } = req.body ?? {};

//   // Contract: email, fullName, dob, clubId are NOT editable by the user
//   // post-signup — only these three fields are ever touched here, regardless
//   // of what else the client sends in the body.
//   const update: Record<string, string> = {};
//   if (phone !== undefined) update.phone = phone;
//   if (address !== undefined) update.address = address;
//   if (occupation !== undefined) update.occupation = occupation;

//   if (Object.keys(update).length === 0) {
//     throw Errors.validation("At least one of phone, address, occupation is required");
//   }

//   const user = await User.findByIdAndUpdate(req.userAuth!.userId, { $set: update }, { new: true });
//   if (!user) throw Errors.unauthorized("User no longer exists");

//   return sendSuccess(res, user);
// });


import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { User } from "../models/User";
import { Club } from "../models/Club";
import { UserDocument } from "../models/Document";
import { Receipt } from "../models/Receipt";
import { reconcilePendingPayments } from "./paymentController";

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

// GET /api/user/profile   [USER AUTH]
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  let user = await User.findById(req.userAuth!.userId);
  if (!user) throw Errors.unauthorized("User no longer exists");

  // Same missed-webhook fallback as userLogin: if this user has a payment
  // stuck in "created", re-check it with Cashfree before building the
  // response, so a stale "payment_pending" doesn't linger on their profile
  // just because the webhook never arrived.
  await reconcilePendingPayments(user._id.toString());
  user = (await User.findById(user._id)) ?? user;

  const [club, documents, latestReceipt] = await Promise.all([
    Club.findById(user.clubId),
    UserDocument.find({ userId: user._id }).sort({ uploadedAt: -1 }),
    Receipt.findOne({ userId: user._id }).sort({ issuedAt: -1 }),
  ]);

  return sendSuccess(res, {
    user,
    club,
    documents,
    payment: latestReceipt ? receiptToApiShape(latestReceipt) : null,
    membershipStatus: user.membershipStatus,
  });
});

// PATCH /api/user/profile   [USER AUTH]
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { phone, address, occupation } = req.body ?? {};

  // Contract: email, fullName, dob, clubId are NOT editable by the user
  // post-signup — only these three fields are ever touched here, regardless
  // of what else the client sends in the body.
  const update: Record<string, string> = {};
  if (phone !== undefined) update.phone = phone;
  if (address !== undefined) update.address = address;
  if (occupation !== undefined) update.occupation = occupation;

  if (Object.keys(update).length === 0) {
    throw Errors.validation("At least one of phone, address, occupation is required");
  }

  const user = await User.findByIdAndUpdate(req.userAuth!.userId, { $set: update }, { new: true });
  if (!user) throw Errors.unauthorized("User no longer exists");

  return sendSuccess(res, user);
});