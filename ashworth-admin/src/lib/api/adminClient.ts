import type {
  AdminAccount,
  AdminSettings,
  ApiEnvelope,
  Club,
  DocumentRecord,
  PaymentListParams,
  PermissionMap,
  Receipt,
  Role,
  UploadProvider,
  User,
  UserDetail,
  UserListParams,
} from "@/types/admin";

// Distinct localStorage key from the user-side app — the two apps must never collide
// if ever run on the same domain/browser.
export const ADMIN_TOKEN_STORAGE_KEY = "ashworth_admin_token";
export const ADMIN_ACCOUNT_STORAGE_KEY = "ashworth_admin_account";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export class ApiRequestError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError("SERVER_ERROR", "Couldn't reach the server. Check your connection and try again.");
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new ApiRequestError("SERVER_ERROR", "The server sent back something unexpected.");
  }

  if (!envelope.success) {
    throw new ApiRequestError(envelope.error.code, envelope.error.message);
  }

  return envelope.data;
}

// ── Auth ─────────────────────────────────────────────────────────────────

export function adminLogin(email: string, password: string) {
  return request<{ admin: AdminAccount; token: string }>("/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

export function adminForgotPasswordOtpSend(email: string) {
  return request<{ message: string; expiresInSeconds: number }>(
    "/auth/admin/forgot-password/otp/send",
    { method: "POST", body: { email } }
  );
}

export function adminForgotPasswordOtpVerify(email: string, otp: string, newPassword: string) {
  return request<{ message: string }>("/auth/admin/forgot-password/otp/verify", {
    method: "POST",
    body: { email, otp, newPassword },
  });
}

export function adminCheckAuth() {
  return request<{ admin: AdminAccount }>("/auth/admin/check-auth", {
    method: "GET",
    auth: true,
  });
}

export function adminLogout() {
  return request<{ message: string }>("/auth/admin/logout", {
    method: "POST",
    auth: true,
  });
}

// ── Clubs (public — used to populate club pickers) ─────────────────────────

export function listClubs() {
  return request<Club[]>("/clubs", { method: "GET" });
}

// ── Users management ────────────────────────────────────────────────────

export function adminListUsers(params: UserListParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.clubId) query.set("clubId", params.clubId);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();

  return request<User[]>(`/admin/users${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

export function adminGetUser(id: string) {
  return request<UserDetail>(`/admin/users/${id}`, { method: "GET", auth: true });
}

export interface CreateUserPayload {
  clubId: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  occupation: string;
  password: string;
}

export function adminCreateUser(payload: CreateUserPayload) {
  return request<User>("/admin/users", { method: "POST", body: payload, auth: true });
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  address?: string;
  occupation?: string;
  clubId?: string;
}

export function adminUpdateUser(id: string, payload: UpdateUserPayload) {
  return request<User>(`/admin/users/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminDeleteUser(id: string) {
  return request<{ message: string }>(`/admin/users/${id}`, { method: "DELETE", auth: true });
}

export function adminVerifyDocument(userId: string, docId: string, verified: boolean, note?: string) {
  return request<DocumentRecord>(`/admin/users/${userId}/documents/${docId}/verify`, {
    method: "PATCH",
    body: { verified, note },
    auth: true,
  });
}

export function adminApproveMembership(userId: string, approve: boolean, note?: string) {
  return request<{ membershipStatus: User["membershipStatus"] }>(
    `/admin/users/${userId}/membership/approve`,
    { method: "PATCH", body: { approve, note }, auth: true }
  );
}

export function adminGetUserPayments(userId: string) {
  return request<Receipt[]>(`/admin/users/${userId}/payments`, { method: "GET", auth: true });
}

// ── Clubs management ────────────────────────────────────────────────────

export function adminListClubs() {
  return request<Club[]>("/admin/clubs", { method: "GET", auth: true });
}

export interface ClubPayload {
  name: string;
  slug?: string;
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

export function adminCreateClub(payload: ClubPayload) {
  return request<Club>("/admin/clubs", { method: "POST", body: payload, auth: true });
}

export function adminUpdateClub(id: string, payload: Partial<ClubPayload>) {
  return request<Club>(`/admin/clubs/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminDeleteClub(id: string) {
  return request<{ message: string }>(`/admin/clubs/${id}`, { method: "DELETE", auth: true });
}

// ── Payments overview ───────────────────────────────────────────────────
// CONTRACT ADDITION NEEDED: the API CONTRACT does not currently define a
// list-style payments endpoint — only GET /admin/users/:id/payments (per
// user) exists. This assumes the following will be added:
//
//   GET /admin/payments ?clubId=&dateFrom=&dateTo=
//     [ADMIN AUTH: permission="payments.view"]
//     -> Receipt[]  (Receipt already includes memberName + clubName)
//
// Until the backend implements this, calls below will 404. Flag this to the
// backend dev before shipping the Payments Overview page.

export function adminListPayments(params: PaymentListParams = {}) {
  const query = new URLSearchParams();
  if (params.clubId) query.set("clubId", params.clubId);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  const qs = query.toString();

  return request<Receipt[]>(`/admin/payments${qs ? `?${qs}` : ""}`, { method: "GET", auth: true });
}

// ── Roles (super admin only) ────────────────────────────────────────────

export function adminListRoles() {
  return request<Role[]>("/admin/roles", { method: "GET", auth: true });
}

export function adminCreateRole(name: string, permissions: PermissionMap) {
  return request<Role>("/admin/roles", { method: "POST", body: { name, permissions }, auth: true });
}

export function adminUpdateRole(id: string, payload: { name?: string; permissions?: PermissionMap }) {
  return request<Role>(`/admin/roles/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminDeleteRole(id: string) {
  return request<{ message: string }>(`/admin/roles/${id}`, { method: "DELETE", auth: true });
}

// ── Sub-admins (super admin only) ───────────────────────────────────────

export function adminListSubAdmins() {
  return request<AdminAccount[]>("/admin/subadmins", { method: "GET", auth: true });
}

export interface CreateSubAdminPayload {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export function adminCreateSubAdmin(payload: CreateSubAdminPayload) {
  return request<AdminAccount>("/admin/subadmins", { method: "POST", body: payload, auth: true });
}

export interface UpdateSubAdminPayload {
  name?: string;
  roleId?: string;
  password?: string;
}

export function adminUpdateSubAdmin(id: string, payload: UpdateSubAdminPayload) {
  return request<AdminAccount>(`/admin/subadmins/${id}`, { method: "PATCH", body: payload, auth: true });
}

export function adminDeleteSubAdmin(id: string) {
  return request<{ message: string }>(`/admin/subadmins/${id}`, { method: "DELETE", auth: true });
}

// ── Settings (super admin only) ─────────────────────────────────────────

export function adminGetSettings() {
  return request<AdminSettings>("/admin/settings", { method: "GET", auth: true });
}

export function adminUpdateUploadProvider(uploadProvider: UploadProvider) {
  return request<AdminSettings>("/admin/settings/upload-provider", {
    method: "PATCH",
    body: { uploadProvider },
    auth: true,
  });
}

// Re-exported so components/context never need to know the shape beyond this.
export type { AdminAccount, Role };
