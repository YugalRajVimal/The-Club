// Types mirror the API CONTRACT exactly — do not rename fields without updating the contract first.

export type PermissionAction = "view" | "add" | "update" | "delete" | "verifyDocuments" | "approveMembership";

export interface PermissionMap {
  users: {
    view: boolean;
    add: boolean;
    update: boolean;
    delete: boolean;
    verifyDocuments: boolean;
    approveMembership: boolean;
  };
  clubs: {
    view: boolean;
    add: boolean;
    update: boolean;
    delete: boolean;
  };
  payments: {
    view: boolean;
  };
  settings: {
    view: boolean;
    update: boolean;
  };
}

export type PermissionPage = keyof PermissionMap;

export interface Role {
  id: string;
  name: string;
  permissions: PermissionMap;
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  type: "admin" | "sub_admin";
  roleId: Role | null; // null when type === "admin" (super admin, full access)
  createdAt: string;
}

// ── Clubs ────────────────────────────────────────────────────────────────

export interface Club {
  id: string;
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
    currency: "INR";
  };
  membershipOpen: boolean;
}

// ── Users / membership ──────────────────────────────────────────────────

export type MembershipStatus =
  | "payment_pending"
  | "documents_pending"
  | "pending_approval"
  | "approved"
  | "rejected";

export interface Consent {
  accepted: boolean;
  consentVersion: string;
  signedName: string;
  acceptedAt: string;
}

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
  consent: Consent;
  createdAt: string;
  updatedAt: string;
}

// GET /admin/users/:id returns the user enriched with club + documents + payment.
export interface UserDetail extends User {
  club?: Club;
  documents?: DocumentRecord[];
  payment?: Receipt | null;
}

export type DocumentType = "aadhar_front" | "aadhar_back" | "pan_front";

export interface DocumentRecord {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  storageProvider: "multer" | "cloudinary";
  uploadedAt: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
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

export interface UserListParams {
  status?: MembershipStatus;
  clubId?: string;
  search?: string;
}

// ── Payments (admin overview) ───────────────────────────────────────────
// NOTE: GET /admin/payments is not yet in the API CONTRACT — see the comment
// above adminListPayments() in adminClient.ts for the exact shape assumed
// pending a contract addition. Receipt already carries memberName/clubName,
// so no extra type is needed here.

export interface PaymentListParams {
  clubId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ── Settings ─────────────────────────────────────────────────────────────

export type UploadProvider = "multer" | "cloudinary";

export interface AdminSettings {
  uploadProvider: UploadProvider;
}

// ── Generic response envelope ──────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code:
      | "VALIDATION_ERROR"
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "CONFLICT"
      | "OTP_EXPIRED"
      | "OTP_INVALID"
      | "SERVER_ERROR";
    message: string;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;
