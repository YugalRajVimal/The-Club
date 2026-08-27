import { Schema, model, Document as MongooseDocument, Types } from "mongoose";

export interface IReceipt extends MongooseDocument {
  userId: Types.ObjectId;
  paymentId: Types.ObjectId;
  receiptNumber: string;
  clubName: string;
  memberName: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    receiptNumber: { type: String, required: true, unique: true },
    clubName: { type: String, required: true },
    memberName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    issuedAt: { type: Date, default: Date.now },
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

export const Receipt = model<IReceipt>("Receipt", ReceiptSchema);
