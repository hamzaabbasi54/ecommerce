/**
 * constants/index.js
 *
 * Shared data-shape documentation matching DATABASE_SCHEMA.md field names exactly.
 * These are JSDoc-only references — no runtime enforcement (plain JS, no TypeScript).
 * Every dev (and every AI agent) should reference these when building components/hooks.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email           - unique
 * @property {string} password         - hashed, never sent to frontend
 * @property {'USER'|'ADMIN'} role
 * @property {string} phone
 * @property {boolean} isVerified
 * @property {string|null} profileImage
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Address
 * @property {string} id
 * @property {string} userId           - FK → User
 * @property {string} label            - e.g. "Home", "Office"
 * @property {string} street
 * @property {string} city
 * @property {string} province
 * @property {string} postalCode
 * @property {string} country
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} image
 * @property {string|null} parentId    - self-relation, optional for subcategories
 * @property {string|null} deletedAt   - soft delete
 */

/**
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} logo
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} price
 * @property {number|null} discountPrice
 * @property {number} stock
 * @property {string} categoryId       - FK → Category
 * @property {string} brandId          - FK → Brand
 * @property {string[]} images
 * @property {boolean} isActive
 * @property {string|null} deletedAt   - soft delete
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Cart
 * @property {string} id
 * @property {string} userId           - FK → User, unique (one active cart per user)
 * @property {CartItem[]} items
 */

/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} cartId           - FK → Cart
 * @property {string} productId        - FK → Product
 * @property {number} quantity
 * @property {number} priceAtAdd
 */

/**
 * @typedef {Object} Wishlist
 * @property {string} id
 * @property {string} userId           - FK → User
 * @property {string} productId        - FK → Product
 * unique constraint on (userId, productId)
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} userId           - FK → User
 * @property {string} productId        - FK → Product
 * @property {number} rating           - 1–5
 * @property {string} comment
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Coupon
 * @property {string} id
 * @property {string} code             - unique
 * @property {'percent'|'fixed'} discountType
 * @property {number} discountValue
 * @property {number} minOrderValue
 * @property {string} expiryDate
 * @property {number} usageLimit
 * @property {number} timesUsed
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} userId           - FK → User
 * @property {string} addressId        - FK → Address
 * @property {'pending'|'confirmed'|'shipped'|'delivered'|'cancelled'} status
 * @property {number} subtotal
 * @property {number} shippingCharge
 * @property {number} tax
 * @property {number} discount
 * @property {number} total
 * @property {string|null} couponId    - nullable FK → Coupon
 * @property {string} paymentMethod    - "COD" | "Card" (label only, no real gateway)
 * @property {'pending'|'paid'} paymentStatus - mock
 * @property {string} createdAt
 * @property {OrderItem[]} items
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {string} orderId          - FK → Order
 * @property {string} productId        - FK → Product
 * @property {number} quantity
 * @property {number} priceAtPurchase
 */

/**
 * API Response envelope shape — every backend response follows this format.
 *
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]               - present on success, absent on error
 */

// API route prefixes — single source of truth for all services
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  BRANDS: '/api/brands',
  CART: '/api/cart',
  WISHLIST: '/api/wishlist',
  REVIEWS: '/api/reviews',
  ORDERS: '/api/orders',
  ADMIN: '/api/admin',
};
