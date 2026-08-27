# Ashworth Club — Auth API (for the Membership-Specific website)

This document covers the three endpoints your site needs to let a member
log in and stay logged in. It's the external-facing subset of a larger API
— you only need what's below.

## Base URL

```
https://<ashworth-club-api-host>/api
```

(Ask the Ashworth team for the actual host per environment — local, staging,
production.)

## Response format

Every response comes back as JSON in one of two shapes:

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "error": { "code": "SOME_CODE", "message": "Human-readable explanation" } }
```

Possible error codes you may see on these three endpoints: `VALIDATION_ERROR`
(bad/missing request fields), `UNAUTHORIZED` (bad credentials, or an
invalid/expired/revoked token), `SERVER_ERROR` (something went wrong on our
end). Always check `success` before reading `data`.

---

## 1. Log in

```
POST /auth/user/login
Content-Type: application/json
```

**Request body:**
```json
{ "email": "member@example.com", "password": "their-password" }
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "clubId": "...",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9999999999",
      "dob": "1995-01-01T00:00:00.000Z",
      "address": "123 Main St",
      "occupation": "Designer",
      "emailVerified": true,
      "membershipStatus": "approved",
      "consent": {
        "accepted": true,
        "consentVersion": "v1",
        "signedName": "Jane Doe",
        "acceptedAt": "2026-01-10T12:00:00.000Z"
      },
      "createdAt": "2026-01-10T12:00:00.000Z",
      "updatedAt": "2026-01-10T12:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

`membershipStatus` will be one of: `payment_pending`, `documents_pending`,
`pending_approval`, `approved`, `rejected`. Use it if your site needs to
show different content based on where the member is in the membership
process.

**Error response (401):** wrong email/password —
`{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid email or password" } }`

**Store `token`** (e.g. in an HttpOnly cookie, or wherever your app keeps
session state) — you'll need it for every subsequent authenticated request.

---

## 2. Check the current session

```
GET /auth/user/check-auth
Authorization: Bearer <token>
```

No request body. Call this whenever your site needs to confirm a stored
token is still valid — e.g. on page load, to decide whether to show a
logged-in or logged-out state.

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* same User shape as above */ }
  }
}
```

**Error response (401)** — token missing, malformed, expired, or has been
logged out elsewhere:
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid token" } }
```

Treat any `UNAUTHORIZED` here as "not logged in" and redirect to your login
flow — don't try to distinguish the sub-reasons, they're not meant to be
shown to the end user differently.

---

## 3. Log out

```
POST /auth/user/logout
Authorization: Bearer <token>
```

No request body. This invalidates the token server-side (it's added to a
blacklist), so even if your site fails to delete its local copy, the token
itself can't be reused for further API calls.

**Success response (200):**
```json
{ "success": true, "data": { "message": "Logged out" } }
```

**Your site should ALSO discard its own stored copy of the token** (cookie/
localStorage/wherever it's kept) right after this call — don't rely on the
server-side blacklist alone.

---

## Sending the token

Every authenticated request (just `check-auth` and `logout` in this
document, but the same pattern holds for the rest of the API) needs the
token in a standard `Authorization` header:

```
Authorization: Bearer <token>
```

There is no separate refresh-token flow — the token is valid for 24 hours
from login. When it expires, `check-auth` will start returning
`UNAUTHORIZED` and the member needs to log in again via endpoint 1.

## What NOT to build against

This token is specifically for members (`userAuth`). It is a completely
separate token type from the Ashworth admin panel's login — an admin token
will never work against these three endpoints, and this member token will
never work against any `/admin/*` route. If your site ever needs
admin-level access to anything, that's a different conversation entirely —
flag it with the Ashworth team rather than trying to reuse this flow.
