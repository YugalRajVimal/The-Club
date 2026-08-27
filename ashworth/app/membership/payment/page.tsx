'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Landmark, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthGuard from '@/components/auth/AuthGuard';
import HairlineDivider from '@/components/ui/HairlineDivider';
import LoadingState, { ErrorState } from '@/components/ui/LoadingState';
import { ApiClientError, createPaymentOrder, verifyPayment } from '@/lib/api/client';
import type { CreatePaymentOrderResponse } from '@/lib/api/types';

const CASHFREE_MODE =
  (process.env.NEXT_PUBLIC_CASHFREE_MODE as 'sandbox' | 'production') ||
  'sandbox';
const CASHFREE_SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';
const CHECKOUT_CONTAINER_ID = 'cashfree-checkout-container';

type Phase =
  | 'creating_order'
  | 'ready'
  | 'processing'
  | 'verifying'
  | 'error';

function PaymentFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('creating_order');
  const [order, setOrder] = useState<CreatePaymentOrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const hasStartedCheckout = useRef(false);

  const loadOrder = useCallback(async () => {
    setPhase('creating_order');
    setErrorMessage(null);
    try {
      const res = await createPaymentOrder();
      setOrder(res);
      setPhase('ready');
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Could not start your payment. Please try again.';
      setErrorMessage(message);
      setPhase('error');
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleVerify = useCallback(
    async (cfOrderId: string) => {
      setPhase('verifying');
      try {
        const res = await verifyPayment({ cfOrderId });
        toast.success('Payment confirmed. Your receipt is ready.');
        router.push('/membership/receipt');
        return res;
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : 'We could not confirm your payment. If an amount was deducted, please contact us before retrying.';
        setErrorMessage(message);
        setPhase('error');
        toast.error(message);
        return null;
      }
    },
    [router]
  );

  const startCheckout = useCallback(async () => {
    if (!order || !sdkReady || !window.Cashfree || hasStartedCheckout.current)
      return;
    hasStartedCheckout.current = true;
    setPhase('processing');

    try {
      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      const result = await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: `#${CHECKOUT_CONTAINER_ID}`,
      });

      if (result.error) {
        toast.error(
          result.error.message ||
            'The payment was not completed. You can try again below.'
        );
      }

      // Whether Cashfree reports success, cancellation, or an error, the
      // backend is the source of truth — always verify server-side.
      await handleVerify(order.cfOrderId);
    } catch {
      toast.error('The payment window could not be started. Please try again.');
      setPhase('error');
    } finally {
      hasStartedCheckout.current = false;
    }
  }, [order, sdkReady, handleVerify]);

  return (
    <main className="bg-white min-h-[80vh]">
      <Script
        src={CASHFREE_SDK_URL}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      <div className="max-w-lg mx-auto px-6 py-24 md:py-28">
        <div className="text-center mb-10 flex flex-col items-center">
          <Landmark size={30} strokeWidth={1.25} className="text-gold-dark mb-4" />
          <p className="eyebrow">Membership &middot; Payment</p>
          <h1 className="font-serif text-3xl text-ink mt-3">
            Complete Your Membership Payment
          </h1>
          <HairlineDivider width="56px" className="mt-6" />
        </div>

        {phase === 'creating_order' && (
          <LoadingState message="Preparing your secure payment session…" />
        )}

        {phase === 'ready' && order && (
          <div className="border border-gold-light/50 bg-beige px-8 py-10">
            <div className="flex items-center justify-between font-sans text-sm text-ink/70 mb-8">
              <span>Amount Due</span>
              <span className="text-lg text-ink font-serif">
                {order.currency} {order.orderAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="button"
              onClick={startCheckout}
              disabled={!sdkReady}
              className="w-full inline-flex items-center justify-center gap-3 border border-gold px-9 py-3.5 font-sans text-[13px] tracking-widest2 uppercase text-gold-dark hover:bg-gold hover:text-ivory transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sdkReady ? 'Proceed to Pay' : 'Loading Secure Checkout…'}
            </button>
            <p className="mt-5 flex items-center justify-center gap-2 font-sans text-[11px] text-ink/45">
              <ShieldCheck size={14} strokeWidth={1.5} />
              Processed securely by Cashfree Payments
            </p>
          </div>
        )}

        {phase === 'processing' && (
          <div className="border border-gold-light/50 bg-beige px-6 py-6 mb-6 text-center">
            <p className="font-sans text-sm text-ink/65">
              Complete your payment in the window below.
            </p>
          </div>
        )}

        {phase === 'verifying' && (
          <LoadingState message="Verifying your payment with our bank partner…" />
        )}

        {phase === 'error' && (
          <ErrorState
            message={errorMessage || 'Something went wrong with your payment.'}
            onRetry={loadOrder}
          />
        )}

        {/* Persistently mounted so Cashfree always has a stable target to
            embed into — sized only once checkout is actually underway. */}
        <div
          id={CHECKOUT_CONTAINER_ID}
          className={phase === 'processing' ? 'min-h-[420px]' : 'h-0 overflow-hidden'}
        />
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <AuthGuard>
      <PaymentFlow />
    </AuthGuard>
  );
}
