import { Router } from "express";
import { requirePermission } from "../middleware/requirePermission";
import { validateQuery } from "../middleware/validate";
import { listPaymentsOverview } from "../controllers/adminPaymentController";
import { adminPaymentsQuerySchema } from "../utils/schemas";

const router = Router();

router.get(
  "/",
  ...requirePermission("payments.view"),
  validateQuery(adminPaymentsQuerySchema),
  listPaymentsOverview
);

export default router;
