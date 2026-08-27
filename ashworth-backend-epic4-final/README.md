# Ashworth Club Membership System — Backend (Epic 1)

Express + TypeScript + MongoDB backend implementing the API CONTRACT's
**public clubs**, **user signup flow**, and **user login/session** surfaces.
Admin, payments, documents, and settings are intentionally out of scope for
this epic (stubs/notes only where the contract requires forward-compatible
design, e.g. the two JWT audiences).

## Stack
- Express + TypeScript
- MongoDB / Mongoose
- JWT (`jsonwebtoken`) — two separate secrets/audiences: `userAuth` vs `adminAuth`
- Nodemailer (Gmail App Password) for OTP emails
- bcryptjs for password + OTP hashing
- google-auth-library for verifying Google ID tokens

## Setup

```bash
cp .env.example .env
# fill in MONGO_URI, JWT_USER_SECRET, JWT_ADMIN_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD
npm install
npm run seed   # upserts Club One..Four
npm run dev    # ts-node-dev, http://localhost:5000
```

Health check: `GET /health` → `{ success: true, data: { status: "ok" } }`

All contract routes are mounted under `/api`, e.g. `/api/clubs`, `/api/auth/user/login`.

## Design decisions worth knowing about

**Password field in the signup flow.** The contract's `signup/start` body
lists `clubId, fullName, email, phone, dob, address, occupation,
...otherMembershipFormFields` and never explicitly names a password — yet the
`User` model needs `passwordHash` and `/auth/user/login` is password-based.
Rather than bolt on an extra "set password" screen the contract's flow
diagram doesn't show, `password` is treated as one of the
`...otherMembershipFormFields` and is **required** in `signup/start`'s body.
It's hashed immediately and carried inside the pending `SignupSession.formData`
(never stored in plaintext) until the real `User` is created at
`otp/verify`. This is documented again inline in
`src/models/SignupSession.ts` and `src/controllers/authUserController.ts`.
If the frontend team intends a different UX (e.g. admin-set temp password +
forced reset), this is the one place to change.

**Forgot-password OTP storage.** Stored as an optional, `select: false`
sub-document directly on `User` (`passwordResetOtp: { codeHash, expiresAt,
attempts }`) rather than a separate collection — it's not part of the
contract's public `User` shape and is stripped in `toJSON`. Kept a single
collection for Epic 1's scope; easy to split out later if it needs its own
TTL/indexing story.

**`forgot-password/otp/send` always returns success.** Whether or not the
email belongs to a real account, to avoid leaking account existence through
this endpoint. (Not explicitly specified by the contract; flag this if the
frontend expects a distinguishable "no such account" response instead.)

**OTP lockout.** `otpService.verifyOtp` enforces `OTP_MAX_ATTEMPTS` (default
5) and expiry, throwing the contract's `OTP_INVALID` / `OTP_EXPIRED` codes.
Attempt count increments are persisted by the calling controller (not inside
the service) so `otpService` stays a pure verification utility.

**Two JWT audiences.** `signUserToken`/`signAdminToken` sign against
`JWT_USER_SECRET`/`JWT_ADMIN_SECRET` respectively, each with an explicit
`aud` claim (`userAuth` / `adminAuth`) that's also checked on verify. A user
token can never pass `verifyAdminToken` (wrong secret *and* wrong audience),
and vice versa. Only the user side (`userAuth` middleware) is wired into
routes in this epic; the admin signing helper exists now so Epic 2+ (admin
auth) is a drop-in.

**Token blacklist on logout.** `TokenBlacklist` stores a SHA-256 hash of the
raw JWT (never the token itself) with a TTL index matching the token's own
expiry, so blacklist entries clean themselves up and a DB read never yields a
reusable bearer token.

**Upload provider toggle / Cashfree / Cloudinary.** Referenced in the
contract and present in `.env.example` for config completeness, but no
routes in this epic touch them — those land with Documents (Epic ~2/5) and
Payments (Epic ~2/4). `storageService.ts` is intentionally **not** created
yet to avoid a dead abstraction; the contract's requirement that "every
upload endpoint routes through one internal storage service" will be
honored when those routes are built.

## Endpoints in this epic

### Public — Clubs
- `GET /api/clubs`
- `GET /api/clubs/:slug`

### User signup flow
- `POST /api/auth/user/signup/start`
- `POST /api/auth/user/signup/consent`
- `POST /api/auth/user/signup/otp/send`
- `POST /api/auth/user/signup/otp/verify`

### User login / session
- `POST /api/auth/user/login`
- `POST /api/auth/user/login/google`
- `POST /api/auth/user/forgot-password/otp/send`
- `POST /api/auth/user/forgot-password/otp/verify`
- `POST /api/auth/user/logout` — `[USER AUTH]`
- `GET /api/auth/user/check-auth` — `[USER AUTH]`

## Testing the full flow via curl

```bash
# 1. List clubs, grab an _id
curl http://localhost:5000/api/clubs

# 2. Start signup
curl -X POST http://localhost:5000/api/auth/user/signup/start \
  -H "Content-Type: application/json" \
  -d '{"clubId":"<CLUB_ID>","fullName":"Jane Doe","email":"jane@example.com","phone":"9999999999","dob":"1995-01-01","address":"123 Main St","occupation":"Designer","password":"SuperSecret123"}'
# -> { data: { signupSessionId, status: "consent_pending" } }

# 3. Accept consent
curl -X POST http://localhost:5000/api/auth/user/signup/consent \
  -H "Content-Type: application/json" \
  -d '{"signupSessionId":"<ID>","consentAccepted":true,"consentVersion":"v1","signedName":"Jane Doe"}'

# 4. Send OTP (check the inbox at GMAIL_USER's recipient, i.e. jane@example.com)
curl -X POST http://localhost:5000/api/auth/user/signup/otp/send \
  -H "Content-Type: application/json" \
  -d '{"signupSessionId":"<ID>"}'

# 5. Verify OTP -> creates User, auto-logs in
curl -X POST http://localhost:5000/api/auth/user/signup/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"signupSessionId":"<ID>","otp":"123456"}'
# -> { data: { user, token, status: "payment_pending" } }

# 6. Use the token
curl http://localhost:5000/api/auth/user/check-auth \
  -H "Authorization: Bearer <token>"

# 7. Logout (blacklists the token)
curl -X POST http://localhost:5000/api/auth/user/logout \
  -H "Authorization: Bearer <token>"
```

A ready-to-import Postman collection is at `postman_collection.json` (base
URL variable `baseUrl`, defaults to `http://localhost:5000/api`).

## Not yet built (later epics, per contract)
Admin/Sub-Admin auth and management, roles/permissions, admin settings
endpoints (the Settings *model* and upload-provider toggle mechanism are
built and live — see Epic 2 below — only the `/admin/settings` routes
themselves are pending), and the external auth README hand-off doc.

---

# Epic 2 — Payments, Documents & KYC, Profile

Builds on Epic 1's foundation. Adds Cashfree payments (sandbox), the
storage-provider toggle (Multer/local disk vs Cloudinary), document upload +
KYC, and the user profile aggregate endpoint.

## New env vars actually used now
`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV` (TEST/PROD),
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — all
already present in `.env.example` from Epic 1, now load-bearing.

## New endpoints

### Payments (Cashfree, sandbox)
- `POST /api/membership/payment/create-order` — `[USER AUTH]`
- `POST /api/membership/payment/verify` — `[USER AUTH]`
- `POST /api/membership/payment/webhook` — no auth, Cashfree signature-verified
- `GET /api/membership/receipt` — `[USER AUTH]`
- `GET /api/membership/receipt/download` — `[USER AUTH]`

### Documents & KYC
- `GET /api/user/documents/required-list`
- `POST /api/user/documents/upload` — `[USER AUTH]`, multipart/form-data
- `POST /api/user/documents/kyc-numbers` — `[USER AUTH]`
- `GET /api/user/documents` — `[USER AUTH]`
- `POST /api/user/documents/submit` — `[USER AUTH]`

### Profile
- `GET /api/user/profile` — `[USER AUTH]`
- `PATCH /api/user/profile` — `[USER AUTH]`

## Design decisions worth knowing about

**Cashfree via raw REST calls, not a specific SDK.** `src/services/cashfreeService.ts`
talks to Cashfree's documented Orders API (`/pg/orders`, API version
`2023-08-01`) directly over `axios`, rather than depending on a particular
`cashfree-pg` SDK version's method names — those drift between major
versions and the contract only cares about wire behavior: create an order,
authoritatively fetch its status, and verify webhook signatures. If your
team has a pinned Cashfree SDK version/preference, swapping the internals of
`createCashfreeOrder` / `fetchCashfreeOrderStatus` is a contained change —
callers (`paymentController.ts`) don't need to know the difference.

**Webhook signature verification** implements Cashfree's documented scheme
(`base64(HMAC-SHA256(timestamp + rawBody, secretKey))` via the
`x-webhook-signature` / `x-webhook-timestamp` headers). This is the one
route in the app registered **before** `express.json()` in `app.ts`, using
`express.raw()` instead — the signature must be computed over the exact raw
bytes Cashfree sent, and the global JSON parser would otherwise consume and
re-serialize the body first, silently breaking verification. Double-check
this against Cashfree's current webhook docs for your integration's API
version before going live — signature schemes have changed across Cashfree
API versions in the past.

**Payment idempotency.** `/payment/verify` and the webhook can both race to
mark the same order paid (e.g. user completes payment, closes the tab before
`/verify` fires client-side, webhook lands first). Both paths check
`payment.status !== "paid"` before mutating and check for an existing
Receipt before issuing a new one, so whichever arrives second is a no-op
that still returns a correct response.

**Cashfree order_id.** Generated per attempt as
`order_<userId>_<timestamp>_<random>` rather than reused across retries —
Cashfree order IDs must be unique, and a user can reasonably retry a failed
payment.

**Storage service (`src/services/storageService.ts`).** The single
chokepoint every upload goes through. It reads `Settings.uploadProvider`
**at call time** (not at server boot), so flipping the toggle takes effect
on the very next upload with no restart needed. Multer is wired as
`memoryStorage()` only (`src/middleware/uploadMemory.ts`) — it never writes
to disk itself; it just parses the multipart body into a buffer, which is
then handed to `uploadFile()`. Local-disk and Cloudinary paths mirror the
same folder structure (`documents/aadhar`, `documents/pan`) so the two
providers stay organizationally consistent, and the returned shape
(`{ fileUrl, storageProvider }`) is identical either way — no controller
branches on which provider is active.

**Uploaded file validation.** `uploadMemory.ts` restricts MIME types to
`jpeg/png/webp/pdf` and caps size at 10MB, and `storageService.ts` strips any
extension outside a known-safe allowlist when generating filenames. Not
specified by the contract — tune these limits if your KYC documents need a
different ceiling.

**Document re-upload semantics.** `Document` has a unique index on
`(userId, documentType)`; re-uploading a type (e.g. a blurry Aadhar photo)
upserts in place and resets `verified`/`verifiedBy`/`verifiedAt`, rather than
accumulating historical duplicates. If Admin needs an audit trail of
replaced documents later, this is the point to revisit.

**KYC numbers live on `User.kyc`**, not a separate collection — one record
per user, always needed alongside the user doc itself (e.g. at
`documents/submit` time), so a join would add cost for no benefit. It's
stripped from `User`'s `toJSON` (matching the contract's `User` shape, which
doesn't list it) — internal code reads it straight off the Mongoose
document. Numbers can arrive either inline with the first `/upload` call or
via the dedicated `/kyc-numbers` endpoint, per the contract's either/or
wording; not currently masked/redacted anywhere since Admin views (Epic 3+)
will need the real values, but flag it if display masking should happen
sooner.

**Receipt PDF + numbering.** Generated with `pdfkit` (no headless browser
dependency) to `uploads/receipts/<receiptNumber>.pdf`. Receipt numbers are
`RCPT-YYYYMMDD-NNNN`, sequenced by counting today's receipts at issue time —
simple and human-legible; swap for a dedicated atomic counter collection if
true monotonic sequencing under concurrency ever becomes a real requirement.
`GET /receipt/download` streams this file directly; it is **not** routed
through the storage-provider toggle (receipts aren't user-uploaded KYC
documents, so multer/Cloudinary's toggle doesn't apply to them) — flag this
if you'd rather receipts also live in Cloudinary for durability/CDN reasons.

**`/user/profile` aggregation** issues three parallel queries (club,
documents, latest receipt) rather than a single aggregation pipeline — the
collections are small per-user and this keeps each query trivially readable;
revisit if profile load ever needs to be a single round-trip.

## Testing the payment + documents flow via curl

```bash
# Assumes you already have a user token from the Epic 1 signup/login flow.
TOKEN="<user-jwt>"

# 1. Create a Cashfree sandbox order
curl -X POST http://localhost:5000/api/membership/payment/create-order \
  -H "Authorization: Bearer $TOKEN"
# -> { data: { cfOrderId, paymentSessionId, orderAmount, currency } }
# Use paymentSessionId with Cashfree's client-side checkout SDK/drop-in to
# actually complete a sandbox payment, then:

# 2. Verify payment (authoritative check against Cashfree)
curl -X POST http://localhost:5000/api/membership/payment/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cfOrderId":"<cfOrderId from step 1>"}'
# -> { data: { status: "paid", membershipStatus: "documents_pending", receipt } }

# 3. Download the receipt
curl -OJ http://localhost:5000/api/membership/receipt/download \
  -H "Authorization: Bearer $TOKEN"

# 4. Required document/KYC list
curl http://localhost:5000/api/user/documents/required-list

# 5. Upload a document
curl -X POST http://localhost:5000/api/user/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "documentType=aadhar_front" \
  -F "aadharNumber=123412341234" \
  -F "file=@/path/to/aadhar-front.jpg"

# (repeat for aadhar_back, pan_front, and pan_number via /kyc-numbers if not
#  sent inline with an upload)
curl -X POST http://localhost:5000/api/user/documents/kyc-numbers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"panNumber":"ABCDE1234F"}'

# 6. Submit once everything required is present
curl -X POST http://localhost:5000/api/user/documents/submit \
  -H "Authorization: Bearer $TOKEN"
# -> { data: { membershipStatus: "pending_approval" } }

# 7. Full profile aggregate
curl http://localhost:5000/api/user/profile -H "Authorization: Bearer $TOKEN"
```

Cashfree's webhook can't be triggered via curl meaningfully (it needs a
valid signature computed with your real `CASHFREE_SECRET_KEY` over the exact
raw body) — test it either via Cashfree's sandbox dashboard's "resend
webhook" tooling, or by pointing your local server through a tunnel (ngrok
etc.) and completing a real sandbox payment.

## Not yet built (previously listed as next epic — now built, see Epic 3 below)
~~Admin/Sub-Admin auth and management~~, ~~admin document verification and
membership approval~~ — done. Still pending: roles/sub-admins CRUD
(`/admin/roles`, `/admin/subadmins`), clubs management (`/admin/clubs`),
`/admin/settings` routes, and the external auth README hand-off doc.

---

# Epic 3 — Admin Auth, Permission Middleware, Users Management

Builds on Epics 1–2. Adds admin/sub-admin authentication (a second JWT
audience, `adminAuth`), a permission-checking middleware driven by `Role`
documents, and the full Admin Users Management surface.

## New models
- **`AdminAccount`** — `name, email (unique within this collection only),
  passwordHash, type ("admin"|"sub_admin"), roleId (null for "admin")`.
  Deliberately allowed to duplicate a `User`'s email (contract requirement)
  — uniqueness is enforced at the DB level scoped to this collection, never
  cross-checked against `User`.
- **`Role`** — `name, permissions` (matches the contract's `PermissionMap`
  checkbox-grid shape exactly: `users`, `clubs`, `payments`, `settings`,
  each with their own boolean actions).
- **`User.reviewNote`** — added so `PATCH .../membership/approve` has
  somewhere to persist the optional `note` on approve/reject.

## Bootstrapping the super admin
There's no signup UI for admins, so the first "admin"-type (super admin)
account is created via a seed script, not an endpoint:

```bash
SUPER_ADMIN_EMAIL=you@ashworthclub.com SUPER_ADMIN_PASSWORD='SomethingStrong123!' npm run seed:admin
```

Omit the env vars for a local throwaway default
(`admin@ashworthclub.test` / `ChangeMeNow123!`) — the script warns loudly
when it falls back to that default. Safe to re-run (upserts by email).

**For testing the permission middleware specifically** (this epic's stated
acceptance bar — confirm 403s behave correctly with a deliberately
restricted sub-admin), a second script seeds one sub-admin scoped to
`users.view` only, with everything else `false`:

```bash
npm run seed:subadmin
```

This is a testing convenience standing in for the `/admin/subadmins` +
`/admin/roles` CRUD endpoints, which are Epic 4's job (roles/sub-admins
management), not this epic's.

## New endpoints

### Admin/Sub-Admin auth
- `POST /api/auth/admin/login`
- `GET /api/auth/admin/check-auth` — `[ADMIN AUTH]`
- `POST /api/auth/admin/logout` — `[ADMIN AUTH]`
- `POST /api/auth/admin/forgot-password/otp/send`
- `POST /api/auth/admin/forgot-password/otp/verify`

### Admin — Users Management
- `GET /api/admin/users` — `[permission: users.view]` — `?status=&clubId=&search=`
- `GET /api/admin/users/:id` — `[permission: users.view]`
- `POST /api/admin/users` — `[permission: users.add]`
- `PATCH /api/admin/users/:id` — `[permission: users.update]`
- `DELETE /api/admin/users/:id` — `[permission: users.delete]`
- `PATCH /api/admin/users/:id/documents/:docId/verify` — `[permission: users.verifyDocuments]`
- `PATCH /api/admin/users/:id/membership/approve` — `[permission: users.approveMembership]`
- `GET /api/admin/users/:id/payments` — `[permission: users.view]`

## Design decisions worth knowing about

**Permission checks re-fetch from the DB, not from the JWT.** The admin
token *does* embed `role` + `permissions` at login time (per the epic's
instructions, so a downstream check doesn't strictly need a DB hit) — but
`requirePermission.ts` deliberately re-fetches the `AdminAccount` and its
`Role` fresh on every permission-gated request rather than trusting that
cached copy. The instructions themselves flagged the staleness risk if a
role is edited mid-session and called it an acceptable tradeoff to accept
stale permissions for token lifetime; I chose the other side of that
tradeoff instead, since a single indexed `findById` is cheap and closing a
security hole (an admin whose access was just revoked keeps acting on old
permissions for up to 24h) seemed worth it. The embedded JWT permissions are
effectively unused right now — flag this if you'd rather optimize for fewer
DB round-trips and accept the staleness window instead; reverting is a
small, contained change in `requirePermission.ts`.

**`requirePermission("x.y")` is an array, not a single middleware.** It
returns `[adminAuth, checker]` so a route just spreads it:
`router.get("/", ...requirePermission("users.view"), listUsers)`. This
composes admin-token verification and the permission check into one call
site rather than requiring both `adminAuth` and a separate checker to be
listed on every route.

**Super admin (`type: "admin"`) always passes every permission check** with
no `Role` lookup at all — per the contract, a `roleId: null` "admin" account
has full, unrestricted access and permission checks don't apply to it.

**AdminAccount ↔ User email uniqueness.** Enforced ONLY within
`AdminAccount` (a unique index on that collection) and explicitly never
checked against `User` — the contract requires an admin's email be allowed
to duplicate a user's email, and this is why `adminLogin` looks up
`AdminAccount` and `userLogin` looks up `User`, two entirely separate
lookups that never cross-reference each other.

**`membership/approve` is a strict state transition, not a free-form
setter.** It only succeeds when the user's current `membershipStatus` is
exactly `"pending_approval"` — calling it on a user in any other state
returns `CONFLICT` rather than silently overwriting their status. This
matches the contract's framing ("only meaningfully transitions...") as a
hard guard rather than a soft no-op, since a silent no-op could hide an
admin's mistake (e.g. re-approving someone already `"approved"`).

**Document verification notes aren't persisted.** The contract's `Document`
shape has no field for a verification note, so `note` in
`.../documents/:docId/verify`'s body is accepted (per this epic's spec) but
neither stored nor echoed back — the response is the `Document` object
itself, matching the contract's return type exactly. If an audit trail of
verification notes becomes a real requirement, add a field to `Document`
for it; right now writing it anywhere would mean inventing an undocumented
response shape.

**Deleting a user cascades.** `DELETE /admin/users/:id` also removes that
user's `Document`, `Payment`, and `Receipt` records — not specified by the
contract, but leaving them orphaned (referencing a deleted `userId`) seemed
worse than a small, contained cascade. Flag this if soft-delete /
retention-for-audit is actually wanted instead of a hard cascade delete.

**Admin-created users (`POST /admin/users`) skip OTP entirely** and are
marked `emailVerified: true` immediately, with a synthetic `consent` record
(`consentVersion: "admin-created"`) since the contract's `User.consent`
shape has no "N/A" state — an admin manually adding someone hasn't gone
through the consent-signing UI, so this is a clearly-labeled placeholder
rather than fabricating a signature that didn't happen. Flag this if legal/
compliance wants a different treatment for admin-added members who never
saw the consent screen.

## Testing the permission boundary (this epic's stated acceptance bar)

```bash
# 1. Bootstrap both accounts
npm run seed:admin
npm run seed:subadmin

# 2. Log in as super admin — should be able to do everything
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ashworthclub.test","password":"ChangeMeNow123!"}'
# -> { data: { admin, token } }
SUPER_TOKEN="<token from above>"

curl http://localhost:5000/api/admin/users -H "Authorization: Bearer $SUPER_TOKEN"
# -> 200, full list

# 3. Log in as the restricted sub-admin (users.view only)
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"subadmin@ashworthclub.test","password":"ChangeMeNow123!"}'
SUB_TOKEN="<token from above>"

curl http://localhost:5000/api/admin/users -H "Authorization: Bearer $SUB_TOKEN"
# -> 200, allowed (users.view is true for this seeded role)

curl -X DELETE http://localhost:5000/api/admin/users/<some-user-id> \
  -H "Authorization: Bearer $SUB_TOKEN"
# -> 403 FORBIDDEN, error.code "FORBIDDEN" — users.delete is false for this role

# 4. Confirm a USER token can never authorize an admin route
curl http://localhost:5000/api/admin/users -H "Authorization: Bearer <a user JWT>"
# -> 401 UNAUTHORIZED (wrong secret AND wrong `aud` claim — verifyAdminToken
#    rejects it outright, it never even reaches the permission check)
```

## Not yet built (previously listed as next epic — now built, see Epic 4 below)
~~`/admin/clubs` management~~, ~~`/admin/roles` + `/admin/subadmins`
CRUD~~, ~~`/admin/settings`~~ — all done. The contract is now fully
implemented end to end.

---

# Epic 4 — Clubs Management, Payments Overview, Roles & Sub-Admins,
# Settings, Validation Pass, External Auth Docs

The final epic. Rounds out every remaining contract endpoint, adds
request-body validation (Zod) across the entire app, tightens CORS for two
independent frontends, and ships the standalone external-auth handoff doc.

## New endpoints

### Admin — Clubs Management
- `GET /api/admin/clubs` — `[permission: clubs.view]`
- `POST /api/admin/clubs` — `[permission: clubs.add]`
- `PATCH /api/admin/clubs/:id` — `[permission: clubs.update]`
- `DELETE /api/admin/clubs/:id` — `[permission: clubs.delete]`

### Admin — Payments Overview
- `GET /api/admin/payments` — `[permission: payments.view]` — `?clubId=&dateFrom=&dateTo=`

### Admin — Roles & Sub-Admins (super-admin only, see below)
- `GET /api/admin/roles`, `POST /api/admin/roles`, `PATCH /api/admin/roles/:id`, `DELETE /api/admin/roles/:id`
- `GET /api/admin/subadmins`, `POST /api/admin/subadmins`, `PATCH /api/admin/subadmins/:id`, `DELETE /api/admin/subadmins/:id`

### Admin — Settings
- `GET /api/admin/settings` — `[permission: settings.view]`
- `PATCH /api/admin/settings/upload-provider` — `[permission: settings.update]`

### External auth documentation
See **`EXTERNAL_AUTH_API.md`** — a standalone handoff doc for the separate
Membership-Specific website's developer, covering exactly the three
endpoints from the contract's Section 12 (login, check-auth, logout) with
plain request/response shapes and no internal implementation details. Send
them that file directly; it doesn't assume they've read this README.

## Design decisions worth knowing about

**Roles & Sub-Admins get a separate `requireSuperAdmin` middleware, not
`requirePermission`.** This is deliberate and load-bearing, not just a
convenience: if role/sub-admin management were gated by an ordinary
permission flag (e.g. some hypothetical `admins.manage`), a super admin
could accidentally grant a sub-admin the ability to create *other*
sub-admins or edit *any* role — including the very role that sub-admin is
assigned to, which would let them grant themselves more permissions than
they started with. `requireSuperAdmin` (`middleware/requireSuperAdmin.ts`)
sidesteps the whole category of bug by checking `AdminAccount.type ===
"admin"` directly, completely independent of the `Role`/permission-map
machinery. Like `requirePermission`, it re-fetches the account's current
`type` from the DB on every request rather than trusting the JWT — an admin
downgraded to sub_admin mid-session loses super-admin access immediately.

**Validation is now on every POST/PATCH body in the app, via Zod
(`src/utils/schemas.ts` + `src/middleware/validate.ts`)**, not just the
routes built in this epic — Epics 1–3's routes were retrofitted with
`validateBody`/`validateQuery` too, so every route in the app reports
`VALIDATION_ERROR` through the same envelope for bad input, consistently.
One schema per request shape, grouped by route file in `schemas.ts` for
discoverability.

**Club create/update accepts either a file upload or a plain URL string for
`heroImageUrl`.** `POST`/`PATCH /admin/clubs` can be called as ordinary
JSON (`heroImageUrl` as a string, if the image is already hosted somewhere)
OR as `multipart/form-data` with a `heroImage` file field — if a file is
present, it's routed through `storageService.uploadFile()` (never handled
directly in the controller, per the contract's storage-service requirement)
and its resulting URL wins over any `heroImageUrl` string in the body.
Because multipart has no native way to express nested JSON objects,
`membershipFee` and `whatWeOffer` have to travel as JSON-stringified form
fields in that case — `middleware/parseJsonFields.ts` parses those specific
fields back into objects before validation runs, and is a no-op for a plain
JSON request where they already arrive as real objects.

**`PATCH /admin/clubs/:id` is the fee-change endpoint** — the contract
calls this out explicitly ("this is the endpoint the admin uses to change a
club's fixed membership fee"), and there's no special-casing for it:
`membershipFee.amount` flows through like any other editable field. Partial
`membershipFee`/`whatWeOffer` objects are deep-merged onto the existing
sub-document (via `.partial()` Zod schemas + an object-spread merge in the
controller) rather than replacing the whole nested object — so
`PATCH { membershipFee: { amount: 30000 } }` doesn't accidentally wipe out
`currency`.

**Admin payments overview lists `Receipt`s, not raw `Payment`s.** Receipts
already carry `memberName`/`clubName` denormalized at issue time (see
Epic 2's `receiptService.ts`), so no joins are needed for the listing
itself; `clubId` filtering goes through the originating `Payment` record
(via `Payment.find({ clubId }).distinct("_id")`) since `Receipt` doesn't
store `clubId` directly. One thing flagged in the code: the `downloadUrl`
field in this listing points at the same route as the member-facing
receipt download (`GET /membership/receipt/download`, `[USER AUTH]`) — but
that route is scoped to "the currently authenticated user's own receipt"
with no `:id`, so it is **not** actually usable by an admin to fetch an
arbitrary member's PDF (an admin token would get `401` there, since that
route requires a *user* token). It's informational-only in this listing.
If Admin genuinely needs to download a specific member's receipt, that's a
new contract endpoint (e.g. `GET /admin/users/:id/receipts/:receiptId/download`)
this shape can't express today — flag it if that's actually needed.

**Sub-admin email uniqueness** is checked against ALL `AdminAccount`
documents (both `admin` and `sub_admin` types) — per the contract, admin
and sub-admin emails must be globally unique against each other — and
explicitly NOT checked against `User` at all, since a sub-admin's email is
allowed to duplicate a member's.

**CORS now uses an explicit origin allowlist** (`CORS_ORIGINS` env var,
comma-separated) instead of a bare `cors()` call that reflects any origin.
Needs to include both frontend origins (the member-facing site and the
admin panel) since they're independent apps — see the updated
`.env.example`. `"*"` is still supported as an explicit opt-in for early
local dev, but should be replaced with real origins before anything is
actually deployed.

## Confirming wrong-token-type rejection (explicit checks, per this epic's ask)

```bash
# Get one of each token type first.
USER_TOKEN="<token from POST /api/auth/user/login>"
ADMIN_TOKEN="<token from POST /api/auth/admin/login>"

# 1. A USER token must never authorize an admin-gated route.
curl -i http://localhost:5000/api/admin/users -H "Authorization: Bearer $USER_TOKEN"
# Expect: HTTP 401, { "success": false, "error": { "code": "UNAUTHORIZED", ... } }
# (verifyAdminToken rejects it outright — wrong secret AND wrong `aud` claim
#  — it never reaches the permission check.)

# 2. An ADMIN token must never authorize a user-gated route.
curl -i http://localhost:5000/api/auth/user/check-auth -H "Authorization: Bearer $ADMIN_TOKEN"
# Expect: HTTP 401, { "success": false, "error": { "code": "UNAUTHORIZED", ... } }
# (verifyUserToken rejects it the same way, symmetrically.)

# 3. A sub-admin token WITHOUT the required permission must 403, not 401.
SUB_TOKEN="<token from a sub-admin login, e.g. the seeded one from Epic 3>"
curl -i http://localhost:5000/api/admin/roles -H "Authorization: Bearer $SUB_TOKEN"
# Expect: HTTP 403, { "success": false, "error": { "code": "FORBIDDEN", ... } }
# (requireSuperAdmin — this route is off-limits to every sub-admin, no
#  permission flag can grant it.)
```

## Final-pass status
Every path/method/field-name/response-shape in the contract (Sections 1–12)
has been cross-checked against this implementation. `Role`/`AdminAccount`
uniqueness rules, the two JWT audiences, the storage-provider toggle's
live-read behavior, and the error envelope are consistent across all four
epics. `EXTERNAL_AUTH_API.md` is ready to hand off as-is.

**Not run in this environment:** `npm install` / `tsc` / an actual live
Cashfree sandbox round-trip — no network access here. Please run
`npm install && npm run build` (and a `tsc --noEmit` pass is worth doing on
its own) before treating this as deploy-ready, and exercise the Cashfree
webhook against a real sandbox account per Epic 2's README notes.
