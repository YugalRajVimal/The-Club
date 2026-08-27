"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/Modal";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <p className="text-sm text-[#57534E]">{description}</p>
      <div className="mt-6 flex justify-end gap-2.5">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-[#DCD6C8] px-3.5 py-2 text-sm font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`rounded-md px-3.5 py-2 text-sm font-semibold transition disabled:opacity-60 ${
            danger
              ? "bg-[#C1443F] text-white hover:bg-[#AB3934]"
              : "bg-[#C9A227] text-[#221D17] hover:bg-[#BB9622]"
          }`}
        >
          {isSubmitting ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
