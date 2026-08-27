import type {
  ApiEnvelope,
  Club,
  CreatePaymentOrderResponse,
  ForgotPasswordOtpSendRequest,
  ForgotPasswordOtpSendResponse,
  ForgotPasswordOtpVerifyRequest,
  ForgotPasswordOtpVerifyResponse,
  Receipt,
  RequiredDocumentListItem,
  SaveKycNumbersRequest,
  SignupConsentRequest,
  SignupConsentResponse,
  SignupOtpSendRequest,
  SignupOtpSendResponse,
  SignupOtpVerifyRequest,
  SignupOtpVerifyResponse,
  SignupStartRequest,
  SignupStartResponse,
  SubmitDocumentsResponse,
  UpdateUserProfileRequest,
  UploadDocumentResponse,
  UserDocument,
  UserGoogleLoginRequest,
  UserGoogleLoginResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserProfileResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from './types';

/**
 * Base URL resolution.
 *
 * - In the browser we default to a relative `/api` path (works behind a
 *   same-origin proxy/rewrite) unless NEXT_PUBLIC_API_BASE_URL is set.
 * - On the server (server components, route handlers) relative fetch URLs
 *   are not resolvable, so we require an absolute URL — falling back to
 *   http://localhost:5000/api for local development.
 */
function resolveBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000/api'
  );
}

const USER_TOKEN_KEY = 'ashworth_user_token';

export function getStoredUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(USER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredUserToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.localStorage.setItem(USER_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(USER_TOKEN_KEY);
    }
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

export class ApiClientError extends Error {
  code: string;
  details?: Record<string, string>;

  constructor(code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach the user bearer token
  cache?: RequestCache;
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, cache } = options;
  const baseUrl = resolveBaseUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getStoredUserToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
    });
  } catch {
    throw new ApiClientError(
      'SERVER_ERROR',
      'Could not reach the Ashworth Club servers. Please check your connection and try again.'
    );
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiClientError(
      'SERVER_ERROR',
      'Received an unexpected response from the server.'
    );
  }

  if (!envelope || envelope.success !== true) {
    const errorBody = envelope && 'error' in envelope ? envelope.error : undefined;
    if (auth && errorBody?.code === 'UNAUTHORIZED') {
      // The session token is dead (expired/blacklisted) — clear it so the
      // next auth check or page guard correctly treats the user as logged
      // out, rather than silently retrying with a token that will never work.
      setStoredUserToken(null);
    }
    throw new ApiClientError(
      errorBody?.code ?? 'SERVER_ERROR',
      errorBody?.message ?? 'Something went wrong. Please try again.',
      errorBody?.details
    );
  }

  return envelope.data;
}

// ─────────────────────────────────────────────────────────────
// 1. Public — clubs
// ─────────────────────────────────────────────────────────────

export function getClubs(): Promise<Club[]> {
  return apiFetch<Club[]>('/clubs', { cache: 'no-store' });
}

export function getClubBySlug(slug: string): Promise<Club> {
  return apiFetch<Club>(`/clubs/${encodeURIComponent(slug)}`, { cache: 'no-store' });
}

// ─────────────────────────────────────────────────────────────
// 2. User signup flow
// ─────────────────────────────────────────────────────────────

export function signupStart(
  body: SignupStartRequest
): Promise<SignupStartResponse> {
  return apiFetch<SignupStartResponse>('/auth/user/signup/start', {
    method: 'POST',
    body,
  });
}

export function signupConsent(
  body: SignupConsentRequest
): Promise<SignupConsentResponse> {
  return apiFetch<SignupConsentResponse>('/auth/user/signup/consent', {
    method: 'POST',
    body,
  });
}

export function signupOtpSend(
  body: SignupOtpSendRequest
): Promise<SignupOtpSendResponse> {
  return apiFetch<SignupOtpSendResponse>('/auth/user/signup/otp/send', {
    method: 'POST',
    body,
  });
}

export function signupOtpVerify(
  body: SignupOtpVerifyRequest
): Promise<SignupOtpVerifyResponse> {
  return apiFetch<SignupOtpVerifyResponse>('/auth/user/signup/otp/verify', {
    method: 'POST',
    body,
  });
}

// ─────────────────────────────────────────────────────────────
// 3. User login / session
// ─────────────────────────────────────────────────────────────

export function checkUserAuth(): Promise<{ user: import('./types').User }> {
  return apiFetch('/auth/user/check-auth', { auth: true });
}

export function userLogout(): Promise<{ message: string }> {
  return apiFetch('/auth/user/logout', { method: 'POST', auth: true });
}

export function userLogin(body: UserLoginRequest): Promise<UserLoginResponse> {
  return apiFetch<UserLoginResponse>('/auth/user/login', {
    method: 'POST',
    body,
  });
}

export function userLoginGoogle(
  body: UserGoogleLoginRequest
): Promise<UserGoogleLoginResponse> {
  return apiFetch<UserGoogleLoginResponse>('/auth/user/login/google', {
    method: 'POST',
    body,
  });
}

export function forgotPasswordOtpSend(
  body: ForgotPasswordOtpSendRequest
): Promise<ForgotPasswordOtpSendResponse> {
  return apiFetch<ForgotPasswordOtpSendResponse>(
    '/auth/user/forgot-password/otp/send',
    { method: 'POST', body }
  );
}

export function forgotPasswordOtpVerify(
  body: ForgotPasswordOtpVerifyRequest
): Promise<ForgotPasswordOtpVerifyResponse> {
  return apiFetch<ForgotPasswordOtpVerifyResponse>(
    '/auth/user/forgot-password/otp/verify',
    { method: 'POST', body }
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Payment (Cashfree)
// ─────────────────────────────────────────────────────────────

export function createPaymentOrder(): Promise<CreatePaymentOrderResponse> {
  return apiFetch<CreatePaymentOrderResponse>(
    '/membership/payment/create-order',
    { method: 'POST', auth: true }
  );
}

export function verifyPayment(
  body: VerifyPaymentRequest
): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>('/membership/payment/verify', {
    method: 'POST',
    body,
    auth: true,
  });
}

export function getReceipt(): Promise<Receipt> {
  return apiFetch<Receipt>('/membership/receipt', {
    auth: true,
    cache: 'no-store',
  });
}

/**
 * The download endpoint returns a raw PDF stream rather than the JSON
 * envelope, so it bypasses apiFetch and is handled as a Blob directly.
 */
export async function downloadReceiptPdf(): Promise<Blob> {
  const baseUrl = resolveBaseUrl();
  const token = getStoredUserToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/membership/receipt/download`, {
      method: 'GET',
      headers,
    });
  } catch {
    throw new ApiClientError(
      'SERVER_ERROR',
      'Could not reach the Ashworth Club servers. Please check your connection and try again.'
    );
  }

  if (!response.ok) {
    // The download endpoint may still return the standard JSON envelope on error.
    try {
      const envelope = (await response.json()) as ApiEnvelope<unknown>;
      const errorBody = 'error' in envelope ? envelope.error : undefined;
      throw new ApiClientError(
        errorBody?.code ?? 'SERVER_ERROR',
        errorBody?.message ?? 'Could not download your receipt.'
      );
    } catch {
      throw new ApiClientError(
        'SERVER_ERROR',
        'Could not download your receipt.'
      );
    }
  }

  return response.blob();
}

// ─────────────────────────────────────────────────────────────
// 6. User documents
// ─────────────────────────────────────────────────────────────

export function getRequiredDocumentsList(): Promise<RequiredDocumentListItem[]> {
  return apiFetch<RequiredDocumentListItem[]>('/user/documents/required-list', {
    auth: true,
    cache: 'no-store',
  });
}

export function getUserDocuments(): Promise<UserDocument[]> {
  return apiFetch<UserDocument[]>('/user/documents', {
    auth: true,
    cache: 'no-store',
  });
}

/**
 * Multipart upload — bypasses apiFetch's JSON body encoding since the
 * browser must set its own multipart boundary in the Content-Type header.
 */
export async function uploadDocument(
  documentType: string,
  file: File
): Promise<UploadDocumentResponse> {
  const baseUrl = resolveBaseUrl();
  const token = getStoredUserToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/user/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new ApiClientError(
      'SERVER_ERROR',
      'Could not reach the Ashworth Club servers. Please check your connection and try again.'
    );
  }

  let envelope: ApiEnvelope<UploadDocumentResponse> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<UploadDocumentResponse>;
  } catch {
    throw new ApiClientError(
      'SERVER_ERROR',
      'Received an unexpected response from the server.'
    );
  }

  if (!envelope || envelope.success !== true) {
    const errorBody = envelope && 'error' in envelope ? envelope.error : undefined;
    throw new ApiClientError(
      errorBody?.code ?? 'SERVER_ERROR',
      errorBody?.message ?? 'Could not upload this document.',
      errorBody?.details
    );
  }

  return envelope.data;
}

export function saveKycNumbers(
  body: SaveKycNumbersRequest
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/user/documents/kyc-numbers', {
    method: 'POST',
    body,
    auth: true,
  });
}

export function submitDocuments(): Promise<SubmitDocumentsResponse> {
  return apiFetch<SubmitDocumentsResponse>('/user/documents/submit', {
    method: 'POST',
    auth: true,
  });
}

// ─────────────────────────────────────────────────────────────
// 7. User profile
// ─────────────────────────────────────────────────────────────

export function getUserProfile(): Promise<UserProfileResponse> {
  return apiFetch<UserProfileResponse>('/user/profile', {
    auth: true,
    cache: 'no-store',
  });
}

export function updateUserProfile(
  body: UpdateUserProfileRequest
): Promise<import('./types').User> {
  return apiFetch('/user/profile', { method: 'PATCH', body, auth: true });
}

/**
 * Same as `uploadDocument`, but uses XMLHttpRequest so we can report real
 * upload progress (fetch has no upload-progress event).
 */
export function uploadDocumentWithProgress(
  documentType: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadDocumentResponse> {
  const baseUrl = resolveBaseUrl();
  const token = getStoredUserToken();
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/user/documents/upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onerror = () => {
      reject(
        new ApiClientError(
          'SERVER_ERROR',
          'Could not reach the Ashworth Club servers. Please check your connection and try again.'
        )
      );
    };

    xhr.onload = () => {
      let envelope: ApiEnvelope<UploadDocumentResponse> | null = null;
      try {
        envelope = JSON.parse(xhr.responseText) as ApiEnvelope<UploadDocumentResponse>;
      } catch {
        reject(
          new ApiClientError(
            'SERVER_ERROR',
            'Received an unexpected response from the server.'
          )
        );
        return;
      }

      if (!envelope || envelope.success !== true) {
        const errorBody =
          envelope && 'error' in envelope ? envelope.error : undefined;
        reject(
          new ApiClientError(
            errorBody?.code ?? 'SERVER_ERROR',
            errorBody?.message ?? 'Could not upload this document.',
            errorBody?.details
          )
        );
        return;
      }

      resolve(envelope.data);
    };

    xhr.send(formData);
  });
}
