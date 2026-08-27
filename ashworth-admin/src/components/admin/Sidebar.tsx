"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { navItems } from "@/components/admin/navConfig";

export function Sidebar() {
  const pathname = usePathname();
  const { admin, hasPermission } = useAdminAuth();

  const visibleItems = navItems.filter((item) => {
    if (item.superAdminOnly) return admin?.type === "admin";
    if (!item.permission) return true;
    return hasPermission(item.permission.page, item.permission.action);
  });

  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col bg-[#1F1B16] text-[#F4F1EA] h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10">
        <div className="w-7 h-7 rounded-full border border-[#C9A227] flex items-center justify-center shrink-0">
          <span className="font-serif text-[#C9A227] text-xs">A</span>
        </div>
        <div className="min-w-0">
          <p className="font-serif text-sm leading-tight truncate">Ashworth Club</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#C9A227]/60 leading-tight">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-[#C9A227]/15 text-[#F4F1EA] font-medium"
                  : "text-[#C9B8A0] hover:bg-white/5 hover:text-[#F4F1EA]"
              }`}
            >
              <Icon size={17} className={isActive ? "text-[#C9A227]" : "text-[#8A8072] group-hover:text-[#C9A227]"} />
              {item.label}
              {isActive && <span className="ml-auto w-1 h-1 rounded-full bg-[#C9A227]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[10px] text-[#6B6357]">Internal tool — authorized staff only</p>
      </div>
    </aside>
  );
}
