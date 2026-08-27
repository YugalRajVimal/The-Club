# The Ashworth Club — User-Side Frontend (Epic 1 + Epic 2 + Epic 3 + Epic 4)

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## What's included (Epic 4)

13. **Full profile page** (`/profile`) — calls `GET /user/profile` and
    renders everything it returns: a status banner (`payment_pending` →
    link to payment, `documents_pending` → link to documents,
    `pending_approval` → "under review", `approved` → full member state,
    `rejected` → rejection notice), the joined club, personal details,
    every submitted document with a "Verified" / "Pending Review" badge,
    and a payment summary linking back to `/membership/receipt`.
14. **Editable fields** — phone, address, and occupation only (per the
    contract) toggle into inline inputs and save via `PATCH /user/profile`,
    with field-level `VALIDATION_ERROR` support and a toast on success.
15. **Logout** — `components/Header.tsx` is now mounted in the root layout;
    it shows "Sign In" when logged out, or "My Profile" + "Logout" when
    logged in, wired straight to `AuthContext.logout()`.
16. **Polish pass** — a shared `components/ui/LoadingState.tsx` (spinner +
    message) and `ErrorState` (message + retry button) are now used
    consistently across every data-fetching page (join, payment, receipt,
    documents, profile). `apiFetch` also clears a dead token from
    `localStorage` whenever an authenticated call comes back
    `UNAUTHORIZED`, so a stale session doesn't linger silently.

## What's included (Epic 3)

9. **Payment page** (`/membership/payment`, `AuthGuard`-protected) — calls
   `POST /membership/payment/create-order`, then loads the Cashfree
   Checkout JS SDK (`https://sdk.cashfree.com/js/v3/cashfree.js`, mode from
   `NEXT_PUBLIC_CASHFREE_MODE`) and runs an embedded checkout into a
   persistent container using the returned `paymentSessionId`. Regardless
   of what the client-side Cashfree callback reports, the page always calls
   `POST /membership/payment/verify` with `{ cfOrderId }` afterwards and
   shows a "Verifying your payment…" state while that's in flight — the
   backend is treated as the sole source of truth. On success it redirects
   to the receipt page.
10. **Receipt page** (`/membership/receipt`) — calls `GET /membership/receipt`
    and renders receipt number, member name, club name, amount, and paid
    date. "Download Receipt" calls `GET /membership/receipt/download` and
    triggers a browser download of the returned PDF via a Blob/object URL.
11. **Document upload page** (`/membership/documents`) — renders entirely
    from `GET /user/documents/required-list` (nothing hardcoded): file
    items get a drag-friendly file input with a real upload-progress bar
    (via `XMLHttpRequest`) posting to `POST /user/documents/upload`; text
    items (e.g. `aadhar_number`, `pan_number`) are grouped into one "Identity
    Numbers" panel with a single "Save Details" button, since
    `POST /user/documents/kyc-numbers` accepts both fields together. Once
    every file is uploaded and identity numbers are saved, "Submit for
    Review" enables and calls `POST /user/documents/submit`, then redirects
    to `/profile`.
12. **`/profile`** — a minimal placeholder page (not in this epic's scope,
    but needed as the redirect target after document submission); shows the
    member's name and membership status. Epic 4 will build it out properly.

## What's included (Epic 2)

4. **OTP step** (final step of the join wizard) — `components/join/OtpStep.tsx`:
   auto-sends `POST /auth/user/signup/otp/send` on mount, renders a 6-digit
   input with paste support, a live countdown from `expiresInSeconds`, and a
   "Resend OTP" action disabled until the countdown reaches zero. Submitting
   calls `POST /auth/user/signup/otp/verify`; on success the returned
   `{ user, token }` is stored via `AuthContext.setSession` (auto-login) and
   the user is redirected to the placeholder `/membership/payment` page.
5. **Global auth** — `context/AuthContext.tsx`: on load, reads the token from
   `localStorage` and calls `GET /auth/user/check-auth` to validate/refresh
   the user; clears the session on failure. Exposes `login`, `loginWithGoogle`,
   and `logout` (the latter always clears client state even if the API call
   fails). `components/auth/AuthGuard.tsx` wraps protected pages and redirects
   to `/login?redirect=<path>` when not authenticated.
6. **Login page** (`/login`) — email/password → `POST /auth/user/login`, plus
   "Continue with Google" via `@react-oauth/google`'s `<GoogleLogin>` (ID-token
   flow) → `POST /auth/user/login/google`. A `NOT_FOUND` response shows a toast
   explaining no membership account exists yet — it does **not** auto-sign the
   person up.
7. **Forgot password** (`/forgot-password`) — step 1 (email) calls
   `POST /auth/user/forgot-password/otp/send`; step 2 (OTP + new password)
   calls `POST /auth/user/forgot-password/otp/verify` and redirects to
   `/login` with a success toast.
8. **Placeholder payment page** (`/membership/payment`) — protected by
   `AuthGuard`, shown immediately after auto-login; Epic 3 replaces its
   contents with the real Cashfree flow.

## What's included (Epic 1)

1. **Home page — club cards**: `components/ClubCards.tsx` fetches `GET /clubs`
   and renders a card per club; each links to `/clubs/[slug]`.
2. **Club detail page** — `app/clubs/[slug]/page.tsx` (server component):
   fetches `GET /clubs/:slug` and renders, in order, Who We Are / What Is
   Unique / Who Should Join / How You Benefit, then What We Offer (purpose,
   features, benefits), then a prominent "Membership Open Now" section with
   a Join button, or a "Membership Closed" state when `membershipOpen` is
   `false`.
3. **Join flow** — `/clubs/[slug]/join`:
   - Step 1, `components/join/MembershipForm.tsx`: validated fields
     (fullName, email, phone, dob, address, occupation) → calls
     `POST /auth/user/signup/start`.
   - Step 2, `components/join/ConsentStep.tsx`: scrollable agreement,
     checkbox + typed-name signature → calls
     `POST /auth/user/signup/consent`.
   - A lightweight step indicator ties the two together; `SignupContext`
     (`context/SignupContext.tsx`) holds `signupSessionId` and flow state.

Every success/failure is surfaced via `react-toastify`. `VALIDATION_ERROR`
responses populate field-level errors when the backend sends an
`error.details` map, and fall back to a single toast otherwise.

## Project structure

```
app/
  layout.tsx                    # fonts, AuthProvider, Header, ToastContainer
  page.tsx                      # Home (Hero, ClubCards, ...)
  login/page.tsx                # Email/password + Google login
  forgot-password/page.tsx      # Two-step password reset
  profile/page.tsx              # Full profile: status, details, documents, payment (AuthGuard)
  clubs/[slug]/page.tsx         # Club detail (server component)
  clubs/[slug]/join/page.tsx    # Join wizard (client component)
  membership/payment/page.tsx   # Cashfree checkout + server-side verify (AuthGuard)
  membership/receipt/page.tsx   # Receipt view + PDF download (AuthGuard)
  membership/documents/page.tsx # Dynamic document + KYC upload flow (AuthGuard)
components/
  Header.tsx                # Sticky nav — Sign In, or Profile + Logout
  ui/                      # Reveal, SectionHeading, IconFrame, LoadingState, etc.
  join/                    # MembershipForm, ConsentStep, OtpStep
  auth/AuthGuard.tsx        # Redirects to /login when not authenticated
  ClubCards.tsx
context/
  AuthContext.tsx          # token + user, synced with localStorage, login/loginWithGoogle/logout
  SignupContext.tsx        # signup wizard state + API calls (form -> consent -> otp)
lib/
  cashfree.d.ts             # ambient types for the Cashfree Checkout JS SDK (loaded via <Script>)
  api/
    types.ts                # types generated from the API contract
    client.ts               # single typed fetch client (envelope + error handling)
```

## Setup

```bash
npm install
cp .env.local.example .env.local   # point at your backend
npm run dev
```

`NEXT_PUBLIC_API_BASE_URL` is used for browser requests (defaults to the
relative path `/api`, i.e. same-origin proxy). `API_BASE_URL` is used for
server-side requests from the club detail page (must be an absolute URL;
falls back to `http://localhost:5000/api`). `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
is required for the Google button on `/login` to render — without it, the
page falls back to a plain-text notice instead of failing.

## Notes / assumptions

- The consent step requires the typed name to match the full name entered
  on the membership form (case-insensitive), since it's standing in as a
  signature for that specific applicant.
- `ApiErrorBody.details` (field → message) isn't spelled out in the
  contract; the client treats it as optional and falls back to a single
  toast built from `error.message` when absent. If your backend uses a
  different shape for field errors, adjust `handleError` in
  `context/SignupContext.tsx`.
- The "Membership Closed" state on `/clubs/[slug]/join` redirects the user
  back to the club page if they land there directly while
  `membershipOpen` is `false`.
- Full build (`npm run build`) was verified in this sandbox except for
  Google Fonts fetching (no external network there) — it will fetch
  normally with real internet access.
- The consent-step's "typed signature" still requires an exact (case
  -insensitive) match to the full name from the membership form.
- `AuthGuard` redirects to `/login?redirect=<path>`; `/login` reads that
  param and returns the user there after a successful login (default `/`).
- The Google login uses `@react-oauth/google`'s `<GoogleLogin>` component
  (ID-token flow), since the contract's `googleIdToken` field expects a
  Google ID token rather than an OAuth access token.
- KYC number "saved" state is session-only: the contract has no endpoint to
  fetch previously-saved `aadharNumber`/`panNumber`, so if a member leaves
  and returns later, they'll need to re-enter and re-save those fields
  before "Submit for Review" re-enables (uploaded files, by contrast, are
  correctly detected as already-done via `GET /user/documents`).
- `/profile` is a minimal placeholder (name + membership status) since it's
  outside this epic's scope but is the documented redirect target after
  document submission — Epic 4 will build it out.
- Cashfree Checkout is embedded (not full-page redirect) into a persistently
  mounted container `div`, per the "embedded is preferable" instruction. The
  client-side result from `cashfree.checkout()` is only used to show a
  toast; payment status always comes from the server-side `verify` call.
- The contract's `rejected` membership status has no accompanying "note"
  field on the `User` object (the admin `approve` endpoint accepts an
  optional note, but it isn't persisted anywhere the user-facing API
  returns), so the rejection state shows a generic message rather than
  inventing a field. If the backend adds a note field, surfacing it is a
  small addition to `StatusBanner` in `app/profile/page.tsx`.
- `/profile`'s edit form is a single toggle covering phone/address/occupation
  together (one Save, one Cancel) rather than per-field inline editing,
  since all three are saved via the same `PATCH` call.
