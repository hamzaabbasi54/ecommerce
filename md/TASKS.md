# TASKS.md
> Work top to bottom. Don't start a phase until the previous one is checked off and tested. Feed ONE phase at a time to the AI agent — never "build the whole backend."

## Phase 0 — Setup (Day 1)
- [ ] Init two repos or two folders in one repo: `/backend`, `/frontend`
- [ ] Backend: `npm init`, install express, prisma, bcrypt, jsonwebtoken, multer, cors, dotenv
- [ ] Frontend: `npx create-next-app` with TS + Tailwind
- [ ] Set up `.env` + `.env.example` in both
- [ ] Connect Prisma to Postgres, confirm `npx prisma db pull`/`migrate dev` works
- [ ] First commit: "Initial Project Setup"

## Phase 1 — Database (see DATABASE_SCHEMA.md)
- [ ] Finalize entities + relationships
- [ ] Write `prisma/schema.prisma`
- [ ] Run migration
- [ ] Seed script with a few dummy products/categories/users
- [ ] Commit: "Database Models Added"

## Phase 2 — Auth Module (backend)
- [ ] Register, Login, Logout
- [ ] Password hashing (bcrypt)
- [ ] JWT issue + verify middleware
- [ ] Protected route middleware
- [ ] Forgot/Reset/Change password
- [ ] Test ALL of these in Postman before moving on
- [ ] Commit: "User Authentication"

## Phase 3 — Core Product APIs (backend)
- [ ] Categories CRUD
- [ ] Brands CRUD
- [ ] Products CRUD + pagination + search + filter + sort
- [ ] Postman test everything
- [ ] Commit: "Product APIs Completed"

## Phase 4 — Cart, Wishlist, Reviews (backend)
- [ ] Cart add/remove/update/get
- [ ] Wishlist add/remove/list
- [ ] Reviews CRUD
- [ ] Postman test everything
- [ ] Commit: "Cart Module Completed"

## Phase 5 — Checkout & Orders (backend)
- [ ] Address management APIs
- [ ] Coupon validation logic
- [ ] Order creation (shipping + tax + coupon math)
- [ ] Order status/history/cancel
- [ ] Postman test everything
- [ ] Commit: "Checkout Module"

## Phase 6 — Frontend Foundation
- [ ] Layout, navbar, footer, theme (colors/fonts locked once)
- [ ] Auth pages (login/register) wired to backend
- [ ] Axios service layer + auth context/store
- [ ] Protected route handling on frontend

## Phase 7 — Frontend Feature Integration
- [ ] Product listing + details + filters/search
- [ ] Cart UI + persistence
- [ ] Wishlist UI
- [ ] Reviews UI
- [ ] Checkout flow UI
- [ ] Orders UI
- [ ] Commit: "Frontend Integration"

## Phase 8 — Admin Panel
- [ ] Admin-only routes/guards
- [ ] Manage users/products/categories/brands/orders/coupons/reviews
- [ ] Dashboard stats (orders, revenue, users, products)

## Phase 9 — Hardening
- [ ] Loading states / skeletons / empty states everywhere
- [ ] Error handling (network, validation, 401 expired token, 500)
- [ ] Image upload validation (size/type)
- [ ] SEO metadata, accessibility pass
- [ ] Commit: "Bug Fixes"

## Phase 10 — Deployment & Deliverables
- [ ] Deploy backend (Railway/Render), frontend (Vercel), DB
- [ ] Export Postman collection
- [ ] Write API docs + README + deployment guide
- [ ] Final commit: "Deployment"
