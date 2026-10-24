# Fish Basket — Multi-Fisherman Seafood Marketplace Platform

> **"Fresh Catch. Direct from Local Harbors to Your Doorstep."**
> An enterprise-grade, secure multi-fisherman seafood marketplace built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and PostgreSQL (Supabase).

---

## 1. Project Overview & Multi-Fisherman Architecture

**Fish Basket** has been upgraded in place into a secure multi-fisherman seafood marketplace. Local coastal fishermen and boat owners list their fresh morning catch directly, while customers enjoy a unified shopping experience across trusted sellers.

### The 4 Distinct Account Roles

1. **Administrator (`admin`)**:
   - Full marketplace governance and moderation.
   - Evaluates fisherman applications: approve, reject, suspend, or reactivate accounts.
   - Monitors all orders across all sellers, manages catalog listings, and assigns delivery partners.
   - Moderates customer reviews.
   - Access: `/admin` and all admin operation pages.

2. **Fisherman Seller (`fisherman`)**:
   - Registers publicly via `/register-fisherman` (receives `pending` approval status by default).
   - Once approved by Admin, gains full management over their own fresh catch listings.
   - Creates and edits listings with pricing, unit (kg, piece, etc.), stock quantity, photos, and preparation cuts (Curry cut, Fry cut, Peeled & deveined, etc.).
   - Manages orders containing their catch: advances preparation status (`accepted_for_prep` $\rightarrow$ `preparing` $\rightarrow$ `ready_for_pickup` $\rightarrow$ `handed_over`).
   - Strict Ownership Rule: Cannot view or edit another fisherman's products, stock, prices, orders, revenue, or customer details.
   - Access: Dedicated Fisherman Portal at `/fisherman`.

3. **Customer (`customer`)**:
   - Registers securely via `/register` with email and password.
   - Browses a shared marketplace catalog with transparent seller attribution (boat name, dock landing center).
   - Single-Fisherman Checkout Rule: Each checkout submission contains products from only one fisherman to maintain cold-chain logistics. Mixed carts group items by seller with dedicated checkout flows.
   - Payment method: **Cash on Delivery (COD) only** for all new checkouts.
   - Submits verified-purchase ratings and reviews (1–5 stars) only for delivered orders.
   - Access: Storefront and `/account`.

4. **Delivery Partner (`delivery_partner`)**:
   - Views orders assigned to them with dock pickup location and customer delivery address.
   - Advances delivery statuses: `out_for_delivery` $\rightarrow$ `delivered`.
   - Records Cash on Delivery (COD) collection at doorstep with audit timestamp.
   - Access: Dedicated Delivery Portal at `/delivery`.

---

## 2. Secure Authentication System

Replaces identity bypass with full password-based authentication:
- **Email & Password Authentication**: Validated server-side via `POST /api/auth/login`.
- **Password Security**: Passwords are cryptographically salted and hashed (`sha256$<salt>$<hash>`). Passwords are never stored as plain text or leaked in logs.
- **Role Verification**: Server verifies the user's role on every action and returns appropriate dashboard redirects (`/admin`, `/fisherman`, `/delivery`, or `/account`).
- **Registration Flows**:
  - Customer Registration: `/register` (instant active customer account).
  - Fisherman Registration: `/register-fisherman` (collects display name, email, password, and dock landing center; receives `pending` status).
- **Password Recovery**:
  - `/forgot-password`: Requests secure time-limited reset token via `POST /api/auth/forgot-password`.
  - `/reset-password?token=...`: Validates token and updates password via `POST /api/auth/reset-password`.

---

## 3. Safe Initial Admin Setup

To establish or promote an initial Administrator account safely without committing credentials:

```bash
# Run the secure admin setup CLI script:
ADMIN_EMAIL="admin@fishbasket.in" ADMIN_PASSWORD="YourSecurePassword123!" npm run setup-admin
```

- Refuses to overwrite existing accounts without the `--force` flag.
- Never prints passwords to logs or commits them to version control.

---

## 4. Single-Fisherman Checkout Rule & COD Flow

### Single-Fisherman Checkout Rule
To prevent fulfillment failures across disparate harbor docks, **each submitted checkout must contain products from only one fisherman seller**.
- If a customer adds seafood from multiple fishermen, the Cart page (`/cart`) and drawer visually group items by seller.
- The customer can checkout each seller's batch separately with transparent pricing, delivery slot, and order receipt.
- Server-side validation in `POST /api/orders` enforces that all items belong to the same fisherman before reserving stock.

### Cash on Delivery (COD) Only
- All new customer orders use Cash on Delivery. Online payment gateways are disabled for new checkouts while preserving historical transaction records.
- Orders are placed in `payment_status: 'pending'`.
- Only authorized Delivery Partners or Administrators can mark payments collected (`payment_status: 'success'`) upon customer handover, recording an immutable audit timestamp (`payment_collected_at`, `payment_collected_by`).

---

## 5. Fisherman Portal (`/fisherman`)

- `/fisherman` — Overview metrics: Total Revenue, Total Orders, Active Listings, Out of Stock, Pending Preparation, Ready for Handover, and Recent Orders.
- `/fisherman/products` — My Fresh Catch Listings with real-time stock and availability toggles.
- `/fisherman/products/new` — Create new catch with custom cut options, gross weight, and net cleaned yield percentages.
- `/fisherman/products/[id]` — Edit catch with strict ownership check.
- `/fisherman/orders` — Orders containing the fisherman's seafood.
- `/fisherman/orders/[id]` — Update catch preparation and handover readiness.
- `/fisherman/reviews` — Customer ratings and feedback on the fisherman's catch.
- `/fisherman/settings` — Update boat display name, phone, and dock landing center.

---

## 6. Admin Fisherman Governance (`/admin/fishermen`)

- View all registered fishermen with status filter (`pending`, `approved`, `suspended`, `rejected`).
- **Approve Fisherman**: Activates selling privileges and enables their fresh catch in the shared catalog.
- **Reject Application**: Declines applicant with notification.
- **Suspend Account**: Immediately disables seller's active listings while preserving historical orders and records.
- **Reactivate Account**: Restores selling privileges.

---

## 7. Verified-Purchase Reviews

- Customers can review a product **only** after completing a delivered order containing that catch.
- Unpurchased products or orders in transit cannot be reviewed.
- Duplicate reviews for the same purchase are strictly blocked.
- Ratings follow a 1–5 star scale with mandatory title and review commentary.
- Product average rating and review counts are recalculated automatically on the server.
- Administrators can moderate or delete inappropriate reviews via `/admin/reviews`.

---

## 8. Database Schema & Additive Migration

All database changes are additive and preserve existing data, customers, and orders:
- **Additive Migration File**: [`supabase/migrations/20261024_fisherman_marketplace.sql`](supabase/migrations/20261024_fisherman_marketplace.sql)
  - Extends `user_role` enum with `'fisherman'`.
  - Creates `fisherman_status` enum (`'pending'`, `'approved'`, `'rejected'`, `'suspended'`).
  - Adds `fisherman_id`, `seller_name`, `dock_location`, and `password_hash` to `profiles`.
  - Adds `fisherman_id` and `seller_name` to `products`, `orders`, and `order_items`.
  - Adds `order_id` and `fisherman_id` to `reviews`.
  - Configures Row Level Security (RLS) policies for multi-tenant isolation.
- Dual-mode architecture: Works seamlessly with Supabase PostgreSQL or the built-in persistent DB service for zero-config offline execution.

---

## 9. Testing Credentials (Development Demo)

All demo accounts use password: `FishBasket@2026`

| Role | Email | Password | Access / Landing URL |
|---|---|---|---|
| **Administrator** | `admin@fishbasket.in` | `FishBasket@2026` | `/admin` |
| **Approved Fisherman A** | `fisherman1@fishbasket.in` | `FishBasket@2026` | `/fisherman` (Captain Ramana) |
| **Approved Fisherman B** | `fisherman2@fishbasket.in` | `FishBasket@2026` | `/fisherman` (Godavari Delta) |
| **Pending Fisherman C** | `fisherman_pending@fishbasket.in` | `FishBasket@2026` | `/fisherman` (Pending Gate Screen) |
| **Customer** | `customer@fishbasket.in` | `FishBasket@2026` | `/` and `/account` |
| **Delivery Partner** | `delivery@fishbasket.in` | `FishBasket@2026` | `/delivery` |

---

## 10. Development & Verification Commands

```bash
# Install dependencies
npm install

# Run automated test suite (16 tests covering RBAC, checkout, COD, and reviews)
npm test

# Run linter
npm run lint

# Compile Next.js production build (58 static & dynamic routes)
npm run build

# Start production server on port 3000
npm run start
```

---

## 11. Technology Stack

- **Framework**: Next.js 16.4.3 (App Router with Turbopack)
- **Language**: TypeScript 7.0 (Strict mode)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: PostgreSQL (Supabase) + Dual-Mode Persistent Adapter
- **Testing**: Vitest v5.0.5

---

## 12. License
Copyright © 2026 Fish Basket India. All rights reserved.
