# Workspace

## Overview

Vendorkart - A full B2B multi-vendor marketplace built on a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui, framer-motion, recharts, zustand, react-hook-form

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (all backend routes)
│   └── vendorkart/         # React + Vite frontend (B2B marketplace)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Vendorkart - B2B Multi-Vendor Marketplace

### Features
- **Public website**: Home, Categories, Vendors, Products listing/detail, Vendor storefront
- **Customer Dashboard**: /customer-dashboard - Orders, Cart, Wishlist, Addresses, Payments, Notifications, Support
- **Vendor Dashboard**: /vendor-dashboard - Products, Orders, Subscription, Store Settings, UPI Setup
- **Admin Panel**: /admin - Full management of vendors, customers, products, orders, subscriptions, coupons

### Roles & Auth
- Roles: `customer`, `vendor`, `admin`
- Auth: Simple token-based (Base64 encoded payload) stored in localStorage as `vendorkart_token`
- Admin credentials: `admin@vendorkart.com` / (password hash of empty string + "vendorkart_salt")

### Database Schema (key tables)
- `users` - All users with role enum
- `vendors` - Vendor profiles with status, subscription plan
- `categories` - Product categories
- `products` - Products with bulk pricing JSON
- `orders` - Orders with items JSON and status tracking
- `payments` - Payment records (dummy Razorpay flow)
- `subscription_plans` - Basic/Standard/Premium plans
- `vendor_subscriptions` - Active vendor subscriptions
- `cart_items`, `wishlist`, `addresses` - Customer features
- `reviews`, `notifications`, `support_tickets`, `coupons` - Misc
- `commission_settings`, `activity_logs` - Admin features

### Subscription Plans (seeded)
- **Basic**: ₹999/mo - 50 products, 5 categories, no banner
- **Standard**: ₹2499/mo - 100 products, 10 categories, banner upload
- **Premium**: ₹4999/mo - Unlimited everything, featured listing, banner

### Payment Flow (Dummy Razorpay)
1. POST /api/payments/initiate → returns sessionId + dummyOrderId
2. POST /api/payments/confirm → generates fake TXN ID, marks order paid
3. UI shows success modal with transaction ID

### API Routes (at /api)
- `/auth/*` - Register, login, logout, me
- `/categories` - CRUD (admin)
- `/vendors` - List, profile, slug lookup, update
- `/products` - CRUD with vendor scoping
- `/cart` - Cart management
- `/wishlist` - Wishlist management
- `/orders` - Order creation + management
- `/payments` - Initiate + confirm dummy payment
- `/subscriptions` - Plans + vendor subscription
- `/reviews` - Vendor reviews
- `/notifications` - User notifications
- `/support/tickets` - Support tickets
- `/coupons/validate` - Coupon validation
- `/addresses` - Address book
- `/admin/*` - All admin operations (requires admin role)

## Development

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
