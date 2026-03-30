# Vendorkart - B2B Multi-Vendor Marketplace

## Project Overview

Vendorkart is India's B2B wholesale marketplace platform built as a pnpm monorepo. It connects buyers with verified manufacturers, distributors, and bulk suppliers.

## Architecture

This is a **pnpm monorepo** with the following packages:

### Artifacts (Apps)
- **`artifacts/api-server`** (`@workspace/api-server`) - Express.js backend API + Vite dev middleware (serves frontend in dev)
- **`artifacts/vendorkart`** (`@workspace/vendorkart`) - React + Vite frontend (SPA)
- **`artifacts/mockup-sandbox`** - UI component mockup sandbox

### Libraries
- **`lib/db`** (`@workspace/db`) - Drizzle ORM database client and schema (PostgreSQL)
- **`lib/api-zod`** (`@workspace/api-zod`) - Zod validation schemas for API
- **`lib/api-spec`** (`@workspace/api-spec`) - API specification
- **`lib/api-client-react`** (`@workspace/api-client-react`) - React API client hooks

## Tech Stack

- **Frontend**: React 19, Vite 7, TailwindCSS 4, TanStack Query, Wouter (routing), Radix UI, Shadcn/ui components
- **Backend**: Express.js 5, TypeScript, tsx (dev server), pino (logging)
- **Database**: PostgreSQL via Drizzle ORM (external Railway database)
- **Package Manager**: pnpm with workspace catalog

## Key Configuration

- **Port**: 5000 (single port - API server serves both API at `/api` and frontend via Vite middleware)
- **DATABASE_URL**: External PostgreSQL on Railway (in `.env`)
- **Dev mode**: API server uses Vite in middleware mode to serve the frontend

## Development

```bash
pnpm install          # Install all dependencies
pnpm run dev          # Start API server with Vite middleware (port 5000)
pnpm run build        # Build all packages
pnpm run start        # Run production server
```

## Database

- Uses Drizzle ORM with PostgreSQL
- Schema in `lib/db/src/schema/`
- Push schema changes: `pnpm --filter @workspace/db run push`

## Deployment

- Target: autoscale
- Build: `pnpm run build`
- Run: `pnpm run start`

## Feature Status

### Customer Panel (Complete)
- Dashboard, Cart with address selector, tiered wholesale discounts (2–12%), Order placement, Wishlist, Payment History, Profile, Address Book, Notifications, Support

### Vendor Panel (Complete)
- Dashboard, Products (CRUD with grid/list view), Orders (with timeline), Categories, Payments (earnings chart), Store Settings with UPI payment setup (upiId + upiQrImage fields) and banner gating by subscription plan, Add Product with plan-based product limit enforcement
- **Subscription page** (`/vendor-dashboard/subscription`): View all plans, current plan status, upgrade via Razorpay payments
- **Support page** (`/vendor-dashboard/support`): Submit support tickets, FAQ accordion
- `razorpay` npm package installed in api-server; `POST /api/subscriptions/create-order` endpoint creates Razorpay orders (falls back to demo if RAZORPAY_SECRET is not set)
- Banner upload gated behind Standard/Premium plan; product limits enforced based on plan's maxProducts

### Admin Panel (Complete)
- Vendor management (approve/reject/suspend), product moderation, customer management, orders, categories, subscriptions, coupons, activity logs
