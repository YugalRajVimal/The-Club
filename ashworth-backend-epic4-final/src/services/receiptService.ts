import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { Receipt } from "../models/Receipt";

const RECEIPTS_DIR = path.join(process.cwd(), "uploads", "receipts");

async function nextReceiptNumber(): Promise<string> {
  // Date-based + count-for-today sequence, e.g. RCPT-20260827-0001.
  // Simple and readable; swap for a dedicated counter collection later if
  // true monotonic sequencing across restarts/concurrency ever matters more
  // than "good enough and human-legible".
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const countToday = await Receipt.countDocuments({ issuedAt: { $gte: startOfDay } });
  const seq = String(countToday + 1).padStart(4, "0");

  return `RCPT-${datePart}-${seq}`;
}

export interface ReceiptData {
  receiptNumber: string;
  clubName: string;
  memberName: string;
  amount: number;
  currency: string;
  issuedAt: Date;
}

function generateReceiptPdf(data: ReceiptData, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("Ashworth Club", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text("Payment Receipt", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(11);
    doc.text(`Receipt Number: ${data.receiptNumber}`);
    doc.text(`Issued At: ${data.issuedAt.toLocaleString()}`);
    doc.moveDown();
    doc.text(`Member Name: ${data.memberName}`);
    doc.text(`Club: ${data.clubName}`);
    doc.moveDown();
    doc.fontSize(13).text(`Amount Paid: ${data.currency} ${data.amount.toFixed(2)}`, { underline: true });
    doc.moveDown(3);
    doc.fontSize(9).fillColor("gray").text("This is a system-generated receipt.", { align: "center" });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

export async function issueReceipt(params: {
  userId: string;
  paymentId: string;
  clubName: string;
  memberName: string;
  amount: number;
  currency: string;
}): Promise<InstanceType<typeof Receipt>> {
  await fs.promises.mkdir(RECEIPTS_DIR, { recursive: true });

  const receiptNumber = await nextReceiptNumber();
  const issuedAt = new Date();
  const filename = `${receiptNumber}.pdf`;
  const filePath = path.join(RECEIPTS_DIR, filename);

  await generateReceiptPdf(
    {
      receiptNumber,
      clubName: params.clubName,
      memberName: params.memberName,
      amount: params.amount,
      currency: params.currency,
      issuedAt,
    },
    filePath
  );

  return Receipt.create({
    userId: params.userId,
    paymentId: params.paymentId,
    receiptNumber,
    clubName: params.clubName,
    memberName: params.memberName,
    amount: params.amount,
    currency: params.currency,
    issuedAt,
    filePath,
  });
}
