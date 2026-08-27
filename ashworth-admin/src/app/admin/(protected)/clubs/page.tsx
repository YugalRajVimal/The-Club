"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, ShieldAlert, ImageOff } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminDeleteClub, adminListClubs } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { ClubFormModal } from "@/components/admin/ClubFormModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Club } from "@/types/admin";

export default function AdminClubsPage() {
  const { hasPermission } = useAdminAuth();
  const canView = hasPermission("clubs", "view");
  const canAdd = hasPermission("clubs", "add");
  const canUpdate = hasPermission("clubs", "update");
  const canDelete = hasPermission("clubs", "delete");

  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalClub, setModalClub] = useState<Club | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);

  const fetchClubs = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const data = await adminListClubs();
      setClubs(data);
    } catch (err) {
      toastApiError(err, "Couldn't load clubs.");
    } finally {
      setIsLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await adminDeleteClub(deleteTarget.id);
      setClubs((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Club deleted");
    } catch (err) {
      toastApiError(err, "Couldn't delete this club.");
    } finally {
      setDeleteTarget(null);
    }
  }

  if (!canView) {
    return (
      <div className="max-w-6xl">
        <div className="rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center flex flex-col items-center gap-2">
          <ShieldAlert size={22} className="text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">You don&apos;t have permission to view clubs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Membership</p>
          <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Clubs</h1>
          <p className="mt-1.5 text-sm text-[#78716C]">
            Manage club content, fixed membership fees, and signup availability.
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => setModalClub("new")}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A227] px-3.5 py-2.5 text-sm font-semibold text-[#221D17] transition hover:bg-[#BB9622]"
          >
            <Plus size={15} />
            Add club
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-[#78716C]">Loading clubs…</p>
      ) : clubs.length === 0 ? (
        <p className="mt-8 text-sm text-[#A8A29E]">No clubs yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <div key={club.id} className="rounded-lg border border-[#E5E1D8] bg-white overflow-hidden flex flex-col">
              <div className="h-32 bg-[#F4F1EA] flex items-center justify-center overflow-hidden">
                {club.heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.heroImageUrl} alt={club.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={20} className="text-[#DCD6C8]" />
                )}
              </div>

              <div className="p-4 flex flex-col gap-2.5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-base text-[#221D17]">{club.name}</p>
                    <p className="text-xs text-[#78716C]">{club.tagline}</p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      club.membershipOpen
                        ? "bg-[#EAF6EC] text-[#1F7A34] border-[#C9E8CE]"
                        : "bg-[#F4F1EA] text-[#78716C] border-[#E5E1D8]"
                    }`}
                  >
                    {club.membershipOpen ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="font-serif text-xl text-[#221D17] mt-1">
                  {club.membershipFee.currency} {club.membershipFee.amount.toLocaleString()}
                </p>
                <p className="text-xs text-[#A8A29E]">Fixed membership fee</p>

                <div className="mt-auto pt-3 flex gap-2.5">
                  {canUpdate && (
                    <button
                      onClick={() => setModalClub(club)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD6C8] px-3 py-1.5 text-xs font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17]"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(club)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#F2CFCF] px-3 py-1.5 text-xs font-medium text-[#B23A3A] transition hover:bg-[#FBEAEA]"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalClub && (
        <ClubFormModal
          club={modalClub === "new" ? undefined : modalClub}
          onClose={() => setModalClub(null)}
          onSaved={(club) => {
            setClubs((prev) =>
              modalClub === "new" ? [club, ...prev] : prev.map((c) => (c.id === club.id ? club : c))
            );
            setModalClub(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this club?"
          description={`This permanently removes "${deleteTarget.name}" and can't be undone. Members already in this club will be unaffected, but new signups will no longer be possible.`}
          confirmLabel="Delete club"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
