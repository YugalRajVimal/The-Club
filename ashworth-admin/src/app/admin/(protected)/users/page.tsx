"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminListUsers } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AddUserModal } from "@/components/admin/AddUserModal";
import type { MembershipStatus, User } from "@/types/admin";

const STATUS_OPTIONS: { value: MembershipStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "payment_pending", label: "Payment pending" },
  { value: "documents_pending", label: "Documents pending" },
  { value: "pending_approval", label: "Pending approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminUsersPage() {
  const { hasPermission } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const canView = hasPermission("users", "view");
  const canAdd = hasPermission("users", "add");

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const status = (searchParams.get("status") as MembershipStatus | null) ?? "";
  const search = searchParams.get("search") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, searchParams]
  );

  const fetchUsers = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const data = await adminListUsers({
        status: (status as MembershipStatus) || undefined,
        search: search || undefined,
      });
      setUsers(data);
    } catch (err) {
      toastApiError(err, "Couldn't load users.");
    } finally {
      setIsLoading(false);
    }
  }, [canView, status, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  }

  if (!canView) {
    return (
      <div className="max-w-6xl">
        <div className="rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center flex flex-col items-center gap-2">
          <ShieldAlert size={22} className="text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">You don&apos;t have permission to view members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Membership</p>
          <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Users</h1>
          <p className="mt-1.5 text-sm text-[#78716C]">Browse, filter, and manage club members.</p>
        </div>

        {canAdd && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A227] px-3.5 py-2.5 text-sm font-semibold text-[#221D17] transition hover:bg-[#BB9622]"
          >
            <Plus size={15} />
            Add user
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            className="w-64 rounded-md border border-[#DCD6C8] bg-white pl-8 pr-3 py-2 text-sm text-[#221D17] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
          />
        </form>

        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border border-[#DCD6C8] bg-white px-3 py-2 text-sm text-[#221D17] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E1D8] bg-[#FAF8F4] text-left">
              <th className="px-4 py-3 font-medium text-[#78716C]">Name</th>
              <th className="px-4 py-3 font-medium text-[#78716C]">Email</th>
              <th className="px-4 py-3 font-medium text-[#78716C]">Phone</th>
              <th className="px-4 py-3 font-medium text-[#78716C]">Status</th>
              <th className="px-4 py-3 font-medium text-[#78716C]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#A8A29E]">
                  Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#A8A29E]">
                  No users match these filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  className="border-b border-[#F0EDE5] last:border-0 cursor-pointer transition hover:bg-[#FAF8F4]"
                >
                  <td className="px-4 py-3 font-medium text-[#221D17]">{user.fullName}</td>
                  <td className="px-4 py-3 text-[#57534E]">{user.email}</td>
                  <td className="px-4 py-3 text-[#57534E]">{user.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.membershipStatus} />
                  </td>
                  <td className="px-4 py-3 text-[#78716C]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onCreated={(user) => {
            setIsAddModalOpen(false);
            setUsers((prev) => [user, ...prev]);
          }}
        />
      )}
    </div>
  );
}
