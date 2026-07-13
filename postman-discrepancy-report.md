# Postman Collection — Discrepancy Report

**Generated from:** Direct inspection of all 44 `route.js` files under `Frontend/app/api/`, the `lib/auth.js` middleware, and `prisma/schema.prisma`.

---

## 1. Confirmed Auth Mechanism: HTTP-Only Cookie (NOT Bearer Token)

**Verdict: Cookie-based only. No Bearer header support exists anywhere.**

Evidence from [`lib/auth.js`](file:///c:/Users/hamza/Desktop/ecommerce/Frontend/lib/auth.js):
- `verifyAuth()` reads the token exclusively from `request.cookies.get('token')?.value` (line 38).
- Login and Register set the cookie via `response.cookies.set('token', token, cookieOptions)`.
- `getCookieOptions()` returns `{ httpOnly: true, secure: isProduction, sameSite: ... }`.
- **No code anywhere reads an `Authorization` header or parses a Bearer token.**

**Postman implication:** After calling `POST /api/auth/login`, Postman's automatic cookie jar captures the `token` cookie. All subsequent requests automatically include it. No `{{token}}` variable or `Authorization` header is needed.

---

## 2. `/api/user/*` vs `/api/users/*` Duplication — BOTH ARE LIVE

| Path Prefix | Routes Found | Status |
|---|---|---|
| `/api/user/profile` | GET, PUT | ✅ Live |
| `/api/user/addresses` | GET, POST | ✅ Live |
| `/api/user/addresses/[id]` | PUT, DELETE | ✅ Live |
| `/api/user/security` | PUT | ✅ Live |
| `/api/users/profile` | GET, PUT | ✅ Live (DUPLICATE) |
| `/api/users/profile/image` | PUT | ✅ Live (unique to `/users/`) |
| `/api/users/addresses` | GET, POST | ✅ Live (DUPLICATE) |
| `/api/users/addresses/[id]` | PUT, DELETE | ✅ Live (DUPLICATE) |

**Key differences between the duplicates:**
- **`/api/user/profile` PUT** accepts BOTH `multipart/form-data` (with image upload) and JSON. Requires `name` + `phone`.
- **`/api/users/profile` PUT** is JSON-only, accepts `name`, `phone`, `email` (with email duplicate check returning 409).
- **`/api/users/profile` GET** includes `addresses` and `isVerified` in the response; `/api/user/profile` GET does not include `addresses`.

**Recommendation:** These should be consolidated. Both sets are functional but behave slightly differently.

---

## 3. Field Name Verification Against Prisma Schema

### Address Fields
**Schema confirms:** `label`, `street`, `city`, `province`, `postalCode`, `country`, `isDefault`
- ✅ All route files use these exact field names.
- ❌ **NOT** `state`/`zipCode` — confirmed `province`/`postalCode` everywhere.

### Order Creation — Address is an INLINE OBJECT, not an ID
The `POST /api/orders` route does **not** accept an address ID. It receives an inline address object:
```javascript
const { address, paymentMethod, email, couponCode } = body;
// address must have: firstName, lastName, street, city, postalCode, country
// province is optional (defaults to 'N/A')
```
**Note:** `firstName` and `lastName` are required in the validation check but are NOT stored — only `street`, `city`, `province`, `postalCode`, `country` are saved to the Address record with a hardcoded `label: 'Shipping'`.

### Password Change Routes — Different Field Names!
| Route | Field Names |
|---|---|
| `PUT /api/auth/changepassword` | `oldPassword`, `newPassword` |
| `PUT /api/user/security` | `currentPassword`, `newPassword` |

These are **two different routes** that do the same thing with **different field names**.

### Register — Zod Validation
Only route using Zod. Schema: `name` (min 2), `email` (valid email), `password` (min 6), `phone` (min 10), `role` (optional, enum USER|ADMIN).

---

## 4. COD-Only Enforcement — NOT ENFORCED

**PRD says:** COD only, no payment gateway.

**Code reality** ([`orders/route.js` line 137](file:///c:/Users/hamza/Desktop/ecommerce/Frontend/app/api/orders/route.js#L137)):
```javascript
paymentMethod: paymentMethod || 'cod',
```

The code **accepts any string** as `paymentMethod`. There is no validation restricting it to `'cod'`. You could pass `"stripe"` or `"paypal"` and it would be stored. The default is `'cod'` if omitted, but no enforcement exists.

**This is a discrepancy with the PRD.**

---

## 5. Cancel Order Endpoint — DOES NOT EXIST

**PRD Section 20** requires user-side order cancellation (e.g., `PUT /api/orders/[id]/cancel`).

**Code reality:** No such route exists. The only way to change order status is via `PUT /api/admin/orders` (admin only), which accepts status values including `'cancelled'`. A regular user cannot cancel their own order.

**Missing endpoint.**

---

## 6. Shipping Charge and Tax Calculation

**Verified in** [`orders/route.js` lines 105-109](file:///c:/Users/hamza/Desktop/ecommerce/Frontend/app/api/orders/route.js#L105-L109):
```javascript
const shippingCharge = 0; // Free shipping
const taxRate = 0.08;     // 8% tax
const taxableAmount = subtotal - discount;
const tax = Number((taxableAmount * taxRate).toFixed(2));
const total = taxableAmount + shippingCharge + tax;
```

- **Shipping:** Hardcoded to `$0` (free shipping).
- **Tax:** Hardcoded at `8%`, calculated server-side on `(subtotal - discount)`.
- No billing-vs-shipping address distinction exists (confirmed — only one address object).

---

## 7. Response Format Compliance (`{ success, message, data }`)

Most endpoints follow the PRD format. Exceptions found:

| Endpoint | Issue |
|---|---|
| `POST /api/auth/register` (201) | Returns `user` key instead of `data` |
| `POST /api/auth/login` (200) | Returns `user` key instead of `data` |
| `GET /api/orders` (200) | Missing `message` key (only `success` + `data`) |
| `GET /api/orders/[id]` (200) | Missing `message` key |
| `GET /api/admin/orders` (200) | Missing `message` key |
| `GET /api/admin/users` (200) | Missing `message` key |
| `GET /api/admin/reviews` (200) | Missing `message` key |
| `GET /api/user/profile` (200) | Missing `message` key |
| `GET /api/user/addresses` (200) | Missing `message` key |
| `POST /api/coupons/validate` (200) | Missing `message` key |

---

## 8. Product Delete is SOFT Delete

`DELETE /api/admin/products/[id]` does NOT remove the record. It sets:
```javascript
data: { deletedAt: new Date(), isActive: false }
```
Category and Brand deletes are **hard deletes** but prevent deletion if children/products exist.

---

## 9. Valid Order Statuses (Verified)

From [`admin/orders/route.js` line 41](file:///c:/Users/hamza/Desktop/ecommerce/Frontend/app/api/admin/orders/route.js#L41):
```javascript
const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
```

---

## 10. Complete Endpoint Count

| Category | Count |
|---|---|
| Auth | 6 endpoints |
| User/Profile (including duplicates) | 7 endpoints |
| Addresses (including duplicates) | 8 endpoints |
| Products (public) | 3 endpoints |
| Categories (public) | 2 endpoints |
| Brands (public) | 2 endpoints |
| Cart | 4 endpoints |
| Wishlist | 3 endpoints |
| Reviews (user) | 3 endpoints |
| Orders & Checkout | 4 endpoints |
| Coupons (validate) | 1 endpoint |
| Admin Dashboard | 1 endpoint |
| Admin Users | 3 endpoints |
| Admin Products | 3 endpoints |
| Admin Categories | 3 endpoints |
| Admin Brands | 3 endpoints |
| Admin Orders | 2 endpoints |
| Admin Coupons | 4 endpoints |
| Admin Reviews | 2 endpoints |
| **TOTAL** | **64 endpoints** |
