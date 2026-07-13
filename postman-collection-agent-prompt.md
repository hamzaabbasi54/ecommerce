# Task: Generate an Accurate Postman Collection by Inspecting the Actual Codebase

## Critical Ground Rule

Do **not** treat any pasted documentation, prior AI-generated notes, or the Prisma schema summary as ground truth. Treat them only as a *starting hypothesis* of what might exist. Every endpoint, field name, auth mechanism, and status code in the final collection must be verified directly against the source code in this repository. If something in a prior doc conflicts with what you find in the code, **the code wins** — and you must flag the conflict in your final report.

This matters because two different AI tools have already produced conflicting assumptions about this API (e.g., one assumed Bearer token auth, another assumed HTTP-only cookie auth). Only the actual auth middleware/route code can resolve which one is true.

## Phase 1 — Investigation (do this before writing any Postman JSON)

1. **Locate every API route file** in the codebase (e.g. `app/api/**/route.ts`, `pages/api/**`, or Express `routes/*.js` — confirm which pattern this project actually uses via `package.json` / folder structure). Do not rely on a fixed endpoint list — walk the actual route tree and find everything, including anything not mentioned in any prior document.

2. **For every route found, extract from the actual code:**
   - Exact path and HTTP method
   - Auth requirement: public, logged-in user, or admin-only — and confirm the *mechanism* (cookie, Bearer header, or both) by reading the actual auth middleware/helper function
   - Request body schema — read the actual validation logic (Zod/Yup/manual checks) rather than guessing field names. Cross-check field names against the real Prisma schema in this repo (not the pasted one) — e.g. confirm whether address fields are `street/city/state/zipCode` or `street/city/province/postalCode`, whether reset password uses `password` or something else, etc.
   - Query parameters actually read from `request.nextUrl.searchParams` / `req.query` (e.g. confirm exactly which of `page`, `limit`, `search`, `category`, `brand`, `minPrice`, `maxPrice`, `sort` are genuinely implemented on `GET /api/products` — don't assume all of them exist just because a prior doc listed them)
   - Response shape on success and on error — confirm it actually matches the PRD's required format:
     ```json
     { "success": true, "message": "...", "data": [] }
     { "success": false, "message": "..." }
     ```
     Flag any endpoint that doesn't follow this format.
   - Actual HTTP status codes returned (200/201/400/401/403/404/409/422/500) — confirm these against the code, not assumed defaults.

3. **Confirm the real values for role-based access** — verify the `Role` enum values in the actual schema and how admin checks are implemented (e.g. `role === "ADMIN"` vs something else), so admin test requests use a valid account.

4. **Confirm checkout scope** — the client has been told by their supervisor to implement **COD only, no payment gateway**. Verify in the actual `orders` route code whether `paymentMethod` still accepts values like `"card"`/`"stripe"` (leftover/unused) or has genuinely been restricted to `"COD"` only. Report this as a discrepancy if the code still allows non-COD values.

5. **Check for endpoints the PRD requires but that may not exist yet**, and report their absence rather than inventing them:
   - `PUT /api/orders/[id]/cancel` or equivalent (user-side order cancellation — PRD Section 20)
   - Shipping charge and tax calculation logic (PRD Section 19) — is this computed server-side in the order creation route, or hardcoded/missing?
   - Any billing-vs-shipping address distinction (should be absent/unnecessary now, given COD-only scope — confirm this is actually the case in code)

6. **Check for route duplication** — confirm whether both `/api/user/*` and `/api/users/*` prefixes are still live in the code, or whether one has been deprecated/removed since this was last flagged.

## Phase 2 — Build the Postman Collection

Once investigation is complete and every endpoint is verified against real code:

1. Output a valid **Postman Collection v2.1 JSON** file.
2. Organize folders by PRD module: Auth, User & Profile, Addresses, Products, Categories, Brands, Cart, Wishlist, Reviews, Orders & Checkout, Admin (with sub-folders: Dashboard, Users, Products, Categories, Brands, Orders, Coupons, Reviews).
3. Use collection variables — do not hardcode:
   - `base_url`
   - Auth variable(s) matching the **actual verified mechanism** — if cookie-based, configure requests to rely on Postman's cookie jar (triggered by the Login request) rather than a Bearer header; if Bearer-based, use `{{token}}` / `{{admin_token}}` as appropriate; if hybrid, document that clearly.
4. On the Login request, add a test script that captures/persists whatever the real mechanism requires (token variable, or confirm cookie auto-save is sufficient).
5. For every request body, use the **real field names** confirmed in Phase 1 — not placeholders guessed from any prior document.
6. For each endpoint, include realistic example bodies AND, where relevant, a second saved example showing a deliberately invalid request (missing field / bad token / wrong role) so the collection itself demonstrates the PRD's mandatory error-case testing (Section 10: validation errors, unauthorized requests, invalid inputs).

## Phase 3 — Deliverables

Produce two outputs:

1. **`ECommerce-API.postman_collection.json`** — the verified, accurate collection.
2. **`postman-discrepancy-report.md`** — a short report listing:
   - Any endpoint present in code but missing from prior documentation (or vice versa)
   - The confirmed auth mechanism (cookie vs Bearer vs hybrid) and why
   - Any field-name mismatches found between the pasted Prisma schema and the actual schema in this repo
   - Confirmation (or absence) of: cancel order endpoint, shipping/tax calculation, COD-only enforcement, `/user` vs `/users` duplication status
   - Any endpoint whose response format doesn't match the PRD-required `{ success, message, data }` shape

Do not skip Phase 3 — this report is what proves the collection was built from real verification rather than assumption, which is the actual point of this exercise.
