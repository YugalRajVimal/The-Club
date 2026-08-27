"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminDeleteSubAdmin, adminListSubAdmins } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { SuperAdminOnly } from "@/components/admin/SuperAdminOnly";
import { SubAdminFormModal } from "@/components/admin/SubAdminFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { AdminAccount } from "@/types/admin";

export default function AdminSubAdminsPage() {
  const { admin: currentAdmin } = useAdminAuth();

  const [subAdmins, setSubAdmins] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<AdminAccount | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);

  const fetchSubAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminListSubAdmins();
      setSubAdmins(data);
    } catch (err) {
      toastApiError(err, "Couldn't load sub-admins.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubAdmins();
  }, [fetchSubAdmins]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await adminDeleteSubAdmin(deleteTarget.id);
      setSubAdmins((prev) => prev.filter((sa) => sa.id !== deleteTarget.id));
      toast.success("Sub-admin removed");
    } catch (err) {
      toastApiError(err, "Couldn't remove this sub-admin.");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <SuperAdminOnly>
      <div className="max-w-4xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Access control</p>
            <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Sub-admins</h1>
            <p className="mt-1.5 text-sm text-[#78716C]">Manage staff accounts and their assigned roles.</p>
          </div>
          <button
            onClick={() => setModalTarget("new")}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A227] px-3.5 py-2.5 text-sm font-semibold text-[#221D17] transition hover:bg-[#BB9622]"
          >
            <Plus size={15} />
            Add sub-admin
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E1D8] bg-[#FAF8F4] text-left">
                <th className="px-4 py-3 font-medium text-[#78716C]">Name</th>
                <th className="px-4 py-3 font-medium text-[#78716C]">Email</th>
                <th className="px-4 py-3 font-medium text-[#78716C]">Role</th>
                <th className="px-4 py-3 font-medium text-[#78716C]"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#A8A29E]">
                    Loading sub-admins…
                  </td>
                </tr>
              ) : subAdmins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#A8A29E]">
                    No sub-admins yet.
                  </td>
                </tr>
              ) : (
                subAdmins.map((sa) => (
                  <tr key={sa.id} className="border-b border-[#F0EDE5] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#221D17]">
                      {sa.name}
                      {currentAdmin?.id === sa.id && (
                        <span className="ml-1.5 text-xs text-[#A8A29E]">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#57534E]">{sa.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-[#E5E1D8] bg-[#FAF8F4] px-2.5 py-0.5 text-xs font-medium text-[#57534E]">
                        {sa.roleId?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => setModalTarget(sa)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD6C8] px-3 py-1.5 text-xs font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17]"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sa)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#F2CFCF] px-3 py-1.5 text-xs font-medium text-[#B23A3A] transition hover:bg-[#FBEAEA]"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {modalTarget && (
          <SubAdminFormModal
            subAdmin={modalTarget === "new" ? undefined : modalTarget}
            onClose={() => setModalTarget(null)}
            onSaved={(sa) => {
              setSubAdmins((prev) =>
                modalTarget === "new" ? [sa, ...prev] : prev.map((s) => (s.id === sa.id ? sa : s))
              );
              setModalTarget(null);
            }}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Remove this sub-admin?"
            description={`This permanently removes ${deleteTarget.name}'s access to the admin console. This can't be undone.`}
            confirmLabel="Remove access"
            danger
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
}
