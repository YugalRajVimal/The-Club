import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export type PaymentStatus = "created" | "paid" | "failed";

export interface IPayment extends MongooseDocument {
  userId: Types.ObjectId;
  clubId: Types.ObjectId;
  cfOrderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  rawCashfreeResponse: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    cfOrderId: { type: String, required: true, unique: true },
    paymentSessionId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    paidAt: { type: Date, default: null },
    // Full Cashfree API responses (create-order, fetch-order, webhook payload)
    // kept verbatim for audit/dispute purposes — never surfaced to the frontend.
    rawCashfreeResponse: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
