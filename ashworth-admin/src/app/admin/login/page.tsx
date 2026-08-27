"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AuthLayout } from "@/components/admin/AuthLayout";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { adminLogin, ApiRequestError } from "@/lib/api/adminClient";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { admin, token } = await adminLogin(email.trim(), password);
      login(token, admin);
      toast.success(`Welcome back, ${admin.name.split(" ")[0]}`);
      router.replace("/admin/dashboard");
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : "Couldn't sign in. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Admin Console"
      title="Sign in"
      subtitle="Enter your administrator credentials to continue."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <div className="flex justify-end -mt-1">
          <Link
            href="/admin/forgot-password"
            className="text-xs font-medium text-[#A6844F] hover:text-[#8A6D3D] transition"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-2">
          <PrimaryButton type="submit" isLoading={isSubmitting}>
            Sign in
          </PrimaryButton>
        </div>
      </form>
    </AuthLayout>
  );
}
