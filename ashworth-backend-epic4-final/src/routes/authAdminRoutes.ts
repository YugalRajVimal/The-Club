import { Router } from "express";
import { anyAdmin } from "../middleware/requirePermission";
import { validateBody } from "../middleware/validate";
import {
  adminLogin,
  adminCheckAuth,
  adminLogout,
  adminForgotPasswordOtpSend,
  adminForgotPasswordOtpVerify,
} from "../controllers/adminAuthController";
import {
  adminLoginSchema,
  forgotPasswordOtpSendSchema,
  forgotPasswordOtpVerifySchema,
} from "../utils/schemas";

const router = Router();

router.post("/login", validateBody(adminLoginSchema), adminLogin);
router.post(
  "/forgot-password/otp/send",
  validateBody(forgotPasswordOtpSendSchema),
  adminForgotPasswordOtpSend
);
router.post(
  "/forgot-password/otp/verify",
  validateBody(forgotPasswordOtpVerifySchema),
  adminForgotPasswordOtpVerify
);
router.post("/logout", ...anyAdmin, adminLogout);
router.get("/check-auth", ...anyAdmin, adminCheckAuth);

export default router;
