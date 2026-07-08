# PROJECT_CONTEXT.md
> Paste/attach this file at the start of every Antigravity session. This is the single source of truth the AI agent should never contradict.

## What this is
Full Stack E-Commerce Web Application — internship training assignment simulating a real company SDLC. Two separate deployable services (not a Next.js monorepo/API-routes app):
- **Backend**: standalone REST API
- **Frontend**: standalone Next.js app that consumes the API over HTTP

## Tech Stack (locked — do not deviate without a reason)
**Backend**
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT auth (access token + optional refresh token)
- bcrypt for password hashing
- Multer for image uploads
- dotenv, cors

**Frontend**
- Next.js (App Router, latest)
- JavaScript (no TypeScript — plain .js/.jsx files throughout)
- Tailwind CSS
- React Hook Form + Zod for validation
- Zustand for global state (cart, auth) — lightweight stores, no boilerplate reducers
- Axios (or fetch wrapper) in a dedicated `services/` layer — components never call axios directly
- Zustand stores live in `context/` (or a new `store/` folder) — one store per domain, e.g. `useAuthStore`, `useCartStore`

## Non-negotiable conventions
- Every API response follows:
  ```json
  { "success": true, "message": "string", "data": {} }
  { "success": false, "message": "string" }
  ```
- Correct HTTP status codes: 200/201/400/401/403/404/409/422/500
- Every API is tested in Postman **before** frontend integration — no exceptions
- Passwords are never stored or logged in plain text
- No secrets hardcoded — everything through `.env`, with `.env.example` kept up to date
- Git commits are small and meaningful (see Git Workflow below) — never one giant commit

## Backend folder structure (matches actual repo — flat architecture)
```
config/
controllers/     ← call database/prisma.js directly, no service/repository layer
database/
  prisma.js      ← single PrismaClient instance, imported everywhere
middlewares/
routes/
utils/
validators/
uploads/
src/
  index.js       ← Express entry point (app.listen)
  generated/
    prisma/      ← Prisma Client output (custom generator location, Prisma 6.x pattern)
prisma/
  schema.prisma
  migrations/
```
Note: no `services/`, `repositories/`, or `models/` folder — controllers query Prisma directly via `database/prisma.js`. This is a deliberate flat-architecture choice for this project's scope, not a missing layer.

## Frontend folder structure (matches actual repo)
```
app/                  ← Next.js routing root (page.js, layout.js, route handlers)
components/
layouts/              ← reusable layout components, imported into app/*/layout.js
services/             ← axios/fetch calls, one file per resource (products.js, cart.js...)
hooks/
context/
utils/
constants/
styles/
public/
middleware.js         ← single file at root, NOT a folder (Next.js requirement)
AGENTS.md / CLAUDE.md ← agent-specific instructions, keep in sync with this file
```

## Core entities (database)
Users, Products, Categories, Brands, Orders, Order Items, Cart, Wishlist, Reviews, Coupons, Addresses
— full field-level schema lives in `DATABASE_SCHEMA.md`, keep it in sync with `prisma/schema.prisma`.

## Git workflow
Commit after each logical unit, not each file save. Example commit sequence:
`Initial Project Setup` → `User Authentication` → `Database Models Added` → `Product APIs Completed` → `Cart Module Completed` → `Checkout Module` → `Frontend Integration` → `Bug Fixes` → `Deployment`

## Deployment targets
- Backend: Railway or Render
- Frontend: Vercel
- Database: managed Postgres (Railway/Neon/Supabase — confirm with supervisor)

## Frontend architecture pattern (MVC-equivalent)
Mirrors the backend's controller/model separation:
- `services/` — pure API calls only, one file per resource, 1:1 mirror of Express endpoints. No logic, no state, no React.
- `hooks/` — the "controller" layer. Wraps a service call with state/loading/error handling. **Client Components only** (uses useState/useEffect).
- `components/` — pure view. Receives data as props, renders UI, never imports `services/` directly.
- `app/` — routes. Server Components call `services/` directly (no hook needed, since hooks require client-side state). Client Component pages use `hooks/`.

Rule: a component never calls axios/fetch directly — it goes through a hook (client) or receives data already fetched by a Server Component page (server).

## Rule for the AI agent
Do not introduce new libraries, change the folder structure, or switch state-management approach without flagging it first. Do NOT reintroduce a services/repositories/models layer in the backend — controllers call `database/prisma.js` directly, by design. When a task is ambiguous, ask rather than assume.
