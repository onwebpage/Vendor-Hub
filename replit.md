# Vendorkart — B2B Multi-Vendor Marketplace

## Overview

Vendorkart is a full-stack B2B multi-vendor marketplace platform for India. It supports multiple vendors, customers, and administrators within a single ecosystem.

## Architecture

This is a **pnpm monorepo** with a unified Express + Vite dev server:

- `artifacts/api-server/` — Express 5 backend (TypeScript, Node.js 22)
- `artifacts/vendorkart/` — React 19 frontend (Vite, Tailwind CSS 4, shadcn/ui)
- `artifacts/mockup-sandbox/` — UI prototyping sandbox
- `lib/api-spec/` — OpenAPI YAML definition
- `lib/api-zod/` — Generated Zod validation schemas (from OpenAPI via Orval)
- `lib/api-client-react/` — Generated React Query hooks (from OpenAPI via Orval)
- `lib/db/` — Drizzle ORM schema and PostgreSQL connection

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Radix UI, TanStack Query, Zustand, Wouter
- **Backend**: Express 5, Node.js 22, Pino logger
- **Database**: PostgreSQL via `pg` driver, Drizzle ORM
- **Payments**: Razorpay
- **Email**: Resend API (secret: `RESENDAPIKEY`; from address configurable via `RESEND_FROM` env var, defaults to `Vendorkart <onboarding@resend.dev>`)

## Development

One unified dev server runs on port 5000:

- **"Start application" workflow** — Express API server (`pnpm dev`) with Vite middleware serving the frontend. Both API and frontend served on port 5000.

The Express server uses Vite's middleware mode (`setupFrontend()` in `app.ts`) to serve the React app in development. API routes are at `/api/*`.

In **production**, the unified Express server (`artifacts/api-server`) serves both the API and the built static frontend on port 5000 (`SERVE_FRONTEND` is not set to "false").

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (stored as Replit secret)
- `RESENDAPIKEY` — Resend API key for transactional emails (stored as Replit secret)
- `RESEND_FROM` — (optional) Custom from address e.g. `Vendorkart <hello@yourdomain.com>`
- `PORT` — Server port (set to 5000)

## Replit Setup Notes

- Node.js 22 module installed
- pnpm version pinned to 10.26.1 (matches installed Replit version)
- `COREPACK_ENABLE_AUTO_PIN=0 COREPACK_ENABLE_PROJECT_SPEC=0` flags used to bypass corepack version enforcement
- Windows-specific packages (`@rollup/rollup-win32-x64-msvc`, etc.) removed from root devDependencies

## Admin Panel Features

- Dashboard, Reports, Vendors, Customers, Products, Orders, Categories
- Payments, Coupons, Subscriptions, Commission Settings
- Banners, Contact Info Cards, **Social Media Links** (`/admin/social-links`)
- **Team Members** (`/admin/team`) — dynamic "Meet Our Team" section on About page
- Email Logs, Contact Messages, Activity Logs

Social links are stored in the `social_links` DB table (single-row settings). Admins manage them at `/admin/social-links`. Active links appear as icons in the public site footer. Public read endpoint: `GET /api/contact/social-links`.

Team members are stored in the `team_members` DB table. Admins manage them at `/admin/team` with full CRUD, image upload (base64), reordering (up/down buttons), and show/hide toggle. Public read endpoint: `GET /api/team` (only returns visible members). The team section on `/about` is fully dynamic — it fetches from the DB and hides itself when empty.

## Vendor Product Management

- **Adding products**: Approved vendors can add products via `/vendor-dashboard/products`. Products are automatically set to `status: "approved"` upon creation and appear immediately on the public site.
- **Vendor must be approved**: Vendors register as `"pending"` and need admin approval before adding products (`PUT /api/admin/vendors/:id/approve`).
- **Product visibility**: `GET /api/products` only returns `status: "approved"` products. `enrichProduct()` in `products.ts` attaches `vendorSlug` and `vendorName` to each product.
- **Vendor store page**: `/vendors/:slug` — products are enriched with `categoryName` via a category join. The `productCount` in the vendor header is dynamically computed from the live product list (not the stale DB field).
- **Vendor info on product detail**: The vendor info box on `/products/:id` is a clickable link to `/vendors/:vendorSlug`.
- **Category filter on vendor store**: Uses `p.categoryName` (joined field), not the non-existent `p.category` field.

## Deployment

- **Target**: Autoscale
- **Build**: `pnpm run build:render` (builds Vite frontend + esbuild backend bundle)
- **Run**: `node ./artifacts/api-server/dist/index.mjs`
