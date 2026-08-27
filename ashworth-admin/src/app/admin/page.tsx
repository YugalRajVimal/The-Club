"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminIndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(isAuthenticated ? "/admin/dashboard" : "/admin/login");
  }, [isLoading, isAuthenticated, router]);

  return null;
}
