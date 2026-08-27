"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Clock, Wallet, Building2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminListClubs, adminListPayments, adminListUsers, ApiRequestError } from "@/lib/api/adminClient";
import type { LucideIcon } from "lucide-react";

interface SummaryCard {
  label: string;
  value: string;
  icon: LucideIcon;
  hint: string;
  visible: boolean;
}

export default function AdminDashboardPage() {
  const { admin, hasPermission } = useAdminAuth();

  const canViewUsers = hasPermission("users", "view");
  const canViewApprovals = hasPermission("users", "verifyDocuments") || hasPermission("users", "approveMembership");
  const canViewPayments = hasPermission("payments", "view");
  const canViewClubs = hasPermission("clubs", "view");

  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [activeClubs, setActiveClubs] = useState<number | null>(null);
  // The payments list endpoint (GET /admin/payments) isn't in the API contract yet —
  // see the note in adminClient.ts / the Payments page. Revenue falls back to "—" until it exists.
  const [paymentsEndpointMissing, setPaymentsEndpointMissing] = useState(false);

  useEffect(() => {
    if (canViewUsers || canViewApprovals) {
      adminListUsers()
        .then((users) => {
          if (canViewUsers) setTotalMembers(users.length);
          if (canViewApprovals) {
            setPendingApprovals(users.filter((u) => u.membershipStatus === "pending_approval").length);
          }
        })
        .catch(() => {
          if (canViewUsers) setTotalMembers(null);
          if (canViewApprovals) setPendingApprovals(null);
        });
    }
  }, [canViewUsers, canViewApprovals]);

  useEffect(() => {
    if (!canViewClubs) return;
    adminListClubs()
      .then((clubs) => setActiveClubs(clubs.filter((c) => c.membershipOpen).length))
      .catch(() => setActiveClubs(null));
  }, [canViewClubs]);

  useEffect(() => {
    if (!canViewPayments) return;
    adminListPayments()
      .then((payments) => setTotalRevenue(payments.reduce((sum, p) => sum + p.amount, 0)))
      .catch((err) => {
        if (err instanceof ApiRequestError && err.code === "NOT_FOUND") {
          setPaymentsEndpointMissing(true);
        }
        setTotalRevenue(null);
      });
  }, [canViewPayments]);

  const cards: SummaryCard[] = useMemo(
    () => [
      {
        label: "Total members",
        value: totalMembers === null ? "—" : totalMembers.toLocaleString(),
        icon: Users,
        hint: "Across all clubs",
        visible: canViewUsers,
      },
      {
        label: "Pending approvals",
        value: pendingApprovals === null ? "—" : pendingApprovals.toLocaleString(),
        icon: Clock,
        hint: "Awaiting document review",
        visible: canViewApprovals,
      },
      {
        label: "Total revenue",
        value: totalRevenue === null ? "—" : `₹${totalRevenue.toLocaleString()}`,
        icon: Wallet,
        hint: paymentsEndpointMissing ? "GET /admin/payments not yet available" : "From completed payments",
        visible: canViewPayments,
      },
      {
        label: "Active clubs",
        value: activeClubs === null ? "—" : activeClubs.toLocaleString(),
        icon: Building2,
        hint: "Currently accepting members",
        visible: canViewClubs,
      },
    ],
    [
      totalMembers,
      pendingApprovals,
      totalRevenue,
      activeClubs,
      paymentsEndpointMissing,
      canViewUsers,
      canViewApprovals,
      canViewPayments,
      canViewClubs,
    ]
  );

  const visibleCards = cards.filter((c) => c.visible);

  return (
    <div className="max-w-6xl">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Overview</p>
        <h1 className="mt-1 font-serif text-2xl text-[#221D17]">
          Welcome back{admin ? `, ${admin.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-[#78716C]">A snapshot of membership activity.</p>
      </div>

      {visibleCards.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-lg border border-[#E5E1D8] bg-white p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#78716C]">{card.label}</span>
                  <div className="w-8 h-8 rounded-md bg-[#F4F1EA] flex items-center justify-center">
                    <Icon size={15} className="text-[#A6844F]" />
                  </div>
                </div>
                <p className="font-serif text-3xl text-[#221D17]">{card.value}</p>
                <p className="text-xs text-[#A8A29E]">{card.hint}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-7 rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center">
          <p className="text-sm text-[#78716C]">
            Your role doesn&apos;t have view access to any summary data yet. Ask a super admin to grant a
            permission if you need one.
          </p>
        </div>
      )}
    </div>
  );
}
