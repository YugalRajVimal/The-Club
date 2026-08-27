import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { validateBody } from "../middleware/validate";
import { createPaymentOrder, verifyPayment, getReceipt, downloadReceipt } from "../controllers/paymentController";
import { paymentVerifySchema } from "../utils/schemas";

// NOTE: the webhook route (POST /api/membership/payment/webhook) is deliberately
// NOT defined here. It's registered directly in app.ts, mounted BEFORE the
// global express.json() body parser, using express.raw() instead — Cashfree's
// signature check needs the exact raw request bytes, and by the time a request
// reaches this router the global json() parser would already have consumed and
// re-serialized the body, breaking signature verification. See app.ts.

const router = Router();

router.post("/payment/create-order", userAuth, createPaymentOrder);
router.post("/payment/verify", userAuth, validateBody(paymentVerifySchema), verifyPayment);
router.get("/receipt", userAuth, getReceipt);
router.get("/receipt/download", userAuth, downloadReceipt);

export default router;
