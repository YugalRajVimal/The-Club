import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD, // Gmail App Password, NOT the account password
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await getTransporter().sendMail({
    from: `"Ashworth Club" <${env.GMAIL_USER}>`,
    to,
    subject: "Your Ashworth Club verification code",
    text: `Your verification code is ${otp}. It expires in ${env.OTP_EXPIRES_IN_SECONDS / 60} minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>It expires in ${env.OTP_EXPIRES_IN_SECONDS / 60} minutes. If you did not request this, you can ignore this email.</p>`,
  });
}

export async function sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
  await getTransporter().sendMail({
    from: `"Ashworth Club" <${env.GMAIL_USER}>`,
    to,
    subject: "Reset your Ashworth Club password",
    text: `Your password reset code is ${otp}. It expires in ${env.OTP_EXPIRES_IN_SECONDS / 60} minutes.`,
    html: `<p>Your password reset code is:</p><h2 style="letter-spacing:4px">${otp}</h2><p>It expires in ${env.OTP_EXPIRES_IN_SECONDS / 60} minutes.</p>`,
  });
}

// Stubs for later epics (built out fully once receipt/approval flows land).
export async function sendReceiptEmail(to: string, receiptNumber: string): Promise<void> {
  await getTransporter().sendMail({
    from: `"Ashworth Club" <${env.GMAIL_USER}>`,
    to,
    subject: `Your receipt ${receiptNumber}`,
    text: `Thank you for your payment. Receipt: ${receiptNumber}.`,
  });
}

export async function sendMembershipApprovalEmail(to: string, approved: boolean): Promise<void> {
  await getTransporter().sendMail({
    from: `"Ashworth Club" <${env.GMAIL_USER}>`,
    to,
    subject: approved ? "Your membership has been approved" : "Update on your membership application",
    text: approved
      ? "Congratulations! Your membership has been approved."
      : "There was an update to your membership application. Please log in for details.",
  });
}
