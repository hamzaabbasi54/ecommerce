# FRONTEND_SCREENS.md
> Full screen inventory from the project doc. Attach this + PROJECT_CONTEXT.md + DESIGN.md (from Stitch) whenever generating or integrating a screen. Build in this order — top to bottom within each section.

## How to use this file with Stitch + Antigravity
1. Generate `DESIGN.md` once (Step 1 in chat) — the shared visual language.
2. For each screen below: prompt Stitch to design it (referencing DESIGN.md's style), then tell Antigravity to fetch it via MCP and implement it at the exact path listed, using the Server/Client split already decided.
3. Check the box once it's integrated, tested in the browser, and matches DESIGN.md.

---

## SECTION A — Public / User-facing screens

### Auth (✅ COMPLETED)
- [x] Register — `app/(auth)/register/page.jsx` (**Server** SEO) + `components/auth/RegisterForm.jsx` (**Client**)
- [x] Login — `app/(auth)/login/page.jsx` (**Server** SEO) + `components/auth/LoginForm.jsx` (**Client**)
- [x] Forgot Password — `app/(auth)/forgot-password/page.jsx` (**Server** SEO) + `components/auth/ForgotPasswordForm.jsx` (**Client**)
- [x] Reset Password — `app/(auth)/reset-password/[token]/page.jsx` (**Server** SEO) + `components/auth/ResetPasswordForm.jsx` (**Client**)

### User account (Profile)
- [ ] Profile view — `app/profile/page.jsx` (**Server** SEO) + `components/profile/ProfileEditForm.jsx` (**Client**)
- [ ] Profile Image Upload — `components/profile/ProfileImageUpload.jsx` (**Client**)
- [ ] Change Password — `components/profile/ChangePasswordForm.jsx` (**Client**)
- [ ] Address Management — `app/profile/addresses/page.jsx` (**Server** SEO) + `components/profile/AddressForm.jsx` (**Client**)

### Catalog
- [ ] Home Page — `app/page.jsx` (**Server** SEO) + `components/home/FeaturedProducts.jsx` (**Client**)
- [ ] Product Listing — `app/products/page.jsx` (**Server** SEO) + `components/products/ProductFilters.jsx` (**Client**)
- [ ] Product Details — `app/products/[slug]/page.jsx` (**Server** SEO) + `components/products/AddToCartButton.jsx`, `components/products/ProductGallery.jsx`, `components/reviews/ReviewForm.jsx` (**Client**)
- [ ] Category Listing — `app/categories/page.jsx` (**Server** SEO)
- [ ] Products by Category — `app/categories/[slug]/page.jsx` (**Server** SEO)
- [ ] Brand Listing — `app/brands/page.jsx` (**Server** SEO)

### Cart & Wishlist
- [ ] Cart page — `app/cart/page.jsx` (**Server** SEO) + `components/cart/CartContainer.jsx` (**Client**, driven by Zustand)
- [ ] Wishlist page — `app/wishlist/page.jsx` (**Server** SEO) + `components/wishlist/WishlistContainer.jsx` (**Client**, driven by Zustand)

---

## SECTION B — Admin panel screens
> All under `app/admin/` — protected by `middleware.js` checking `role === 'ADMIN'`.

- [ ] Admin Dashboard (stats/overview) — `app/admin/page.jsx` (**Server** SEO)
- [ ] Manage Products — `app/admin/products/page.jsx` (**Server** SEO) + `components/admin/ProductForm.jsx` (**Client**)
- [ ] Manage Categories — `app/admin/categories/page.jsx` (**Server** SEO) + `components/admin/CategoryForm.jsx` (**Client**)
- [ ] Manage Brands — `app/admin/brands/page.jsx` (**Server** SEO) + `components/admin/BrandForm.jsx` (**Client**)

---

## Recommended build order
1. ~~Auth screens (nothing else works without login)~~ (DONE)
2. Product Listing + Details + Category + Brand (core browsing)
3. Cart + Wishlist
4. Account/Profile/Address
5. Admin panel last (needs all the data models already working)

## Naming convention reminder
- **Pages**: `.jsx` (Server Components by default, handle layout and SEO `metadata`).
- **Logic**: `.js` (hooks, utilities, services).
- **UI**: `.jsx` (Client Components containing user interaction, forms, Zustand, UI libraries like Shadcn).
- **Routes**: Route groups like `(auth)` don't appear in the URL.
