"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/admin/AuthLayout";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { adminForgotPasswordOtpSend, adminForgotPasswordOtpVerify, ApiRequestError } from "@/lib/api/adminClient";

type Step = "email" | "reset";

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminForgotPasswordOtpSend(email.trim());
      toast.success("OTP sent to your email");
      setStep("reset");
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Couldn't send the OTP. Try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminForgotPasswordOtpVerify(email.trim(), otp.trim(), newPassword);
      toast.success("Password reset — sign in with your new password");
      router.replace("/admin/login");
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Couldn't reset the password. Check the OTP and try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Admin Console"
      title="Reset your password"
      subtitle={
        step === "email"
          ? "Enter your account email and we'll send a one-time code."
          : `Enter the code sent to ${email} and choose a new password.`
      }
    >
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@ashworthclub.com"
          />
          <div className="mt-2">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Send code
            </PrimaryButton>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <FormField
            id="otp"
            label="One-time code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
          />
          <FormField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
          <FormField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
          <div className="mt-2">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              Reset password
            </PrimaryButton>
          </div>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="text-xs font-medium text-[#A6844F] hover:text-[#8A6D3D] transition self-start"
          >
            Use a different email
          </button>
        </form>
      )}

      <Link
        href="/admin/login"
        className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-[#78716C] hover:text-[#57534E] transition"
      >
        <ArrowLeft size={13} />
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
