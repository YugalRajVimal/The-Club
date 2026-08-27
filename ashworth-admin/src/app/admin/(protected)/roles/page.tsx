"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminDeleteRole, adminListRoles, adminListSubAdmins } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { SuperAdminOnly } from "@/components/admin/SuperAdminOnly";
import { RoleFormModal } from "@/components/admin/RoleFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Role } from "@/types/admin";

function countPermissions(role: Role) {
  return Object.values(role.permissions).reduce(
    (sum, actions) => sum + Object.values(actions).filter(Boolean).length,
    0
  );
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [subAdminCountByRole, setSubAdminCountByRole] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [modalRole, setModalRole] = useState<Role | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [roleList, subAdmins] = await Promise.all([adminListRoles(), adminListSubAdmins()]);
      setRoles(roleList);
      const counts: Record<string, number> = {};
      for (const sa of subAdmins) {
        if (sa.roleId) counts[sa.roleId.id] = (counts[sa.roleId.id] ?? 0) + 1;
      }
      setSubAdminCountByRole(counts);
    } catch (err) {
      toastApiError(err, "Couldn't load roles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await adminDeleteRole(deleteTarget.id);
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Role deleted");
    } catch (err) {
      toastApiError(err, "Couldn't delete this role.");
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
            <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Roles</h1>
            <p className="mt-1.5 text-sm text-[#78716C]">Define what each sub-admin role can see and do.</p>
          </div>
          <button
            onClick={() => setModalRole("new")}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A227] px-3.5 py-2.5 text-sm font-semibold text-[#221D17] transition hover:bg-[#BB9622]"
          >
            <Plus size={15} />
            Create role
          </button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-[#78716C]">Loading roles…</p>
        ) : roles.length === 0 ? (
          <p className="mt-8 text-sm text-[#A8A29E]">No roles yet.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {roles.map((role) => {
              const inUseCount = subAdminCountByRole[role.id] ?? 0;
              return (
                <div
                  key={role.id}
                  className="rounded-lg border border-[#E5E1D8] bg-white p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-[#221D17]">{role.name}</p>
                    <p className="text-xs text-[#A8A29E] mt-0.5">
                      {countPermissions(role)} permission{countPermissions(role) === 1 ? "" : "s"} enabled ·{" "}
                      {inUseCount} sub-admin{inUseCount === 1 ? "" : "s"} assigned
                    </p>
                  </div>
                  <div className="flex gap-2.5 shrink-0">
                    <button
                      onClick={() => setModalRole(role)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD6C8] px-3 py-1.5 text-xs font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17]"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(role)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#F2CFCF] px-3 py-1.5 text-xs font-medium text-[#B23A3A] transition hover:bg-[#FBEAEA]"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalRole && (
          <RoleFormModal
            role={modalRole === "new" ? undefined : modalRole}
            onClose={() => setModalRole(null)}
            onSaved={(role) => {
              setRoles((prev) =>
                modalRole === "new" ? [role, ...prev] : prev.map((r) => (r.id === role.id ? role : r))
              );
              setModalRole(null);
            }}
          />
        )}

        {deleteTarget && (
          <ConfirmDialog
            title="Delete this role?"
            description={
              (subAdminCountByRole[deleteTarget.id] ?? 0) > 0
                ? `${subAdminCountByRole[deleteTarget.id]} sub-admin${
                    subAdminCountByRole[deleteTarget.id] === 1 ? " is" : "s are"
                  } currently assigned to "${deleteTarget.name}". Deleting it may leave them without valid permissions. This can't be undone.`
                : `This permanently removes the "${deleteTarget.name}" role. This can't be undone.`
            }
            confirmLabel="Delete role"
            danger
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
}
