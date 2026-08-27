"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminListPayments, ApiRequestError } from "@/lib/api/adminClient";
import { toastApiError } from "@/lib/toastApiError";
import type { Receipt } from "@/types/admin";

export default function AdminPaymentsPage() {
  const { hasPermission } = useAdminAuth();
  const canView = hasPermission("payments", "view");

  const [payments, setPayments] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [endpointMissing, setEndpointMissing] = useState(false);

  const fetchPayments = useCallback(async () => {
    if (!canView) return;
    setIsLoading(true);
    setEndpointMissing(false);
    try {
      const data = await adminListPayments({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setPayments(data);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "NOT_FOUND") {
        setEndpointMissing(true);
      } else {
        toastApiError(err, "Couldn't load payments.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [canView, dateFrom, dateTo]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (!canView) {
    return (
      <div className="max-w-6xl">
        <div className="rounded-lg border border-dashed border-[#DCD6C8] bg-white/60 p-8 text-center flex flex-col items-center gap-2">
          <ShieldAlert size={22} className="text-[#A8A29E]" />
          <p className="text-sm text-[#78716C]">You don&apos;t have permission to view payments.</p>
        </div>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-6xl">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">Membership</p>
        <h1 className="mt-1 font-serif text-2xl text-[#221D17]">Payments</h1>
        <p className="mt-1.5 text-sm text-[#78716C]">All completed membership payments across clubs.</p>
      </div>

      {endpointMissing && (
        <div className="mt-6 rounded-lg border border-[#F2DDB3] bg-[#FDF3E4] p-4 flex gap-3">
          <AlertTriangle size={18} className="text-[#92650F] shrink-0 mt-0.5" />
          <div className="text-sm text-[#7A5A1B]">
            <p className="font-medium">This page needs a small API contract addition.</p>
            <p className="mt-1">
              The contract only defines <code className="text-xs">GET /admin/users/:id/payments</code> (per
              member). This screen calls{" "}
              <code className="text-xs">
                GET /admin/payments ?clubId=&amp;dateFrom=&amp;dateTo=
              </code>{" "}
              — same [ADMIN AUTH: permission=&quot;payments.view&quot;] gating, returning{" "}
              <code className="text-xs">Receipt[]</code> across all users (Receipt already carries
              memberName/clubName). Once the backend adds this route, this page will work as-is.
            </p>
          </div>
        </div>
      )}

      {!endpointMissing && (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dateFrom" className="text-xs font-medium text-[#57534E]">
                From
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-md border border-[#DCD6C8] bg-white px-3 py-2 text-sm text-[#221D17] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dateTo" className="text-xs font-medium text-[#57534E]">
                To
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-md border border-[#DCD6C8] bg-white px-3 py-2 text-sm text-[#221D17] outline-none transition focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/25"
              />
            </div>

            <div className="ml-auto rounded-lg border border-[#E5E1D8] bg-white px-5 py-2.5">
              <p className="text-xs text-[#78716C]">Total (filtered)</p>
              <p className="font-serif text-lg text-[#221D17]">₹{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E1D8] bg-[#FAF8F4] text-left">
                  <th className="px-4 py-3 font-medium text-[#78716C]">Receipt</th>
                  <th className="px-4 py-3 font-medium text-[#78716C]">Member</th>
                  <th className="px-4 py-3 font-medium text-[#78716C]">Club</th>
                  <th className="px-4 py-3 font-medium text-[#78716C]">Date</th>
                  <th className="px-4 py-3 font-medium text-[#78716C] text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#A8A29E]">
                      Loading payments…
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#A8A29E]">
                      No payments in this range.
                    </td>
                  </tr>
                ) : (
                  payments.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-[#F0EDE5] last:border-0">
                      <td className="px-4 py-3 font-medium text-[#221D17]">{receipt.receiptNumber}</td>
                      <td className="px-4 py-3 text-[#57534E]">{receipt.memberName}</td>
                      <td className="px-4 py-3 text-[#57534E]">{receipt.clubName}</td>
                      <td className="px-4 py-3 text-[#78716C]">
                        {new Date(receipt.paidAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#221D17]">
                        {receipt.currency} {receipt.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
