import type { MembershipStatus } from "@/types/admin";

const STATUS_STYLES: Record<MembershipStatus, string> = {
  payment_pending: "bg-[#FDF3E4] text-[#92650F] border-[#F2DDB3]",
  documents_pending: "bg-[#EDF1FB] text-[#3956A6] border-[#D4DDF5]",
  pending_approval: "bg-[#FBF0E0] text-[#A6640F] border-[#F2DAB0]",
  approved: "bg-[#EAF6EC] text-[#1F7A34] border-[#C9E8CE]",
  rejected: "bg-[#FBEAEA] text-[#B23A3A] border-[#F2CFCF]",
};

const STATUS_LABELS: Record<MembershipStatus, string> = {
  payment_pending: "Payment pending",
  documents_pending: "Documents pending",
  pending_approval: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: MembershipStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
