// import { Router } from "express";
// import { userAuth } from "../middleware/userAuth";
// import { validateBody } from "../middleware/validate";
// import {
//   signupStart,
//   signupConsent,
//   signupOtpSend,
//   signupOtpVerify,
//   userLogin,
//   userLoginGoogle,
//   forgotPasswordOtpSend,
//   forgotPasswordOtpVerify,
//   userLogout,
//   userCheckAuth,
// } from "../controllers/authUserController";
// import {
//   signupStartSchema,
//   signupConsentSchema,
//   signupOtpSendSchema,
//   signupOtpVerifySchema,
//   userLoginSchema,
//   userLoginGoogleSchema,
//   forgotPasswordOtpSendSchema,
//   forgotPasswordOtpVerifySchema,
// } from "../utils/schemas";

// const router = Router();

// // Signup flow: Membership Form -> Consent -> OTP -> Account + Auto-Login
// router.post("/signup/start", validateBody(signupStartSchema), signupStart);
// router.post("/signup/consent", validateBody(signupConsentSchema), signupConsent);
// router.post("/signup/otp/send", validateBody(signupOtpSendSchema), signupOtpSend);
// router.post("/signup/otp/verify", validateBody(signupOtpVerifySchema), signupOtpVerify);

// // Login / session
// router.post("/login", validateBody(userLoginSchema), userLogin);
// router.post("/login/google", validateBody(userLoginGoogleSchema), userLoginGoogle);
// router.post("/forgot-password/otp/send", validateBody(forgotPasswordOtpSendSchema), forgotPasswordOtpSend);
// router.post(
//   "/forgot-password/otp/verify",
//   validateBody(forgotPasswordOtpVerifySchema),
//   forgotPasswordOtpVerify
// );
// router.post("/logout", userAuth, userLogout);
// router.get("/check-auth", userAuth, userCheckAuth);

// export default router;


import { Router } from "express";
import { userAuth } from "../middleware/userAuth";
import { optionalUserAuth } from "../middleware/optionalUserAuth";
import { validateBody } from "../middleware/validate";
import {
  signupStart,
  signupConsent,
  signupOtpSend,
  signupOtpVerify,
  userLogin,
  userLoginGoogle,
  forgotPasswordOtpSend,
  forgotPasswordOtpVerify,
  userLogout,
  userCheckAuth,
} from "../controllers/authUserController";
import {
  signupStartSchema,
  signupConsentSchema,
  signupOtpSendSchema,
  signupOtpVerifySchema,
  userLoginSchema,
  userLoginGoogleSchema,
  forgotPasswordOtpSendSchema,
  forgotPasswordOtpVerifySchema,
} from "../utils/schemas";

const router = Router();

// Signup flow: Membership Form -> Consent -> OTP -> Account + Auto-Login
// optionalUserAuth runs first so the controllers can see req.userAuth (if a
// valid token was sent) and block a logged-in caller from starting a second
// membership — without requiring auth on what is otherwise a public flow.
router.post("/signup/start", optionalUserAuth, validateBody(signupStartSchema), signupStart);
router.post("/signup/consent", optionalUserAuth, validateBody(signupConsentSchema), signupConsent);
router.post("/signup/otp/send", optionalUserAuth, validateBody(signupOtpSendSchema), signupOtpSend);
router.post("/signup/otp/verify", optionalUserAuth, validateBody(signupOtpVerifySchema), signupOtpVerify);

// Login / session
router.post("/login", validateBody(userLoginSchema), userLogin);
router.post("/login/google", validateBody(userLoginGoogleSchema), userLoginGoogle);
router.post("/forgot-password/otp/send", validateBody(forgotPasswordOtpSendSchema), forgotPasswordOtpSend);
router.post(
  "/forgot-password/otp/verify",
  validateBody(forgotPasswordOtpVerifySchema),
  forgotPasswordOtpVerify
);
router.post("/logout", userAuth, userLogout);
router.get("/check-auth", userAuth, userCheckAuth);

export default router;