"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/components/admin/Modal";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { adminCreateUser, listClubs } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import type { Club, User } from "@/types/admin";

const emptyForm = {
  clubId: "",
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  occupation: "",
  password: "",
};

export function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listClubs()
      .then(setClubs)
      .catch(() => toast.error("Couldn't load the club list"))
      .finally(() => setIsLoadingClubs(false));
  }, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await adminCreateUser(form);
      toast.success(`${user.fullName} was added`);
      onCreated(user);
    } catch (err) {
      toastApiError(err, "Couldn't add the user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Add user" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clubId" className="text-xs font-medium text-[#57534E]">
            Club
          </label>
          <select
            id="clubId"
            required
            disabled={isLoadingClubs}
            value={form.clubId}
            onChange={(e) => update("clubId", e.target.value)}
            className="w-full rounded-md border border-[#DCD6C8] bg-white px-3.5 py-2.5 text-sm text-[#221D17] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25 disabled:bg-[#F5F3EE] disabled:text-[#A8A29E]"
          >
            <option value="" disabled>
              {isLoadingClubs ? "Loading clubs…" : "Select a club"}
            </option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="fullName"
            label="Full name"
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <FormField
            id="phone"
            label="Phone"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <FormField
            id="dob"
            label="Date of birth"
            type="date"
            required
            value={form.dob}
            onChange={(e) => update("dob", e.target.value)}
          />
          <FormField
            id="occupation"
            label="Occupation"
            required
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="Set an initial password"
          />
        </div>

        <FormField
          id="address"
          label="Address"
          required
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
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
              Add user
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}
