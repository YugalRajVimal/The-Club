// // Types generated directly from VRK Group API CONTRACT.
// // Do not rename any field without updating the contract first.

// export type ApiErrorCode =
//   | 'VALIDATION_ERROR'
//   | 'UNAUTHORIZED'
//   | 'FORBIDDEN'
//   | 'NOT_FOUND'
//   | 'CONFLICT'
//   | 'OTP_EXPIRED'
//   | 'OTP_INVALID'
//   | 'SERVER_ERROR';

// export interface ApiErrorBody {
//   code: ApiErrorCode;
//   message: string;
//   // Not spelled out in the contract, but some backends attach field-level
//   // validation errors here. Treated as optional/defensive — if absent we
//   // fall back to a single toast built from `message`.
//   details?: Record<string, string>;
// }

// export interface ApiSuccessEnvelope<T> {
//   success: true;
//   data: T;
// }

// export interface ApiErrorEnvelope {
//   success: false;
//   error: ApiErrorBody;
// }

// export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

// // ─────────────────────────────────────────────────────────────
// // 1. Clubs
// // ─────────────────────────────────────────────────────────────

// export interface Club {
//   _id: string;
//   slug: string;
//   name: string;
//   tagline: string;
//   heroImageUrl: string;
//   whoWeAre: string;
//   whatIsUnique: string;
//   whoShouldJoin: string;
//   howYouBenefit: string;
//   whatWeOffer: {
//     purpose: string;
//     features: string[];
//     benefits: string[];
//   };
//   membershipFee: {
//     amount: number;
//     currency: 'INR';
//   };
//   membershipOpen: boolean;
// }

// // ─────────────────────────────────────────────────────────────
// // 2. User signup flow
// // ─────────────────────────────────────────────────────────────

// export interface SignupStartRequest {
//   clubId: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   password: string;
//   dob: string; // ISO date string, e.g. 1990-05-20
//   address: string;
//   occupation: string;
// }

// export interface SignupStartResponse {
//   signupSessionId: string;
//   status: 'consent_pending';
// }

// export interface SignupConsentRequest {
//   signupSessionId: string;
//   consentAccepted: true;
//   consentVersion: string;
//   signedName: string;
// }

// export interface SignupConsentResponse {
//   signupSessionId: string;
//   status: 'otp_pending';
// }

// export interface SignupOtpSendRequest {
//   signupSessionId: string;
// }

// export interface SignupOtpSendResponse {
//   message: string;
//   expiresInSeconds: number;
// }

// export interface SignupOtpVerifyRequest {
//   signupSessionId: string;
//   otp: string;
// }

// export interface SignupOtpVerifyResponse {
//   user: User;
//   token: string;
//   status: 'payment_pending';
// }

// // ─────────────────────────────────────────────────────────────
// // 3. User / auth (referenced now, used fully in later epics)
// // ─────────────────────────────────────────────────────────────

// export type MembershipStatus =
//   | 'payment_pending'
//   | 'documents_pending'
//   | 'pending_approval'
//   | 'approved'
//   | 'rejected';

// export interface User {
//   id: string;
//   clubId: string;
//   fullName: string;
//   email: string;
//   phone: string;
//   dob: string;
//   address: string;
//   occupation: string;
//   emailVerified: boolean;
//   membershipStatus: MembershipStatus;
//   consent: {
//     accepted: boolean;
//     consentVersion: string;
//     signedName: string;
//     acceptedAt: string;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

// // ─────────────────────────────────────────────────────────────
// // 4. User login / session
// // ─────────────────────────────────────────────────────────────

// export interface UserLoginRequest {
//   email: string;
//   password: string;
// }

// export interface UserLoginResponse {
//   user: User;
//   token: string;
// }

// export interface UserGoogleLoginRequest {
//   googleIdToken: string;
// }

// export type UserGoogleLoginResponse = UserLoginResponse;

// export interface ForgotPasswordOtpSendRequest {
//   email: string;
// }

// export interface ForgotPasswordOtpSendResponse {
//   message: string;
//   expiresInSeconds: number;
// }

// export interface ForgotPasswordOtpVerifyRequest {
//   email: string;
//   otp: string;
//   newPassword: string;
// }

// export interface ForgotPasswordOtpVerifyResponse {
//   message: string;
// }

// // ─────────────────────────────────────────────────────────────
// // 5. Payment (Cashfree)
// // ─────────────────────────────────────────────────────────────

// export interface CreatePaymentOrderResponse {
//   cfOrderId: string;
//   paymentSessionId: string;
//   orderAmount: number;
//   currency: string;
// }

// export interface VerifyPaymentRequest {
//   cfOrderId: string;
// }

// export interface Receipt {
//   id: string;
//   userId: string;
//   receiptNumber: string;
//   clubName: string;
//   memberName: string;
//   amount: number;
//   currency: string;
//   paidAt: string;
//   downloadUrl: string;
// }

// export interface VerifyPaymentResponse {
//   status: 'paid';
//   membershipStatus: MembershipStatus;
//   receipt: Receipt;
// }

// // ─────────────────────────────────────────────────────────────
// // 6. User documents
// // ─────────────────────────────────────────────────────────────

// export type DocumentType = 'aadhar_front' | 'aadhar_back' | 'pan_front';

// export interface UserDocument {
//   id: string;
//   userId: string;
//   documentType: DocumentType;
//   fileUrl: string;
//   fileName: string;
//   storageProvider: 'multer' | 'cloudinary';
//   uploadedAt: string;
//   verified: boolean;
//   verifiedBy: string | null;
//   verifiedAt: string | null;
// }

// export interface RequiredDocumentListItem {
//   key: string;
//   label: string;
//   inputType: 'text' | 'file';
// }

// export interface UploadDocumentResponse {
//   document: UserDocument;
// }

// export interface SaveKycNumbersRequest {
//   aadharNumber: string;
//   panNumber: string;
// }

// export interface SubmitDocumentsResponse {
//   membershipStatus: MembershipStatus;
// }

// // ─────────────────────────────────────────────────────────────
// // 7. User profile
// // ─────────────────────────────────────────────────────────────

// export interface UserProfileResponse {
//   user: User;
//   club: Club;
//   documents: UserDocument[];
//   payment: Receipt | null;
//   membershipStatus: MembershipStatus;
// }

// export interface UpdateUserProfileRequest {
//   phone?: string;
//   address?: string;
//   occupation?: string;
// }

// Types generated directly from VRK Group API CONTRACT.
// Do not rename any field without updating the contract first.

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'OTP_EXPIRED'
  | 'OTP_INVALID'
  | 'SERVER_ERROR';

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  // Not spelled out in the contract, but some backends attach field-level
  // validation errors here. Treated as optional/defensive — if absent we
  // fall back to a single toast built from `message`.
  details?: Record<string, string>;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorBody;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

// ─────────────────────────────────────────────────────────────
// 1. Clubs
// ─────────────────────────────────────────────────────────────

export interface Club {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  heroImageUrl: string;
  whoWeAre: string;
  whatIsUnique: string;
  whoShouldJoin: string;
  howYouBenefit: string;
  whatWeOffer: {
    purpose: string;
    features: string[];
    benefits: string[];
  };
  membershipFee: {
    amount: number;
    currency: 'INR';
  };
  membershipOpen: boolean;
}

// ─────────────────────────────────────────────────────────────
// 2. User signup flow
// ─────────────────────────────────────────────────────────────

export interface SignupStartRequest {
  clubId: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dob: string; // ISO date string, e.g. 1990-05-20
  address: string;
  occupation: string;
}

export interface SignupStartResponse {
  signupSessionId: string;
  status: 'consent_pending';
}

export interface SignupConsentRequest {
  signupSessionId: string;
  consentAccepted: true;
  consentVersion: string;
  signedName: string;
  /**
   * Base64 PNG data URL of the applicant's drawn signature, captured on
   * the membership form. NEW FIELD — not yet in the published API
   * contract; confirm with backend that `/auth/user/signup/consent`
   * accepts and persists it before relying on it in production.
   */
  signatureImage?: string;
}

export interface SignupConsentResponse {
  signupSessionId: string;
  status: 'otp_pending';
}

export interface SignupOtpSendRequest {
  signupSessionId: string;
}

export interface SignupOtpSendResponse {
  message: string;
  expiresInSeconds: number;
}

export interface SignupOtpVerifyRequest {
  signupSessionId: string;
  otp: string;
}

export interface SignupOtpVerifyResponse {
  user: User;
  token: string;
  status: 'payment_pending';
}

// ─────────────────────────────────────────────────────────────
// 3. User / auth (referenced now, used fully in later epics)
// ─────────────────────────────────────────────────────────────

export type MembershipStatus =
  | 'payment_pending'
  | 'documents_pending'
  | 'pending_approval'
  | 'approved'
  | 'rejected';

export interface User {
  id: string;
  clubId: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  occupation: string;
  emailVerified: boolean;
  membershipStatus: MembershipStatus;
  consent: {
    accepted: boolean;
    consentVersion: string;
    signedName: string;
    acceptedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// 4. User login / session
// ─────────────────────────────────────────────────────────────

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  user: User;
  token: string;
}

export interface UserGoogleLoginRequest {
  googleIdToken: string;
}

export type UserGoogleLoginResponse = UserLoginResponse;

export interface ForgotPasswordOtpSendRequest {
  email: string;
}

export interface ForgotPasswordOtpSendResponse {
  message: string;
  expiresInSeconds: number;
}

export interface ForgotPasswordOtpVerifyRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ForgotPasswordOtpVerifyResponse {
  message: string;
}

// ─────────────────────────────────────────────────────────────
// 5. Payment (Cashfree)
// ─────────────────────────────────────────────────────────────

export interface CreatePaymentOrderResponse {
  cfOrderId: string;
  paymentSessionId: string;
  orderAmount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  cfOrderId: string;
}

export interface Receipt {
  id: string;
  userId: string;
  receiptNumber: string;
  clubName: string;
  memberName: string;
  amount: number;
  currency: string;
  paidAt: string;
  downloadUrl: string;
}

export interface VerifyPaymentResponse {
  status: 'paid';
  membershipStatus: MembershipStatus;
  receipt: Receipt;
}

// ─────────────────────────────────────────────────────────────
// 6. User documents
// ─────────────────────────────────────────────────────────────

export type DocumentType = 'aadhar_front' | 'aadhar_back' | 'pan_front';

export interface UserDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  storageProvider: 'multer' | 'cloudinary';
  uploadedAt: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
}

export interface RequiredDocumentListItem {
  key: string;
  label: string;
  inputType: 'text' | 'file';
}

export interface UploadDocumentResponse {
  document: UserDocument;
}

export interface SaveKycNumbersRequest {
  aadharNumber: string;
  panNumber: string;
}

export interface SubmitDocumentsResponse {
  membershipStatus: MembershipStatus;
}

// ─────────────────────────────────────────────────────────────
// 7. User profile
// ─────────────────────────────────────────────────────────────

export interface UserProfileResponse {
  user: User;
  club: Club;
  documents: UserDocument[];
  payment: Receipt | null;
  membershipStatus: MembershipStatus;
}

export interface UpdateUserProfileRequest {
  phone?: string;
  address?: string;
  occupation?: string;
}