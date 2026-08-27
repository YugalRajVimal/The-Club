"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowLeft, Check, FileText, Pencil, ShieldAlert, Trash2, X } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  adminApproveMembership,
  adminDeleteUser,
  adminGetUser,
  adminGetUserPayments,
  adminUpdateUser,
  adminVerifyDocument,
} from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormField, PrimaryButton } from "@/components/admin/FormField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { DocumentRecord, Receipt, UserDetail } from "@/types/admin";

const DOCUMENT_LABELS: Record<string, string> = {
  aadhar_front: "Aadhar — front",
  aadhar_back: "Aadhar — back",
  pan_front: "PAN — front",
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasPermission } = useAdminAuth();

  const canView = hasPermission("users", "view");
  const canUpdate = hasPermission("users", "update");
  const canDelete = hasPermission("users", "delete");
  const canVerifyDocuments = hasPermission("users", "verifyDocuments");
  const canApproveMembership = hasPermission("users", "approveMembership");

  const [user, setUser] = useState<UserDetail | null>(null);
  const [payments, setPayments] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    occupation: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [pendingVerifyDoc, setPendingVerifyDoc] = useState<DocumentRecord | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<"approve" | "reject" | null>(null);
  const [approvalNote, setApprovalNote] = useState("");

  const loadUser = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    try {
      const data = await adminGetUser(id);
      setUser(data);
      setEditForm({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        occupation: data.occupation,
      });
      if (hasPermission("users", "view")) {
        try {
          const receipts = await adminGetUserPayments(id);
          setPayments(receipts);
        } catch (err) {
          toastApiError(err, "Couldn't load payment history.");
        }
      }
    } catch (err) {
      toastApiError(err, "Couldn't load this member.");
    } finally {
      setIsLoading(false);
    }
  }, [id, canView, hasPermission]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const updated = await adminUpdateUser(id, editForm);
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success("Member details updated");
      setIsEditing(false);
    } catch (err) {
      toastApiError(err, "Couldn't save changes.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDelete() {
    try {
      await adminDeleteUser(id);
      toast.success("User deleted");
      router.replace("/admin/users");
    } catch (err) {
      toastApiError(err, "Couldn't delete this user.");
      setIsDeleteOpen(false);
    }
  }

  async function handleVerifyDocument(doc: DocumentRecord, verified: boolean) {
    try {
      const updated = await adminVerifyDocument(id, doc.id, verified);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents?.map((d) => (d.id === updated.id ? updated : d)),
            }
          : prev
      );
      toast.success(verified ? "Document verified" : "Document marked unverified");
    } catch (err) {
      toastApiError(err, "Couldn't update the document.");
    } finally {
      setPendingVerifyDoc(null);
    }
  }

  async function handleApproval(approve: boolean) {
    setIsSubmittingApproval(approve ? "approve" : "reject");
    try {
      const { membershipStatus } = await adminApproveMembership(id, approve, approvalNote || undefined);
      setUser((prev) => (prev ? { ...prev, membershipStatus } : prev));
      toast.success(approve ? "Membership approved" : "Membership rejected");
      setApprovalNote("");
    } catch (err) {
      toastApiError(err, "Couldn't update the membership status.");
    } finally {
      setIsSubmittingApproval(null);
    }
  }

  if (!canView) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center flex flex-col items-center gap-2">
          <ShieldAlert size={22} className="text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">You don&apos;t have permission to view members.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-[#78716C]">Loading member…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-[#78716C]">This member couldn&apos;t be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => router.push("/admin/users")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#78716C] hover:text-[#57534E] transition"
      >
        <ArrowLeft size={13} />
        Back to users
      </button>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl text-[#221D17]">{user.fullName}</h1>
          <div className="mt-2 flex items-center gap-2.5">
            <StatusBadge status={user.membershipStatus} />
            <span className="text-xs text-[#A8A29E]">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#F2CFCF] px-3 py-2 text-xs font-medium text-[#B23A3A] transition hover:bg-[#FBEAEA]"
          >
            <Trash2 size={13} />
            Delete user
          </button>
        )}
      </div>

      {/* Membership approval */}
      {canApproveMembership && (
        <section className="mt-6 rounded-lg border border-[#E5E1D8] bg-white p-5">
          <h2 className="font-serif text-base text-[#221D17]">Membership approval</h2>
          {user.membershipStatus === "pending_approval" ? (
            <div className="mt-3 flex flex-col gap-3">
              <p className="text-sm text-[#78716C]">
                This member is awaiting a decision. Approve to activate their membership, or reject with an
                optional note.
              </p>
              <textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Optional note"
                rows={2}
                className="w-full rounded-md border border-[#DCD6C8] bg-white px-3.5 py-2.5 text-sm text-[#221D17] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
              />
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleApproval(true)}
                  disabled={isSubmittingApproval !== null}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1F7A34] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#186228] disabled:opacity-60"
                >
                  <Check size={14} />
                  {isSubmittingApproval === "approve" ? "Approving…" : "Approve"}
                </button>
                <button
                  onClick={() => handleApproval(false)}
                  disabled={isSubmittingApproval !== null}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#F2CFCF] px-3.5 py-2 text-sm font-semibold text-[#B23A3A] transition hover:bg-[#FBEAEA] disabled:opacity-60"
                >
                  <X size={14} />
                  {isSubmittingApproval === "reject" ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#78716C]">
              No action needed right now — current status is{" "}
              <span className="font-medium text-[#57534E]">{user.membershipStatus.replace(/_/g, " ")}</span>.
              Approve/reject becomes available once this member reaches{" "}
              <span className="font-medium text-[#57534E]">pending approval</span>.
            </p>
          )}
        </section>
      )}

      {/* Personal details */}
      <section className="mt-6 rounded-lg border border-[#E5E1D8] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base text-[#221D17]">Personal details</h2>
          {canUpdate && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A6844F] hover:text-[#8A6D3D] transition"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="mt-4 grid grid-cols-2 gap-4">
            <FormField
              id="fullName"
              label="Full name"
              required
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
            />
            <FormField
              id="phone"
              label="Phone"
              required
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
            <FormField
              id="occupation"
              label="Occupation"
              required
              value={editForm.occupation}
              onChange={(e) => setEditForm((prev) => ({ ...prev, occupation: e.target.value }))}
            />
            <FormField
              id="address"
              label="Address"
              required
              value={editForm.address}
              onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
            />
            <div className="col-span-2 flex justify-end gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    fullName: user.fullName,
                    phone: user.phone,
                    address: user.address,
                    occupation: user.occupation,
                  });
                }}
                disabled={isSavingEdit}
                className="rounded-md border border-[#DCD6C8] px-3.5 py-2 text-sm font-medium text-[#57534E] transition hover:border-[#C9A227] hover:text-[#221D17] disabled:opacity-60"
              >
                Cancel
              </button>
              <div className="w-32">
                <PrimaryButton type="submit" isLoading={isSavingEdit}>
                  Save
                </PrimaryButton>
              </div>
            </div>
          </form>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-y-3.5 gap-x-4 text-sm">
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone} />
            <Detail label="Date of birth" value={new Date(user.dob).toLocaleDateString()} />
            <Detail label="Occupation" value={user.occupation} />
            <Detail label="Address" value={user.address} span />
            <Detail label="Club" value={user.club?.name ?? user.clubId} />
          </dl>
        )}
      </section>

      {/* Documents */}
      <section className="mt-6 rounded-lg border border-[#E5E1D8] bg-white p-5">
        <h2 className="font-serif text-base text-[#221D17]">Documents</h2>
        {!user.documents || user.documents.length === 0 ? (
          <p className="mt-3 text-sm text-[#A8A29E]">No documents uploaded yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {user.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-md border border-[#E5E1D8] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-[#F4F1EA] flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-[#A6844F]" />
                  </div>
                  <div className="min-w-0">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#221D17] hover:text-[#A6844F] transition truncate block"
                    >
                      {DOCUMENT_LABELS[doc.documentType] ?? doc.documentType}
                    </a>
                    <p className="text-xs text-[#A8A29E]">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-medium ${doc.verified ? "text-[#1F7A34]" : "text-[#A8A29E]"}`}
                  >
                    {doc.verified ? "Verified" : "Not verified"}
                  </span>
                  {canVerifyDocuments && (
                    <button
                      onClick={() => setPendingVerifyDoc(doc)}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                        doc.verified
                          ? "border-[#DCD6C8] text-[#57534E] hover:border-[#C9A227] hover:text-[#221D17]"
                          : "border-[#C9A227] text-[#A6844F] hover:bg-[#FBF0E0]"
                      }`}
                    >
                      {doc.verified ? "Unverify" : "Verify"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment history */}
      <section className="mt-6 mb-6 rounded-lg border border-[#E5E1D8] bg-white p-5">
        <h2 className="font-serif text-base text-[#221D17]">Payment history</h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-sm text-[#A8A29E]">No payments recorded yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {payments.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between rounded-md border border-[#E5E1D8] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#221D17]">{receipt.receiptNumber}</p>
                  <p className="text-xs text-[#A8A29E]">{new Date(receipt.paidAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-medium text-[#221D17]">
                  {receipt.currency} {receipt.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {pendingVerifyDoc && (
        <ConfirmDialog
          title={pendingVerifyDoc.verified ? "Mark as unverified?" : "Verify document?"}
          description={
            pendingVerifyDoc.verified
              ? "This will mark the document as not verified."
              : "This will mark the document as verified by you."
          }
          confirmLabel={pendingVerifyDoc.verified ? "Mark unverified" : "Verify"}
          onConfirm={() => handleVerifyDocument(pendingVerifyDoc, !pendingVerifyDoc.verified)}
          onCancel={() => setPendingVerifyDoc(null)}
        />
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          title="Delete this user?"
          description={`This permanently removes ${user.fullName}'s account. This can't be undone.`}
          confirmLabel="Delete user"
          danger
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}
    </div>
  );
}

function Detail({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <dt className="text-xs text-[#A8A29E]">{label}</dt>
      <dd className="mt-0.5 text-[#221D17]">{value}</dd>
    </div>
  );
}
