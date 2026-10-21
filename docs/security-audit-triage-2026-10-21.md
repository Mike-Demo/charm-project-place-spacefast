# Security audit triage — 2026-10-21

Issue creation is unavailable in this session. The following issue titles and bodies are ready to file. Confirmed findings are ordered by severity and reachability from lower-trust callers; the two medium findings are ordered by direct impact and fix scope. No findings are grouped because they have distinct root causes.

## Prioritized remediation issues

### 1. `[security][high] Gate booking access-token and PII RPCs`

**Parent:** #1

**Finding:** `anon-rpc-exposes-access-token-and-pii-by-id`

**Evidence:** `get_booking_token` and `get_confirmed_booking` are `SECURITY DEFINER` RPCs granted to `anon`. They filter by booking UUID and confirmed/paid status without requiring authentication, `hold_secret`, or `access_token`; later migrations 0006–0013 do not revoke the grants. The returned `access_token` is a private bearer credential used by token-protected booking and idea operations, and the response also includes booking PII. Booking UUIDs are not secrets in this design.

**Root cause:** These two RPCs expose sensitive booking credentials and details based only on a booking UUID, unlike the other sensitive hold RPCs which require `hold_secret`.

**Smallest fix:** Revoke `EXECUTE` on both RPCs from `anon` and `authenticated`. Return the `access_token` only through a `hold_secret`-gated path and have clients fetch booking details through a token-based lookup such as `get_booking_by_token`.

### 2. `[security][medium] Require a hold secret to release pending appointments`

**Parent:** #1

**Finding:** `release-pending-appointment-missing-hold-secret`

**Evidence:** `release_pending_appointment` (migration 0002:52–57) is `SECURITY DEFINER`, accepts no `p_secret`, and is executable by `anon`/`authenticated`. It expires a pending appointment by UUID alone. The impact is bounded to pending holds, but UUIDs are not secret and may be exposed through webhook fan-out or shared checkout URLs.

**Root cause:** The RPC updates `status` and `payment_status` to `expired` for a matching pending appointment without a secret, token, or ownership check; sibling hold operations require `hold_secret`.

**Smallest fix:** Add a `p_secret` parameter and check it against `appointments.hold_secret`, mirroring `confirm_free_hold` in migration 0013, then update the atelier-service caller. Alternatively, revoke anonymous execution and route release through a server function that verifies the hold secret.

### 3. `[security][medium] Verify and govern agent API key issuance`

**Parent:** #1

**Finding:** `unauthenticated-agent-api-key-minting`

**Evidence:** `POST /api/public/agent-keys` accepts a syntactically valid email and returns a fresh `fk_` key without authentication or email verification. No per-email cap, expiry, or revocation path is described in the route or shared public API module. Each key receives the higher keyed quota (600 reads/minute and 30 writes/hour, versus 60 reads/minute and 5 writes/hour anonymously), and issuance is unbounded.

**Root cause:** Anyone can mint a bearer API key by submitting an unverified email address; the keyed quota is applied per key rather than per verified identity.

**Smallest fix:** Require proof of email ownership before activating a key, cap keys per verified email, add expiry/revocation, and apply write quotas per verified identity as well as per key.

### 4. `[security][low] Escape booking fields in ICS exports`

**Parent:** #1

**Finding:** `ics-crlf-injection-via-booking-fields`

**Evidence:** Booking inputs accept arbitrary text within length limits, with no control-character rejection in the input schemas or `create_pending_appointment` SQL. Those fields persist on appointments, and `buildIcs` interpolates them raw between CRLF delimiters. The studio admin exports all upcoming bookings as one ICS, crossing booking principals. Calendar-client impact varies; the confirmed defect is missing RFC 5545 text escaping.

**Root cause:** Booker-controlled name, phone, and email values are included unescaped in ICS text fields, allowing CR/LF and other special characters to alter the exported calendar content.

**Smallest fix:** Escape ICS text values in `buildIcs` (backslash-escape backslash, semicolon, and comma; strip or encode CR/LF per RFC 5545) and reject control characters in booking name/phone inputs.

## Needs-validation checklist issue

### `[security][needs-validation] Audit leads to validate`

**Parent:** #1

Validate each lead and record the missing deployment fact. These are not confirmed findings and have no severity assigned.

- [ ] **Paddle webhook sandbox/live environment confusion** (`paddle-webhook-sandbox-environment-confusion`)
  - **Claimed root cause:** POST `/api/public/payments/webhook?env=sandbox` (default is sandbox when the parameter is absent) with a `TransactionCompleted` event whose `customData.appointmentId` names any pending/expired appointment — Only real (live) payments should move a booking to `status='confirmed'`, `payment_status='paid'`; sandbox/test transactions must never mutate production…
  - **Exact missing fact:** Whether the production deployment has `PAYMENTS_SANDBOX_WEBHOOK_SECRET` / `PADDLE_SANDBOX_API_KEY` configured AND a reachable sandbox checkout (e.g. a preview/test-token deployment sharing the same production database) through which an attacker can generate a genuine Paddle sandbox `TransactionCompleted` whose `customData.appointmentId` names a production…

- [ ] **AI sketch endpoint Origin check and quota abuse** (`sketch-endpoint-origin-check-and-quota-abuse`)
  - **Claimed root cause:** POST `/api/sketch-concept` with Origin set to the site's own origin and a JPG/PNG/WEBP up to 10 MB; each call runs an image edit through the Lovable AI gateway with the server-side `LOVABLE_API_KEY`. Concept sketches are a courtesy for genuine booking-flow visitors, metered at 6/day per client IP and 150/day globally (`consume_sketch_quota`).
  - **Exact missing fact:** Whether the deployment's edge overwrites `cf-connecting-ip` and strips/replaces inbound `X-Forwarded-For` for `/api/sketch-concept` — if it does not, a scripted caller can rotate the per-client quota key and exhaust the shared 150/day global quota; if it does, per-client abuse is capped at 6/day per real IP.

- [ ] **Spoofable caller identity and rate-limit bypass** (`spoofable-caller-identity-rate-limit-bypass`)
  - **Claimed root cause:** Send REST / MCP / sketch requests with a rotating `X-Forwarded-For` (or `cf-connecting-ip`) header; `identifyCaller()`, `callerHash()` and the sketch quota all hash the first header value they see, and the MCP route applies no shared `rateLimit()` at all — Per-IP quotas are the only containment for unauthenticated writes: 5 writes/hour (REST holds, agent-ke…
  - **Exact missing fact:** Whether the actual hosting edge for this deployment (Cloudflare, SpaceFast, or other) always overwrites `cf-connecting-ip` with the true connection IP and strips/replaces inbound `X-Forwarded-For` before requests reach the server handlers — an owner-observed edge-configuration fact.

- [ ] **Unauthenticated webhook subscription SSRF** (`ssrf-via-webhook-subscription-url`)
  - **Claimed root cause:** POST `/api/public/webhooks` with `{url: <attacker-chosen URL>}` — input is only `z.string().url().max(500)`; no scheme allowlist, no private/loopback/link-local IP block, no redirect control — Server-side outbound requests should only go to public subscriber endpoints, never to internal, loopback, or cloud-metadata addresses.
  - **Exact missing fact:** Whether the production deployment's server runtime has network reachability to loopback/private/link-local/cloud-metadata addresses and no egress filtering — i.e. an owner-observed deployment/network check (or a bounded local harness pointing a subscription at a loopback listener) showing the delivery fetch actually reaches an internal address.
