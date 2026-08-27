"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Database, Cloud } from "lucide-react";
import { adminGetSettings, adminUpdateUploadProvider } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { SuperAdminOnly } from "@/components/admin/SuperAdminOnly";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { UploadProvider } from "@/types/admin";

const PROVIDER_META: Record<UploadProvider, { label: string; description: string; icon: typeof Database }> = {
  multer: {
    label: "Local disk (Multer)",
    description: "Files are stored directly on the server's disk.",
    icon: Database,
  },
  cloudinary: {
    label: "Cloudinary",
    description: "Files are stored in Cloudinary's cloud storage.",
    icon: Cloud,
  },
};

export default function AdminSettingsPage() {
  const [provider, setProvider] = useState<UploadProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<UploadProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminGetSettings()
      .then((s) => setProvider(s.uploadProvider))
      .catch((err) => toastApiError(err, "Couldn't load settings."))
      .finally(() => setIsLoading(false));
  }, []);

  async function confirmSwitch() {
    if (!pendingProvider) return;
    setIsSaving(true);
    try {
      const updated = await adminUpdateUploadProvider(pendingProvider);
      setProvider(updated.uploadProvider);
      toast.success(`Upload provider switched to ${PROVIDER_META[updated.uploadProvider].label}`);
    } catch (err) {
      toastApiError(err, "Couldn't switch the upload provider.");
    } finally {
      setIsSaving(false);
      setPendingProvider(null);
    }
  }

  return (
    <SuperAdminOnly>
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Configuration</p>
        <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Settings</h1>
        <p className="mt-1.5 text-sm text-[#78716C]">Controls that affect the whole platform.</p>

        <section className="mt-6 rounded-lg border border-[#E5E1D8] bg-white p-5">
          <h2 className="font-serif text-base text-[#221D17]">Upload storage provider</h2>
          <p className="mt-1.5 text-sm text-[#78716C]">
            Where new document and image uploads are stored. Switching this only affects uploads going
            forward — existing files stay wherever they were originally saved.
          </p>

          {isLoading ? (
            <p className="mt-4 text-sm text-[#A8A29E]">Loading current setting…</p>
          ) : provider ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(Object.keys(PROVIDER_META) as UploadProvider[]).map((key) => {
                const meta = PROVIDER_META[key];
                const Icon = meta.icon;
                const isActive = provider === key;
                return (
                  <button
                    key={key}
                    onClick={() => !isActive && setPendingProvider(key)}
                    disabled={isSaving}
                    className={`text-left rounded-lg border p-4 transition disabled:opacity-60 ${
                      isActive
                        ? "border-[#C9A227] bg-[#FBF0E0]"
                        : "border-[#E5E1D8] hover:border-[#DCD6C8] hover:bg-[#FAF8F4]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={18} className={isActive ? "text-[#A6844F]" : "text-[#A8A29E]"} />
                      {isActive && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#A6844F]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 text-sm font-medium text-[#221D17]">{meta.label}</p>
                    <p className="mt-1 text-xs text-[#78716C]">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#A8A29E]">Couldn&apos;t determine the current provider.</p>
          )}
        </section>

        {pendingProvider && (
          <ConfirmDialog
            title="Switch upload provider?"
            description={`New uploads will be stored using ${PROVIDER_META[pendingProvider].label} from now on. Files already uploaded won't be moved or affected.`}
            confirmLabel="Switch provider"
            onConfirm={confirmSwitch}
            onCancel={() => setPendingProvider(null)}
          />
        )}
      </div>
    </SuperAdminOnly>
  );
}
