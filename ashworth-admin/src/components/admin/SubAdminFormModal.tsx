"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/components/admin/Modal";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { adminCreateSubAdmin, adminListRoles, adminUpdateSubAdmin, ApiRequestError } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import type { AdminAccount, Role } from "@/types/admin";

export function SubAdminFormModal({
  subAdmin,
  onClose,
  onSaved,
}: {
  subAdmin?: AdminAccount;
  onClose: () => void;
  onSaved: (subAdmin: AdminAccount) => void;
}) {
  const isEditing = Boolean(subAdmin);

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  const [name, setName] = useState(subAdmin?.name ?? "");
  const [email, setEmail] = useState(subAdmin?.email ?? "");
  const [roleId, setRoleId] = useState(subAdmin?.roleId?.id ?? "");
  const [password, setPassword] = useState("");
  const [emailConflict, setEmailConflict] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    adminListRoles()
      .then(setRoles)
      .catch(() => toast.error("Couldn't load the role list"))
      .finally(() => setIsLoadingRoles(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailConflict(null);
    setIsSubmitting(true);
    try {
      const saved = isEditing
        ? await adminUpdateSubAdmin(subAdmin!.id, {
            name,
            roleId,
            ...(password ? { password } : {}),
          })
        : await adminCreateSubAdmin({ name, email, password, roleId });
      toast.success(isEditing ? "Sub-admin updated" : "Sub-admin added");
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "CONFLICT") {
        setEmailConflict(err.message || "An admin account with this email already exists.");
      } else {
        toastApiError(err, isEditing ? "Couldn't update the sub-admin." : "Couldn't add the sub-admin.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? `Edit ${subAdmin?.name}` : "Add sub-admin"} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField id="name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <FormField
            id="email"
            label="Email"
            type="email"
            required
            disabled={isEditing}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailConflict(null);
            }}
          />
          {emailConflict && <p className="text-xs text-[#B23A3A]">{emailConflict}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="roleId" className="text-xs font-medium text-[#57534E]">
            Role
          </label>
          <select
            id="roleId"
            required
            disabled={isLoadingRoles}
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded-md border border-[#DCD6C8] bg-white px-3.5 py-2.5 text-sm text-[#221D17] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25 disabled:bg-[#F5F3EE] disabled:text-[#A8A29E]"
          >
            <option value="" disabled>
              {isLoadingRoles ? "Loading roles…" : "Select a role"}
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <FormField
          id="password"
          label={isEditing ? "New password" : "Password"}
          type="password"
          required={!isEditing}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? "Leave blank to keep current password" : undefined}
        />

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
              {isEditing ? "Save changes" : "Add sub-admin"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
