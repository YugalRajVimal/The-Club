"use client";

import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { Modal } from "@/components/admin/Modal";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { adminCreateClub, adminUpdateClub, type ClubPayload } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import type { Club } from "@/types/admin";

function toFormState(club?: Club) {
  return {
    name: club?.name ?? "",
    tagline: club?.tagline ?? "",
    heroImageUrl: club?.heroImageUrl ?? "",
    whoWeAre: club?.whoWeAre ?? "",
    whatIsUnique: club?.whatIsUnique ?? "",
    whoShouldJoin: club?.whoShouldJoin ?? "",
    howYouBenefit: club?.howYouBenefit ?? "",
    purpose: club?.whatWeOffer.purpose ?? "",
    features: club?.whatWeOffer.features.join("\n") ?? "",
    benefits: club?.whatWeOffer.benefits.join("\n") ?? "",
    feeAmount: club ? String(club.membershipFee.amount) : "",
    membershipOpen: club?.membershipOpen ?? true,
  };
}

export function ClubFormModal({
  club,
  onClose,
  onSaved,
}: {
  club?: Club;
  onClose: () => void;
  onSaved: (club: Club) => void;
}) {
  const isEditing = Boolean(club);
  const [form, setForm] = useState(toFormState(club));
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ReturnType<typeof toFormState>>(
    key: K,
    value: ReturnType<typeof toFormState>[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: ClubPayload = {
      name: form.name,
      tagline: form.tagline,
      heroImageUrl: form.heroImageUrl,
      whoWeAre: form.whoWeAre,
      whatIsUnique: form.whatIsUnique,
      whoShouldJoin: form.whoShouldJoin,
      howYouBenefit: form.howYouBenefit,
      whatWeOffer: {
        purpose: form.purpose,
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
        benefits: form.benefits.split("\n").map((b) => b.trim()).filter(Boolean),
      },
      membershipFee: {
        amount: Number(form.feeAmount),
        currency: "INR",
      },
      membershipOpen: form.membershipOpen,
    };

    try {
      const saved = isEditing ? await adminUpdateClub(club!.id, payload) : await adminCreateClub(payload);
      toast.success(isEditing ? "Club updated" : "Club created");
      onSaved(saved);
    } catch (err) {
      toastApiError(err, isEditing ? "Couldn't update the club." : "Couldn't create the club.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={isEditing ? `Edit ${club?.name}` : "Add club"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="name"
            label="Name"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <FormField
            id="tagline"
            label="Tagline"
            required
            value={form.tagline}
            onChange={(e) => update("tagline", e.target.value)}
          />
        </div>

        <FormField
          id="heroImageUrl"
          label="Hero image URL"
          type="url"
          required
          value={form.heroImageUrl}
          onChange={(e) => update("heroImageUrl", e.target.value)}
          placeholder="https://…"
        />
        <p className="-mt-3 text-xs text-[#A8A29E]">
          Direct URL for now — a dedicated image upload endpoint isn&apos;t in the API contract yet.
        </p>

        <TextArea
          id="whoWeAre"
          label="Who we are"
          value={form.whoWeAre}
          onChange={(v) => update("whoWeAre", v)}
        />
        <TextArea
          id="whatIsUnique"
          label="What is unique"
          value={form.whatIsUnique}
          onChange={(v) => update("whatIsUnique", v)}
        />
        <TextArea
          id="whoShouldJoin"
          label="Who should join"
          value={form.whoShouldJoin}
          onChange={(v) => update("whoShouldJoin", v)}
        />
        <TextArea
          id="howYouBenefit"
          label="How you benefit"
          value={form.howYouBenefit}
          onChange={(v) => update("howYouBenefit", v)}
        />

        <div className="rounded-md border border-[#E5E1D8] p-4 flex flex-col gap-4">
          <p className="text-xs font-medium text-[#57534E]">What we offer</p>
          <TextArea
            id="purpose"
            label="Purpose"
            value={form.purpose}
            onChange={(v) => update("purpose", v)}
            rows={2}
          />
          <TextArea
            id="features"
            label="Features (one per line)"
            value={form.features}
            onChange={(v) => update("features", v)}
            rows={3}
          />
          <TextArea
            id="benefits"
            label="Benefits (one per line)"
            value={form.benefits}
            onChange={(v) => update("benefits", v)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <FormField
            id="feeAmount"
            label="Membership fee (INR)"
            type="number"
            min={0}
            required
            value={form.feeAmount}
            onChange={(e) => update("feeAmount", e.target.value)}
          />
          <label className="flex items-center gap-2.5 pb-2.5">
            <input
              type="checkbox"
              checked={form.membershipOpen}
              onChange={(e) => update("membershipOpen", e.target.checked)}
              className="w-4 h-4 rounded border-[#DCD6C8] text-[#C9A227] focus:ring-[#C9A227]/40"
            />
            <span className="text-sm text-[#57534E]">Membership open for signups</span>
          </label>
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
              {isEditing ? "Save changes" : "Create club"}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#57534E]">
        {label}
      </label>
      <textarea
        id={id}
        required
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#DCD6C8] bg-white px-3.5 py-2.5 text-sm text-[#221D17] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
      />
    </div>
  );
}
