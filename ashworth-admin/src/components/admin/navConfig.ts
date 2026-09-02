import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, Users2, Building2, CreditCard, ShieldCheck, Settings, FileText } from "lucide-react";
import type { PermissionAction, PermissionPage } from "@/types/admin";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Omit for items visible to any signed-in admin (e.g. the dashboard home).
  permission?: { page: PermissionPage; action: PermissionAction };
  // True if this item should only ever show for super admins (type === "admin"),
  // regardless of any permission map.
  superAdminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users, permission: { page: "users", action: "view" } },
  { label: "Registrations", href: "/admin/registrations", icon: FileText, permission: { page: "registrations", action: "view" } },
  { label: "Clubs", href: "/admin/clubs", icon: Building2, permission: { page: "clubs", action: "view" } },
  { label: "Payments", href: "/admin/payments", icon: CreditCard, permission: { page: "payments", action: "view" } },
  // Roles, Sub-Admins, and Settings are all super-admin-only for this app, regardless of
  // any permission a role might otherwise carry — hidden entirely for sub_admin accounts.
  { label: "Roles", href: "/admin/roles", icon: ShieldCheck, superAdminOnly: true },
  { label: "Sub-Admins", href: "/admin/subadmins", icon: Users2, superAdminOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, superAdminOnly: true },
];
