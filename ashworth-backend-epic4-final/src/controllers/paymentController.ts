import { Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { Errors } from "../utils/errors";
import { User } from "../models/User";
import { Club } from "../models/Club";
import { Payment } from "../models/Payment";
import { Receipt } from "../models/Receipt";
import {
  createCashfreeOrder,
  fetchCashfreeOrderStatus,
  verifyCashfreeWebhookSignature,
} from "../services/cashfreeService";
import { issueReceipt } from "../services/receiptService";

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

// POST /api/membership/payment/create-order   [USER AUTH]
export const createPaymentOrder = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userAuth!.userId);
  if (!user) throw Errors.unauthorized("User no longer exists");

  const club = await Club.findById(user.clubId);
  if (!club) throw Errors.notFound("Club not found");

  // Amount is ALWAYS read from the club's fixed fee server-side — never
  // trusted from the client, per the contract.
  const orderAmount = club.membershipFee.amount;
  const currency = club.membershipFee.currency;

  // Cashfree order_id must be unique per attempt; a user can retry payment,
  // so we don't reuse a previous order_id for the same user.
  const orderId = `order_${user._id}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const cfOrder = await createCashfreeOrder({
    orderId,
    orderAmount,
    orderCurrency: currency,
    customerId: user._id.toString(),
    customerEmail: user.email,
    customerPhone: user.phone,
  });

  await Payment.create({
    userId: user._id,
    clubId: club._id,
    cfOrderId: cfOrder.cfOrderId || orderId,
    paymentSessionId: cfOrder.paymentSessionId,
    amount: orderAmount,
    currency,
    status: "created",
    rawCashfreeResponse: cfOrder.raw,
  });

  return sendSuccess(res, {
    cfOrderId: cfOrder.cfOrderId || orderId,
    paymentSessionId: cfOrder.paymentSessionId,
    orderAmount,
    currency,
  });
});

// POST /api/membership/payment/verify   [USER AUTH]
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { cfOrderId } = req.body ?? {};
  if (!cfOrderId) throw Errors.validation("cfOrderId is required");

  const payment = await Payment.findOne({ cfOrderId, userId: req.userAuth!.userId });
  if (!payment) throw Errors.notFound("Payment order not found");

  if (payment.status === "paid") {
    // Idempotent: already verified (e.g. webhook beat the client here).
    const existingReceipt = await Receipt.findOne({ paymentId: payment._id });
    return sendSuccess(res, {
      status: "paid",
      membershipStatus: "documents_pending",
      receipt: existingReceipt ? receiptToApiShape(existingReceipt) : null,
    });
  }

  // Authoritative check against Cashfree — never trust a client "success" flag alone.
  const statusResult = await fetchCashfreeOrderStatus(cfOrderId);
  payment.rawCashfreeResponse = statusResult.raw;

  if (statusResult.orderStatus !== "PAID") {
    payment.status = "failed";
    await payment.save();
    throw Errors.conflict(`Payment not confirmed by Cashfree (status: ${statusResult.orderStatus})`);
  }

  const user = await User.findById(payment.userId);
  const club = await Club.findById(payment.clubId);
  if (!user || !club) throw Errors.notFound("User or club not found");

  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  user.membershipStatus = "documents_pending";
  await user.save();

  const receipt = await issueReceipt({
    userId: user._id.toString(),
    paymentId: payment._id.toString(),
    clubName: club.name,
    memberName: user.fullName,
    amount: payment.amount,
    currency: payment.currency,
  });

  return sendSuccess(res, {
    status: "paid",
    membershipStatus: "documents_pending",
    receipt: receiptToApiShape(receipt),
  });
});

// POST /api/membership/payment/webhook   (no user auth — Cashfree server-to-server)
// NOTE: mounted with express.raw() upstream (see routes/membershipRoutes.ts) so
// req.body here is a Buffer — signature verification needs the exact raw bytes.
export const paymentWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.header("x-webhook-signature");
  const timestamp = req.header("x-webhook-timestamp");
  const rawBody = (req.body as Buffer).toString("utf8");

  if (!signature || !timestamp || !verifyCashfreeWebhookSignature(rawBody, timestamp, signature)) {
    // Webhook auth failures should not leak details; just reject.
    throw Errors.unauthorized("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody);
  const orderId: string | undefined = payload?.data?.order?.order_id;
  const orderStatus: string | undefined = payload?.data?.order?.order_status ?? payload?.data?.payment?.payment_status;

  if (!orderId) {
    // Malformed/unexpected payload shape — acknowledge with 200 so Cashfree
    // doesn't retry forever, but do nothing.
    return res.status(200).json({ success: true, data: { received: true } });
  }

  const payment = await Payment.findOne({ cfOrderId: orderId });
  if (!payment) {
    return res.status(200).json({ success: true, data: { received: true } });
  }

  payment.rawCashfreeResponse = payload;

  if (orderStatus === "PAID" && payment.status !== "paid") {
    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    const user = await User.findById(payment.userId);
    const club = await Club.findById(payment.clubId);
    if (user && club) {
      user.membershipStatus = "documents_pending";
      await user.save();

      const existingReceipt = await Receipt.findOne({ paymentId: payment._id });
      if (!existingReceipt) {
        await issueReceipt({
          userId: user._id.toString(),
          paymentId: payment._id.toString(),
          clubName: club.name,
          memberName: user.fullName,
          amount: payment.amount,
          currency: payment.currency,
        });
      }
    }
  } else if (orderStatus && orderStatus !== "PAID") {
    if (payment.status !== "paid") {
      payment.status = "failed";
    }
    await payment.save();
  } else {
    await payment.save();
  }

  return res.status(200).json({ success: true, data: { received: true } });
});

// GET /api/membership/receipt   [USER AUTH]
export const getReceipt = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await Receipt.findOne({ userId: req.userAuth!.userId }).sort({ issuedAt: -1 });
  if (!receipt) throw Errors.notFound("No receipt found for this user");
  return sendSuccess(res, receiptToApiShape(receipt));
});

// GET /api/membership/receipt/download   [USER AUTH]
export const downloadReceipt = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await Receipt.findOne({ userId: req.userAuth!.userId }).sort({ issuedAt: -1 });
  if (!receipt) throw Errors.notFound("No receipt found for this user");

  if (!fs.existsSync(receipt.filePath)) {
    throw Errors.notFound("Receipt file is missing on disk");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${receipt.receiptNumber}.pdf"`);
  fs.createReadStream(receipt.filePath).pipe(res);
});
