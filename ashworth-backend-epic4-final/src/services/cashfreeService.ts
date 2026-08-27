import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env";

// Talking to Cashfree directly over their REST API (Orders API, PG version
// 2023-08-01) rather than depending on a specific SDK's method names, since
// SDK surfaces drift between versions and the contract only cares about the
// wire behavior: create an order, fetch its authoritative status, and verify
// webhook signatures. All three are implemented against Cashfree's
// documented sandbox endpoints.

const CASHFREE_BASE_URL =
  env.CASHFREE_ENV === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

function cashfreeHeaders() {
  return {
    "x-client-id": env.CASHFREE_APP_ID,
    "x-client-secret": env.CASHFREE_SECRET_KEY,
    "x-api-version": "2023-08-01",
    "Content-Type": "application/json",
  };
}

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CreateOrderResult {
  cfOrderId: string;
  paymentSessionId: string;
  raw: unknown;
}

export async function createCashfreeOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const response = await axios.post(
    `${CASHFREE_BASE_URL}/orders`,
    {
      order_id: params.orderId,
      order_amount: params.orderAmount,
      order_currency: params.orderCurrency,
      customer_details: {
        customer_id: params.customerId,
        customer_email: params.customerEmail,
        customer_phone: params.customerPhone,
      },
    },
    { headers: cashfreeHeaders() }
  );

  return {
    cfOrderId: response.data.cf_order_id ?? response.data.order_id,
    paymentSessionId: response.data.payment_session_id,
    raw: response.data,
  };
}

export interface OrderStatusResult {
  orderStatus: string; // "PAID" | "ACTIVE" | "EXPIRED" | "TERMINATED" | ...
  raw: unknown;
}

// Authoritative status check — this is what /verify calls server-side. Never
// trust a client-supplied "success" flag; always re-check with Cashfree.
export async function fetchCashfreeOrderStatus(orderId: string): Promise<OrderStatusResult> {
  const response = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
    headers: cashfreeHeaders(),
  });

  return { orderStatus: response.data.order_status, raw: response.data };
}

/**
 * Verifies the signature on a Cashfree webhook payload.
 * Per Cashfree's webhook docs: signature = base64(HMAC-SHA256(timestamp + rawBody, secretKey)),
 * sent as the `x-webhook-signature` header alongside `x-webhook-timestamp`.
 * `rawBody` MUST be the exact raw request body string (not a re-serialized
 * JSON.stringify of the parsed object) — see the express.raw() body parser
 * wired up on the webhook route in routes/membershipRoutes.ts.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", env.CASHFREE_SECRET_KEY)
    .update(timestamp + rawBody)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    // Buffers of different lengths throw on timingSafeEqual — treat as invalid.
    return false;
  }
}
