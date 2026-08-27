"use client";

import { ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { ReactNode } from "react";

/**
 * Roles, Sub-Admins, and Settings are super-admin-only for this app — gated on
 * admin.type === "admin" directly rather than a PermissionMap flag, per the
 * explicit instruction for this EPIC. The backend enforces the same
 * super-admin-only check server-side as defense in depth.
 */
export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth();

  if (admin?.type !== "admin") {
    return (
      <div className="max-w-4xl">
        <div className="rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center flex flex-col items-center gap-2">
          <ShieldAlert size={22} className="text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">This section is only available to super admins.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
