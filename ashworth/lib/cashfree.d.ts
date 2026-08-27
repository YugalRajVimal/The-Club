export {};

declare global {
  interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: string;
  }

  interface CashfreeCheckoutResult {
    error?: { message: string };
    redirect?: boolean;
    paymentDetails?: { paymentMessage?: string; orderId?: string };
  }

  interface CashfreeInstance {
    checkout: (
      options: CashfreeCheckoutOptions
    ) => Promise<CashfreeCheckoutResult>;
  }

  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => CashfreeInstance;
  }
}
