# DATABASE_SCHEMA.md
> Fill this in BEFORE writing a single line of backend code. This is Phase 1 of the doc's workflow — do not skip it.

## Entities & relationships (draft — refine as you go)

**User**
- id, name, email (unique), password (hashed), role (user/admin — single flat admin role, no tiers), phone, isVerified, profileImage, resetPasswordToken, resetPasswordExpire, createdAt, updatedAt
- 1:N → Addresses, Orders, Reviews, Cart, Wishlist

**Address**
- id, userId (FK), label, street, city, province, postalCode, country, isDefault

**Category**
- id, name, slug, image, parentId (self-relation, optional for subcategories), deletedAt (nullable — soft delete)

**Brand**
- id, name, slug, logo

**Product**
- id, name, slug, description, price, discountPrice, stock, categoryId (FK), brandId (FK), images[], isActive, deletedAt (nullable — soft delete), createdAt
- 1:N → Reviews, OrderItems (no variants in v1 — decided out of scope)

**Cart**
- id, userId (FK, unique — one active cart per user)
- 1:N → CartItems

**CartItem**
- id, cartId (FK), productId (FK), quantity, priceAtAdd

**Wishlist**
- id, userId (FK), productId (FK) — unique constraint on (userId, productId)

**Review**
- id, userId (FK), productId (FK), rating (1-5), comment, createdAt

**Coupon**
- id, code (unique), discountType (percent/fixed), discountValue, minOrderValue, expiryDate, usageLimit, timesUsed

**Order**
- id, userId (FK), addressId (FK), status (pending/confirmed/shipped/delivered/cancelled), subtotal, shippingCharge, tax, discount, total, couponId (nullable FK), paymentMethod (string label only — COD/Card, no real gateway), paymentStatus (mock: pending/paid), createdAt

**OrderItem**
- id, orderId (FK), productId (FK), quantity, priceAtPurchase

## Decisions made
- [x] Product variants: **out of scope for v1**
- [x] Payment: **mock only** — "Place Order" just records the order with a label (COD/Card) and a mock `paymentStatus`, no real gateway
- [x] Global state: **Zustand**
- [x] Admin roles: **single admin role** — doc (section 21) treats "Admin" as one undifferentiated role, no tiers mentioned
- [x] Delete behavior: **soft delete** (`isActive`/`deletedAt`) — doc doesn't specify this, but hard-deleting a Product would orphan past `OrderItems` referencing it. Soft delete keeps order history intact, matching the doc's emphasis on data integrity.

No remaining open questions — schema is ready to write.

## Once finalized
Convert this into `prisma/schema.prisma`, run `npx prisma migrate dev --name init`, and commit as
`Database Models Added`.
