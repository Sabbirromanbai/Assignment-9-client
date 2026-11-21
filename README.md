# 🍕 Pizzabari — Pizza Ordering & Delivery Platform

A full-stack pizza ordering platform with role-based dashboards for **Customers**, **Vendors**, and **Admin**. Customers browse and order pizzas for a chosen delivery date, vendors manage their menu and orders, and premium vendors get featured placement on the homepage.

## 🔗 Links

- **Live Website:** https://assignment-9-client-nine.vercel.app/
- **Server Repository:** https://github.com/Sabbirromanbai/Assignment-9-server
- **Client Repository:** https://github.com/Sabbirromanbai/Assignment-9-client

## ✨ Features

### Customers

- Browse the full menu with **live search, category & location filters, and price sorting**
- Homepage with popular categories and a **Featured Pizzas** section (premium vendors first)
- Item details with vendor information, ratings, and delivery details
- Place an order for a specific **delivery date** (duplicate active orders are prevented per customer)
- Personal dashboard with order statistics, a **daily-orders chart**, and an order status breakdown
- Track every order through a **status timeline** (Pending → Accepted → …) and cancel pending orders

### Vendors

- Vendor dashboard with menu/order statistics, **daily-orders chart**, and **orders-by-category chart**
- Full menu management: add, edit, delete, and toggle availability of items (image upload supported)
- Free plan allows up to **3 active menu items**; **Premium plan** (Stripe subscription) unlocks unlimited items, a premium badge, and featured homepage placement
- View incoming orders with **customer names** and update order statuses

### Admin

- Admin dashboard with platform statistics and a **daily-revenue chart**
- User management: search users and block/unblock accounts
- Menu moderation: approve or reject vendor-submitted items
- Read-only view of all **transactions** with vendor names

### General

- Email/password sign-up with **role selection (Customer or Vendor)** and password rules
- **Google sign-in** — new Google users are asked to choose their role on first login
- Role-based protected dashboards — users are redirected to their own dashboard after sign-in
- **Dark mode**, fully responsive design, custom 404 page, and toast notifications

## 🛠️ Tech Stack

| Technology              | Purpose                                |
| ----------------------- | -------------------------------------- |
| Next.js 16 (App Router) | Frontend framework                     |
| React 19 + TypeScript   | UI and type safety                     |
| Tailwind CSS 4          | Styling                                |
| shadcn/ui               | UI component library                   |
| Better Auth             | Authentication (email + Google OAuth)  |
| Recharts                | Dashboard charts                       |
| Motion                  | Animations                             |
| Lucide React            | Icons                                  |
| Turborepo + npm         | Monorepo tooling                       |

## 🚀 Getting Started

### Prerequisites

- Node.js **>= 20.9**
- npm
- The Pizzabari server running (see the server repository)

### Installation

```bash
# Clone the repository
git clone https://github.com/Sabbirromanbai/Assignment-9-client.git
cd Assignment-9-client

# Install dependencies (from the monorepo root)
npm install
```

### Environment Variables

Create a file named `.env.local` inside `apps/web/` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:5000
```

| Variable                    | Description                          |
| --------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`       | Base URL of the Pizzabari API server |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Base URL of the Better Auth server |

### Run the Project

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck
```

The app runs at `http://localhost:3000` by default.

## 📁 Project Structure

```
apps/
  web/            # Next.js application (pages, components, lib)
packages/
  ui/             # Shared shadcn/ui components
  eslint-config/  # Shared ESLint configuration
  typescript-config/ # Shared TypeScript configuration
```

## 🧩 Implementation Notes

- **Search, filter & sort** are handled by the server: the browse page sends `search`, `category`, `location`, and `sort` query parameters to the API, so filtering always runs on the full menu data rather than only the items already loaded on the page.
- **Authentication flow:** the client uses Better Auth for sessions (email/password and Google). For API calls, the client fetches a short-lived JWT from the auth server and sends it as a Bearer token; the API verifies it against the auth server's JWKS endpoint, so protected routes stay stateless and role checks run on the server for every request.
- **Featured placement:** the homepage loads vendor profiles alongside menu items and stably reorders the list so items from vendors with an active Premium subscription appear first, keeping the newest-first order inside each group.

## 👨‍💻 Author

**Sabbir Roman**

- GitHub: https://github.com/Sabbirromanbai
- Portfolio: https://my-protfolio-bice-chi.vercel.app/
- LinkedIn: https://www.linkedin.com/in/md-sabbir-hossen-9000593b6/
