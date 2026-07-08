# FRONTEND_SCREENS.md
> Full screen inventory from the project doc. Attach this + PROJECT_CONTEXT.md + DESIGN.md (from Stitch) whenever generating or integrating a screen. Build in this order — top to bottom within each section.

## How to use this file with Stitch + Antigravity
1. Generate `DESIGN.md` once (Step 1 in chat) — the shared visual language.
2. For each screen below: prompt Stitch to design it (referencing DESIGN.md's style), then tell Antigravity to fetch it via MCP and implement it at the exact path listed, using the Server/Client split already decided.
3. Check the box once it's integrated, tested in the browser, and matches DESIGN.md.

---

## SECTION A — Public / User-facing screens

### Auth
- [ ] Register — `app/(auth)/register/page.tsx` — **Client** (form, RHF+Zod)
- [ ] Login — `app/(auth)/login/page.tsx` — **Client**
- [ ] Forgot Password — `app/(auth)/forgot-password/page.tsx` — **Client**
- [ ] Reset Password — `app/(auth)/reset-password/[token]/page.tsx` — **Client**

### User account
- [ ] Profile view — `app/account/profile/page.tsx` — **Server** shell + `components/ProfileEditForm.tsx` **Client**
- [ ] Change Password — `app/account/change-password/page.tsx` — **Client**
- [ ] Address Management — `app/account/addresses/page.tsx` — **Server** list + `components/AddressForm.tsx` **Client**

### Catalog
- [ ] Product Listing — `app/products/page.tsx` — **Server** + `components/ProductFilters.tsx` **Client**
- [ ] Product Details — `app/products/[slug]/page.tsx` — **Server** + `components/AddToCartButton.tsx`, `components/ProductGallery.tsx`, `components/ReviewForm.tsx` **Client**
- [ ] Category Listing — `app/categories/page.tsx` — **Server**
- [ ] Products by Category — `app/categories/[slug]/page.tsx` — **Server**
- [ ] Brand Listing — `app/brands/page.tsx` — **Server**

### Cart & Wishlist
- [ ] Cart page — `app/cart/page.tsx` — **Client** (entire page, driven by Zustand `useCartStore`)
- [ ] Wishlist page — `app/wishlist/page.tsx` — **Client** (Zustand `useWishlistStore`)

### Checkout
- [ ] Checkout (address, summary, coupon, mock payment) — `app/checkout/page.tsx` — **Client** (multi-step form state)

### Orders
- [ ] My Orders (list) — `app/orders/page.tsx` — **Server**
- [ ] Order Details — `app/orders/[id]/page.tsx` — **Server** + `components/CancelOrderButton.tsx` **Client**

---

## SECTION B — Admin panel screens
> All under `app/admin/` — protect this whole segment with `middleware.js` checking `role === 'ADMIN'`.

- [ ] Admin Dashboard (stats: orders, revenue, users, products) — `app/admin/page.tsx` — **Server**
- [ ] Manage Users — `app/admin/users/page.tsx` — **Server** table + `components/admin/UserActionsModal.tsx` **Client**
- [ ] Manage Products — `app/admin/products/page.tsx` — **Server** table + `components/admin/ProductForm.tsx` **Client**
- [ ] Manage Categories — `app/admin/categories/page.tsx` — **Server** table + `components/admin/CategoryForm.tsx` **Client**
- [ ] Manage Brands — `app/admin/brands/page.tsx` — **Server** table + `components/admin/BrandForm.tsx` **Client**
- [ ] Manage Orders — `app/admin/orders/page.tsx` — **Server** table + `components/admin/OrderStatusUpdate.tsx` **Client**
- [ ] Manage Coupons — `app/admin/coupons/page.tsx` — **Server** table + `components/admin/CouponForm.tsx` **Client**
- [ ] Manage Reviews — `app/admin/reviews/page.tsx` — **Server** table + `components/admin/ReviewModeration.tsx` **Client**

---

## Recommended build order
1. Auth screens (nothing else works without login)
2. Product Listing + Details + Category + Brand (core browsing)
3. Cart + Wishlist
4. Checkout + Orders
5. Account/Profile/Address
6. Admin panel last (needs all the data models already working)

## Naming convention reminder
Route groups like `(auth)` don't appear in the URL — `app/(auth)/login/page.tsx` still resolves to `/login`. Use this to keep auth pages visually/structurally grouped without polluting the URL.
