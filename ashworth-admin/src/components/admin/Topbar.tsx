"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LogOut } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function Topbar() {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out");
      router.replace("/admin/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const initials = admin?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 shrink-0 border-b border-[#E5E1D8] bg-white/80 backdrop-blur px-5 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-sm font-medium text-[#221D17]">{admin?.name}</p>
        <p className="text-xs text-[#78716C]">
          {admin?.email} · {admin?.type === "admin" ? "Super Admin" : admin?.roleId?.name ?? "Sub-Admin"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#F4F1EA] border border-[#DCD6C8] flex items-center justify-center text-xs font-semibold text-[#A6844F]">
          {initials}
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD6C8] px-3 py-1.5 text-xs font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17] disabled:opacity-60"
        >
          <LogOut size={13} />
          {isLoggingOut ? "Signing out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}
