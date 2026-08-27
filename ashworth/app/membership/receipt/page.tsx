'use client';

import { useCallback, useEffect, useState } from 'react';
import { ScrollText, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import HairlineDivider from '@/components/ui/HairlineDivider';
import Monogram from '@/components/ui/Monogram';
import LoadingState, { ErrorState } from '@/components/ui/LoadingState';
import { ApiClientError, downloadReceiptPdf, getReceipt } from '@/lib/api/client';
import type { Receipt } from '@/lib/api/types';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function ReceiptView() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const loadReceipt = useCallback(async () => {
    setError(null);
    try {
      const res = await getReceipt();
      setReceipt(res);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not load your receipt. Please try again.';
      setError(message);
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    loadReceipt();
  }, [loadReceipt]);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const blob = await downloadReceiptPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${receipt?.receiptNumber || 'ashworth-receipt'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded.');
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not download your receipt. Please try again.';
      toast.error(message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="bg-white min-h-[80vh]">
      <div className="max-w-lg mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-10 flex flex-col items-center">
          <Monogram size={48} animated={false} />
          <p className="eyebrow mt-6">Membership &middot; Receipt</p>
          <h1 className="font-serif text-3xl text-ink mt-3">
            Your Membership Receipt
          </h1>
          <HairlineDivider width="56px" className="mt-6" />
        </div>

        {!receipt && !error && <LoadingState message="Loading your receipt…" />}

        {error && !receipt && <ErrorState message={error} onRetry={loadReceipt} />}

        {receipt && (
          <div className="border border-gold-light/50 bg-beige px-8 py-10">
            <div className="flex items-center justify-center gap-3 mb-8 text-gold-dark">
              <ScrollText size={22} strokeWidth={1.25} />
              <span className="font-serif text-lg text-ink">
                Receipt {receipt.receiptNumber}
              </span>
            </div>

            <dl className="divide-y divide-gold-light/40">
              <div className="flex items-center justify-between py-3">
                <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
                  Member
                </dt>
                <dd className="font-sans text-sm text-ink">{receipt.memberName}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
                  Club
                </dt>
                <dd className="font-sans text-sm text-ink">{receipt.clubName}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
                  Amount Paid
                </dt>
                <dd className="font-serif text-base text-ink">
                  {receipt.currency} {receipt.amount.toLocaleString('en-IN')}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
                  Paid On
                </dt>
                <dd className="font-sans text-sm text-ink">
                  {formatDate(receipt.paidAt)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="mt-8 w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} strokeWidth={1.5} />
              {isDownloading ? 'Preparing Download…' : 'Download Receipt'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReceiptPage() {
  return (
    <AuthGuard>
      <ReceiptView />
    </AuthGuard>
  );
}
