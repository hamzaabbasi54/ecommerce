# CODING_GUIDE.md
> **CRITICAL: Read this entire file before writing a single line of code.** This is the global standard for every page and component in this Next.js project. All rules here are non-negotiable and come from the supervisor. Attach this file alongside `FRONTEND_SCREENS.md` for every coding task.

---

## 1. Project Stack (Know Exactly What You Are Using)

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.2.10 (App Router) | Framework |
| React | 19.x | UI Library |
| Tailwind CSS | v4 | Styling |
| Shadcn UI | v4 | Component Library |
| Lucide React | latest | Icons |
| React Hook Form + Zod | latest | Form validation |
| Zustand | v5 | Global client state (cart, auth, wishlist) |
| Axios | latest | HTTP requests to `/api/*` routes |
| Prisma | v5.14 | ORM (used ONLY in Server Components & API routes) |

**API Base**: All API routes are internal — always call `/api/...` (no port, no host). Never hardcode `http://localhost:5000` or use `process.env.NEXT_PUBLIC_API_URL`.

---

## 2. The Modular Architecture Rule (MANDATORY)

The supervisor's key requirement: **Every page must be split into a Server Component (the page file) and one or more Client Components (the interactive parts).**

### The Golden Rule:
```
app/.../page.jsx         → Server Component (SEO + data shell)
components/.../*.jsx     → Client Components (interactivity)
```

### Rule: When is a component a Server Component?
- It renders static content (text, lists, layouts).
- It fetches data directly from the database via Prisma.
- It has NO `onClick`, `useState`, `useEffect`, or any React hooks.
- It exports SEO `metadata`.

### Rule: When is a component a Client Component?
- It has ANY interactivity: forms, buttons that do things, dropdowns, modals.
- It uses `useState`, `useEffect`, `useRouter`, `useForm`, Zustand stores.
- It must have `'use client';` as the **very first line** of the file.
- It **CANNOT** export `metadata` for SEO — that must stay in the page file.

### Real Example from This Codebase:
```
app/(auth)/login/page.jsx     ← Server Component. Exports metadata. Renders <LoginForm />.
components/auth/LoginForm.jsx ← Client Component. Has 'use client'. Has useState, useForm.
```

---

## 3. File & Folder Naming Conventions

| File Type | Extension | Example |
|-----------|-----------|---------|
| Pages (Next.js routes) | `.jsx` | `app/products/page.jsx` |
| Client Component UI | `.jsx` | `components/products/ProductCard.jsx` |
| Hooks | `.js` | `hooks/useCart.js` |
| Utilities / Helpers | `.js` | `utils/formatPrice.js` |
| Services (API calls) | `.js` | `services/productService.js` |
| API Routes | `.js` | `app/api/products/route.js` |
| Constants | `.js` | `constants/index.js` |

**Folder structure for components:**
```
components/
├── layout/         ← Navbar, Footer, Sidebar (used on every page)
├── auth/           ← LoginForm, RegisterForm, etc.
├── shared/         ← ProductCard, Badge, LoadingSpinner (reusable anywhere)
├── home/           ← Hero, FeaturedCategories, LatestProducts
├── products/       ← ProductFilters, ProductGallery, AddToCartButton
├── cart/           ← CartContainer, CartItem
├── wishlist/       ← WishlistContainer
├── profile/        ← ProfileEditForm, AddressForm
├── reviews/        ← ReviewForm, ReviewList
└── admin/          ← ProductForm, CategoryForm, BrandForm
```

---

## 4. SEO Rules (MANDATORY on Every Page)

Every `page.jsx` file **MUST** export a `metadata` object. This is the supervisor's requirement for SEO.

### For Static Pages (title is always the same):
```jsx
export const metadata = {
  title: 'Shop All Products | Electronica',
  description: 'Browse our curated collection of premium electronics, gadgets, and peripherals.',
};
```

### For Dynamic Pages (title depends on the data, e.g., a product page):
Use `generateMetadata` — an async function that receives the params:
```jsx
export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({ where: { id: params.slug } });
  return {
    title: `${product.name} | Electronica`,
    description: product.description,
  };
}
```

**Rules:**
- `metadata` / `generateMetadata` lives ONLY in `page.jsx` — never in a Client Component.
- Every page title must follow the format: `Page Name | Electronica`.
- Always write a meaningful `description` (not a placeholder).

---

## 5. Data Fetching Rules

### In a Server Component (`page.jsx`): Use Prisma Directly
Do NOT call your own `/api` endpoints from a Server Component — import Prisma and query directly. This is faster and avoids a redundant HTTP round-trip.

```jsx
// app/products/page.jsx
import prisma from '@/lib/prisma';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 12,
  });
  return <ProductList products={products} />;
}
```

### In a Client Component: Use Axios + Service Files
Client Components fetch data through services using Axios. All API calls must go through a file in `services/`.

```js
// services/productService.js
import axiosInstance from '@/utils/axiosInstance';

export const getProducts = async (params) => {
  const response = await axiosInstance.get('/api/products', { params });
  return response.data;
};
```

Then in the component:
```jsx
'use client';
import { getProducts } from '@/services/productService';
// ...
const data = await getProducts({ page: 1, limit: 12 });
```

---

## 6. Shadcn UI Components (USE THESE — Don't Build from Scratch)

This project uses Shadcn UI. Always prefer Shadcn components over custom-built ones.

**Available Shadcn components already installed:**
- `Button` → `@/components/ui/button`
- `Input` → `@/components/ui/input`
- `Label` → `@/components/ui/label`

**Add new Shadcn components using:**
```bash
npx shadcn@latest add <component-name>
```

**Common components you will need and how to add them:**
| Component | Command | Use case |
|-----------|---------|---------|
| Card | `add card` | Product cards, info panels |
| Badge | `add badge` | Sale tags, category labels |
| Select | `add select` | Sort dropdowns, filter selects |
| Dropdown Menu | `add dropdown-menu` | User account nav menu |
| Dialog | `add dialog` | Confirmation modals |
| Sheet | `add sheet` | Mobile sidebar/drawer |
| Avatar | `add avatar` | User profile images |
| Separator | `add separator` | Horizontal dividers |
| Skeleton | `add skeleton` | Loading placeholders |
| Toast / Sonner | `add sonner` | Success/error notifications |

**Import pattern** (always from the `@/components/ui/` alias):
```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

---

## 7. Design Tokens (Use These Tailwind Classes — NOT Raw Colors)

The design system lives in `globals.css`. Always use semantic token class names. Do NOT write `bg-blue-600` or `text-gray-500`.

| Token Class | Meaning | Use on |
|-------------|---------|--------|
| `bg-background` | Page background (#faf8fe) | Page wrappers |
| `bg-card` | Card surface (white) | Card components |
| `text-foreground` | Primary text (#1a1b1f) | Headings, body |
| `text-muted-foreground` | Secondary text | Captions, labels |
| `text-primary` | Brand blue (#0050cb) | Links, accents |
| `bg-primary` | Brand blue | Primary buttons |
| `border-border` | Default border | Card borders, dividers |
| `text-destructive` | Error red | Error messages |
| `bg-destructive/10` | Light red background | Error alert banners |
| `tech-shadow` | Custom card shadow | Cards on hover |

**Typography classes (from Inter font):**
- Headings: `text-3xl font-bold`, `text-2xl font-semibold`, `text-xl font-semibold`
- Body: `text-base`, `text-sm`
- Captions: `text-xs text-muted-foreground`

---

## 8. Forms: React Hook Form + Zod

Every form **must** use React Hook Form with Zod validation. No plain `<form>` with `useState`. This is the supervisor's standard.

```jsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  // ...
}
```

Always show field-level errors below each input using this pattern:
```jsx
{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
```

---

## 9. Global State (Zustand Stores)

Global state for cart and auth is already set up. **Never use prop drilling across more than 2 levels.** Use the existing Zustand stores.

| Store File | What it holds | How to import |
|------------|--------------|---------------|
| `context/useAuthStore.js` | `user`, `setUser`, `clearUser` | `import useAuthStore from '@/context/useAuthStore'` |
| `hooks/useCart.js` | `items`, `addItem`, `removeItem`, `totalItems` | `import useCart from '@/hooks/useCart'` |

When you need the cart badge count in the Navbar:
```jsx
'use client';
import useCart from '@/hooks/useCart';
const { totalItems } = useCart();
```

---

## 10. Error Handling Standards

Every API call in a Client Component must be wrapped in a `try/catch`. Never let an unhandled rejection crash the UI.

**Pattern:**
```jsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
  setError(null);
  setIsLoading(true);
  try {
    await someApiCall();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

Show errors inline using this component pattern:
```jsx
{error && (
  <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm border border-destructive/20">
    {error}
  </div>
)}
```

---

## 11. Routing & Navigation

- Use `next/link` for internal links. **Never** use `<a href>` for internal navigation.
- Use `next/navigation`'s `useRouter` for programmatic navigation inside Client Components.
- Use `next/image` for all images (better performance and SEO).

```jsx
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
```

---

## 12. The Checklist — Before Submitting Any Page

Run through this list mentally before considering any page done:

- [ ] `page.jsx` is a Server Component (no `'use client'` at the top).
- [ ] `page.jsx` exports a `metadata` or `generateMetadata` for SEO.
- [ ] Interactive parts are in a separate Client Component file with `'use client'` on line 1.
- [ ] All forms use React Hook Form + Zod.
- [ ] Shadcn UI components are used for buttons, inputs, cards, etc.
- [ ] Only semantic Tailwind color tokens are used (no raw colors like `blue-600`).
- [ ] API calls in Client Components go through a `services/*.js` file.
- [ ] No Prisma imports inside a Client Component.
- [ ] All API calls are wrapped in `try/catch` with loading and error states.
- [ ] `next/link` and `next/image` are used instead of `<a>` and `<img>`.
