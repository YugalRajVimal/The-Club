import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Receipt } from "../models/Receipt";
import { Payment } from "../models/Payment";

// GET /api/admin/payments   [requirePermission("payments.view")]  ?clubId=&dateFrom=&dateTo=
// Lists Receipts (already carry memberName/clubName denormalized at issue
// time — see receiptService.ts — so no extra joins are needed here), with
// club and date-range filtering. clubId filters via the originating
// Payment record since Receipt itself doesn't store clubId directly.
export const listPaymentsOverview = asyncHandler(async (req: Request, res: Response) => {
  const { clubId, dateFrom, dateTo } = req.query as { clubId?: string; dateFrom?: Date; dateTo?: Date };

  const receiptFilter: Record<string, unknown> = {};

  if (dateFrom || dateTo) {
    const issuedAt: Record<string, Date> = {};
    if (dateFrom) issuedAt.$gte = dateFrom;
    if (dateTo) issuedAt.$lte = dateTo;
    receiptFilter.issuedAt = issuedAt;
  }

  if (clubId) {
    const paymentIds = await Payment.find({ clubId }).distinct("_id");
    receiptFilter.paymentId = { $in: paymentIds };
  }

  const receipts = await Receipt.find(receiptFilter).sort({ issuedAt: -1 });

  const data = receipts.map((receipt) => ({
    id: receipt._id,
    userId: receipt.userId,
    receiptNumber: receipt.receiptNumber,
    clubName: receipt.clubName,
    memberName: receipt.memberName,
    amount: receipt.amount,
    currency: receipt.currency,
    paidAt: receipt.issuedAt,
    // NOTE: the contract only defines a receipt download route scoped to
    // the CURRENTLY AUTHENTICATED user (GET /api/membership/receipt/download,
    // [USER AUTH], "the user's receipt" — no :id). There's no admin-facing
    // per-receipt download endpoint in the contract, so this field is
    // informational only in this admin listing; it is NOT a valid link for
    // an admin to fetch an arbitrary member's PDF (calling it with an admin
    // token would 401, since that route requires a user token). Flag this
    // if Admin needs to actually download a specific member's receipt —
    // that's a new contract endpoint (e.g. GET
    // /admin/users/:id/receipts/:receiptId/download), not something this
    // shape can express today.
    downloadUrl: "/api/membership/receipt/download",
  }));

  return sendSuccess(res, data);
});
