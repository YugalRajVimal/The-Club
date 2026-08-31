// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { ScrollText, Download, FileText } from 'lucide-react';
// import { toast } from 'react-toastify';
// import AuthGuard from '@/components/auth/AuthGuard';
// import HairlineDivider from '@/components/ui/HairlineDivider';
// import Monogram from '@/components/ui/Monogram';
// import LoadingState from '@/components/ui/LoadingState';
// import { ApiClientError, downloadReceiptPdf, getReceipt } from '@/lib/api/client';
// import type { Receipt } from '@/lib/api/types';

// function formatDate(iso: string) {
//   try {
//     return new Date(iso).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//     });
//   } catch {
//     return iso;
//   }
// }

// function ReceiptPanel({
//   receipt,
//   handleDownload,
//   isDownloading,
//   handleGoToDocuments,
// }: {
//   receipt: Receipt;
//   handleDownload?: () => void;
//   isDownloading?: boolean;
//   handleGoToDocuments?: () => void;
// }) {
//   return (
//     <div className="bg-gold-light/25 border border-gold-light/25 px-8 py-10">
//       <div className="flex items-center justify-center gap-3 mb-8 text-gold-dark">
//         <ScrollText size={22} strokeWidth={1.25} />
//         <span className="font-serif text-lg text-ink">
//           Receipt {receipt.receiptNumber}
//         </span>
//       </div>

//       <dl className="divide-y divide-gold-light/40">
//         <div className="flex items-center justify-between py-3">
//           <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
//             Member
//           </dt>
//           <dd className="font-sans text-sm text-ink">{receipt.memberName}</dd>
//         </div>
//         <div className="flex items-center justify-between py-3">
//           <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
//             Club
//           </dt>
//           <dd className="font-sans text-sm text-ink">{receipt.clubName}</dd>
//         </div>
//         <div className="flex items-center justify-between py-3">
//           <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
//             Amount Paid
//           </dt>
//           <dd className="font-serif text-base text-ink">
//             {receipt.currency} {receipt.amount.toLocaleString('en-IN')}
//           </dd>
//         </div>
//         <div className="flex items-center justify-between py-3">
//           <dt className="font-sans text-xs tracking-widest2 uppercase text-ink/50">
//             Paid On
//           </dt>
//           <dd className="font-sans text-sm text-ink">
//             {formatDate(receipt.paidAt)}
//           </dd>
//         </div>
//       </dl>

//       <div className="mt-8 flex flex-col gap-3">
//         <button
//           type="button"
//           onClick={handleDownload}
//           disabled={isDownloading}
//           className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           <Download size={16} strokeWidth={1.5} />
//           {isDownloading ? 'Preparing Download…' : 'Download Receipt'}
//         </button>

//         <button
//           type="button"
//           onClick={handleGoToDocuments}
//           className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark bg-white hover:bg-gold hover:text-ivory transition-colors duration-500"
//         >
//           <FileText size={16} strokeWidth={1.5} />
//           Submit Documents
//         </button>
//       </div>
//     </div>
//   );
// }

// function ReceiptView() {
//   const router = useRouter();
//   const [receipt, setReceipt] = useState<Receipt | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isDownloading, setIsDownloading] = useState(false);

//   const loadReceipt = useCallback(async () => {
//     setError(null);
//     try {
//       const res = await getReceipt();
//       setReceipt(res);
//     } catch (err) {
//       const message =
//         err instanceof ApiClientError
//           ? err.message
//           : 'Could not load your receipt. Please try again.';
//       setError(message);
//       toast.error(message);
//     }
//   }, []);

//   useEffect(() => {
//     loadReceipt();
//   }, [loadReceipt]);

//   async function handleDownload() {
//     setIsDownloading(true);
//     try {
//       const blob = await downloadReceiptPdf();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${receipt?.receiptNumber || 'ashworth-receipt'}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success('Receipt downloaded.');
//     } catch (err) {
//       const message =
//         err instanceof ApiClientError
//           ? err.message
//           : 'Could not download your receipt. Please try again.';
//       toast.error(message);
//     } finally {
//       setIsDownloading(false);
//     }
//   }

//   // Navigate to /membership/documents
//   function handleGoToDocuments() {
//     router.push('/membership/documents');
//   }

//   if (error) {
//     return (
//       <main className="bg-beige min-h-[80vh]">
//         <div className="max-w-lg mx-auto px-6 py-24 md:py-28 ">
//           <div className="text-center mb-10 flex flex-col items-center">
//             <Monogram size={48} animated={false} />
//             <p className="eyebrow mt-6">Membership &middot; Receipt</p>
//             <h1 className="font-serif text-3xl text-ink mt-3">
//               Your Membership Receipt
//             </h1>
//             <HairlineDivider width="56px" className="mt-6" />
//           </div>
//           <div className="my-8 text-center">
//             <div className="text-rose-700 bg-red-50 rounded-lg py-4 px-6 mb-6">
//               {error}
//             </div>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="bg-beige min-h-[80vh]">
//       <div className="max-w-lg mx-auto px-6 py-24 md:py-28">
//         <div className="text-center mb-10 flex flex-col items-center">
//           <Monogram size={48} animated={false} />
//           <p className="eyebrow mt-6">Membership &middot; Receipt</p>
//           <h1 className="font-serif text-3xl text-ink mt-3">
//             Your Membership Receipt
//           </h1>
//           <HairlineDivider width="56px" className="mt-6" />
//         </div>

//         {receipt ? (
//           <ReceiptPanel
//             receipt={receipt}
//             handleDownload={handleDownload}
//             isDownloading={isDownloading}
//             handleGoToDocuments={handleGoToDocuments}
//           />
//         ) : (
//           <LoadingState message="Loading your receipt…" />
//         )}
//       </div>
//     </main>
//   );
// }

// export default function ReceiptPage() {
//   return (
//     <AuthGuard>
//       <ReceiptView />
//     </AuthGuard>
//   );
// }


'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScrollText, Download, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import HairlineDivider from '@/components/ui/HairlineDivider';
import Monogram from '@/components/ui/Monogram';
import LoadingState from '@/components/ui/LoadingState';
import { ApiClientError, downloadReceiptPdf, getReceipt } from '@/lib/api/client';
import type { Receipt } from '@/lib/api/types';

// After a Cashfree redirect back to this page, the webhook that actually
// creates the Receipt can lag a few seconds behind. Rather than showing a
// hard "not found" error the instant the first request 404s, we poll a
// few times before giving up and asking the person to check manually.
const MAX_AUTO_ATTEMPTS = 5;
const POLL_INTERVAL_MS = 2000;

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

function ReceiptPanel({
  receipt,
  handleDownload,
  isDownloading,
  handleGoToDocuments,
}: {
  receipt: Receipt;
  handleDownload?: () => void;
  isDownloading?: boolean;
  handleGoToDocuments?: () => void;
}) {
  return (
    <div className="bg-gold-light/25 border border-gold-light/25 px-8 py-10">
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

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} strokeWidth={1.5} />
          {isDownloading ? 'Preparing Download…' : 'Download Receipt'}
        </button>

        <button
          type="button"
          onClick={handleGoToDocuments}
          className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark bg-white hover:bg-gold hover:text-ivory transition-colors duration-500"
        >
          <FileText size={16} strokeWidth={1.5} />
          Submit Documents
        </button>
      </div>
    </div>
  );
}

function PendingConfirmationPanel({
  onRefresh,
  isChecking,
}: {
  onRefresh: () => void;
  isChecking: boolean;
}) {
  return (
    <div className="bg-gold-light/25 border border-gold-light/25 px-8 py-12 text-center">
      <p className="font-sans text-sm text-ink/70 mb-6">
        We're still confirming your payment with our payment partner. This
        sometimes takes a little longer than usual — please check again in a
        moment.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isChecking}
        className="inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={16} strokeWidth={1.5} className={isChecking ? 'animate-spin' : ''} />
        {isChecking ? 'Checking…' : 'Refresh & Check Again'}
      </button>
    </div>
  );
}

function ReceiptView() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [autoAttemptsExhausted, setAutoAttemptsExhausted] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Returns true if a receipt was found, false otherwise. Only sets the
  // hard error banner for a genuine failure (network/server error) — a
  // "not found yet" response is treated as "keep polling", not an error.
  const attemptLoad = useCallback(async (): Promise<boolean> => {
    try {
      const res = await getReceipt();
      setReceipt(res);
      setError(null);
      return true;
    } catch (err) {
      const isNotFoundYet = err instanceof ApiClientError && err.code === 'NOT_FOUND';
      if (isNotFoundYet) return false;

      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not load your receipt. Please try again.';
      setError(message);
      toast.error(message);
      return false;
    }
  }, []);

  // Auto-poll on mount: check immediately, then every 2s, up to 5 total
  // attempts, while the backend's reconciliation fallback catches up with
  // Cashfree. Stops early the moment a receipt (or a hard error) shows up.
  useEffect(() => {
    let cancelled = false;
    let attemptsMade = 0;

    async function poll() {
      setIsChecking(true);
      const found = await attemptLoad();
      attemptsMade += 1;
      if (cancelled) return;

      if (found) {
        setIsChecking(false);
        return;
      }

      if (attemptsMade < MAX_AUTO_ATTEMPTS) {
        pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } else {
        setIsChecking(false);
        setAutoAttemptsExhausted(true);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleManualRefresh() {
    setIsChecking(true);
    setAutoAttemptsExhausted(false);
    const found = await attemptLoad();
    setIsChecking(false);
    if (!found) setAutoAttemptsExhausted(true);
  }

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

  // Navigate to /membership/documents
  function handleGoToDocuments() {
    router.push('/membership/documents');
  }

  return (
    <main className="bg-beige min-h-[80vh]">
      <div className="max-w-lg mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-10 flex flex-col items-center">
          <Monogram size={48} animated={false} />
          <p className="eyebrow mt-6">Membership &middot; Receipt</p>
          <h1 className="font-serif text-3xl text-ink mt-3">
            Your Membership Receipt
          </h1>
          <HairlineDivider width="56px" className="mt-6" />
        </div>

        {error ? (
          <div className="my-8 text-center">
            <div className="text-rose-700 bg-red-50 rounded-lg py-4 px-6 mb-6">
              {error}
            </div>
          </div>
        ) : receipt ? (
          <ReceiptPanel
            receipt={receipt}
            handleDownload={handleDownload}
            isDownloading={isDownloading}
            handleGoToDocuments={handleGoToDocuments}
          />
        ) : autoAttemptsExhausted ? (
          <PendingConfirmationPanel onRefresh={handleManualRefresh} isChecking={isChecking} />
        ) : (
          <LoadingState message="Confirming your payment…" />
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