"use client";

import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/components/admin/Modal";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { EMPTY_PERMISSIONS, PermissionGrid } from "@/components/admin/PermissionGrid";
import { adminCreateRole, adminUpdateRole } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import type { Role } from "@/types/admin";

export function RoleFormModal({
  role,
  onClose,
  onSaved,
}: {
  role?: Role;
  onClose: () => void;
  onSaved: (role: Role) => void;
}) {
  const isEditing = Boolean(role);
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState(role?.permissions ?? EMPTY_PERMISSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saved = isEditing
        ? await adminUpdateRole(role!.id, { name, permissions })
        : await adminCreateRole(name, permissions);
      toast.success(isEditing ? "Role updated" : "Role created");
      onSaved(saved);
    } catch (err) {
      toastApiError(err, isEditing ? "Couldn't update the role." : "Couldn't create the role.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? `Edit ${role?.name}` : "Create role"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField id="name" label="Role name" required value={name} onChange={(e) => setName(e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#57534E]">Permissions</label>
          <PermissionGrid value={permissions} onChange={setPermissions} />
        </div>

        <div className="mt-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-[#DCD6C8] px-3.5 py-2 text-sm font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17] disabled:opacity-60"
          >
            Cancel
          </button>
          <div className="w-36">
            <PrimaryButton type="submit" isLoading={isSubmitting}>
              {isEditing ? "Save changes" : "Create role"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
