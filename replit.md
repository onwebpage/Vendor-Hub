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
- **Email**: Nodemailer

## Development

Two separate dev processes run in parallel:

- **"API Server" workflow** — Express API on port 8000 (`PORT=8000 SERVE_FRONTEND=false pnpm --filter @workspace/api-server run dev`)
- **"artifacts/vendorkart: web" workflow** — Vite dev server on port 5000 with a proxy forwarding `/api/*` → `localhost:8000`

The Vite proxy (in `artifacts/vendorkart/vite.config.ts`) makes all `/api/*` calls from the browser transparently reach the API server.

In **production**, the unified Express server (`artifacts/api-server`) serves both the API and the built static frontend on port 5000 (`SERVE_FRONTEND` is not set to "false").

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (stored as Replit secret)
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
- Email Logs, Contact Messages, Activity Logs

Social links are stored in the `social_links` DB table (single-row settings). Admins manage them at `/admin/social-links`. Active links appear as icons in the public site footer. Public read endpoint: `GET /api/contact/social-links`.

## Deployment

- **Target**: Autoscale
- **Build**: `pnpm run build:render` (builds Vite frontend + esbuild backend bundle)
- **Run**: `node ./artifacts/api-server/dist/index.mjs`
