# Football Manager — Friendly Tournament App

## Overview

A full-stack **Football Tournament Manager** web app for organizing friendly eFootball/FIFA match tournaments. Built as a pnpm monorepo with a React frontend and an Express API backend.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (v4), drizzle-zod |
| API client | Orval codegen (OpenAPI → React Query hooks + Zod schemas) |
| Frontend | React + Vite, TailwindCSS, shadcn/ui, wouter, framer-motion |
| Email | Resend (via Replit integration) |

## Project Structure

```text
├── artifacts/
│   ├── api-server/          # Express REST API (port from $PORT env)
│   └── efootball-manager/   # React + Vite SPA (served at /)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas (manually extended for new types)
│   └── db/                  # Drizzle ORM schema + PostgreSQL connection
└── scripts/
```

## Features Implemented

### Tournament Formats (6 total)
- **League** — Full round-robin (home & away), points table
- **Knockout** — Single elimination bracket (2 / 4 / 8 / 16 players)
- **Cup** — Two-legged knockout (home + away each round)
- **Groups + Knockout** — Group stage then knockout (8 or 16 players, World Cup style)
- **Double Elimination** — Winners + losers bracket, 2 losses to be out
- **Swiss System** — No elimination, paired by record each round

### Tournament Management
- Create via registration (public sign-up link with WhatsApp + game username) or manual player selection
- Auto bracket/fixture generation on tournament creation
- Match result entry with live standings (W=3, D=1, L=0, GD, GF, form badges)
- Knockout bracket visual display
- Winner podium display on completion
- Tournament scheduling (date picker)
- Search and filter on dashboard (by name, type, status)

### User System
- Account creation with **email verification** (6-digit OTP via Resend)
- MX record validation before OTP send
- Sessions with `express-session`
- Plan tiers: `free`, `monthly` ($2/mo), `yearly` ($7/yr), `lifetime` ($15)
- **Pricing page** with "Request Upgrade" flow (pre-filled mailto to admin)
- Post-signup rating modal (5 stars + comment, stored in `ratings` table)

### Admin Panel
- Login: username `admin`, password from `ADMIN_PASSWORD` env secret
- **User Management** (`/admin/users`) — view all accounts, change plan instantly
- **Inquiries** (`/admin/inquiries`) — view/search/filter contact submissions, add notes, mark resolved
- **Tournament management** — edit name, player cap, scheduled date; delete tournaments
- **Registration approvals** — approve/reject player registrations; auto-generates fixtures when cap is reached

### Contact / Inquiry System
- `/contact` page visible to all users (name, email, subject pills, message)
- Submissions stored in `inquiries` table with status tracking

### eFootball Account Marketplace
- `/marketplace` hub with verified account listings, filters, account inspection, and escrow start flow
- Escrow workflow with vault protection, credential handoff, verification, disputes, and cooldown tracking
- Account scanner, anti-scam reports, seller authentication/portal, negotiation chat, seller reviews, and VPN safety guide
- Marketplace state currently uses seeded listings and client-side Zustand state; API persistence routes are reserved for a future backend expansion

### UI / Design
- Soccer-master-inspired charcoal theme (`#222831`) with pink-magenta accents matching the uploaded sidebar reference
- Fonts: Montserrat (headings and navigation), Rajdhani (gaming labels), Outfit (body)
- Sidebar navigation with role-aware links (admin sees User Management + Inquiries)
- Responsive layout (mobile + desktop)

## Database Tables

| Table | Purpose |
|---|---|
| `players` | Global player pool |
| `tournaments` | All tournaments (type enum: league/knockout/cup/groups_knockout/double_elimination/swiss) |
| `tournament_players` | Junction: which players are in each tournament |
| `fixtures` | Auto-generated match fixtures (round, knockoutPhase) |
| `tournament_registrations` | Public sign-up submissions (pending/approved/rejected) |
| `users` | User accounts (username, email, plan, emailVerified) |
| `email_verifications` | OTP codes for email verification |
| `ratings` | Post-signup star ratings + comments |
| `inquiries` | Contact form submissions (open/resolved) |

## Environment Secrets Required

| Secret | Purpose |
|---|---|
| `SESSION_SECRET` | Express session signing key |
| `ADMIN_PASSWORD` | Admin login password |

Resend integration is configured via Replit Connectors for email delivery.

## Key Commands

```bash
# Development
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/efootball-manager run dev

# Database
pnpm --filter @workspace/db run push         # sync schema
pnpm --filter @workspace/db run push-force   # force sync (new enum values etc.)

# API client codegen (run after editing OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```

## Admin Credentials

- **Username**: `admin`
- **Password**: value of `ADMIN_PASSWORD` env secret (fallback: `efootball2026` for dev only)

## Notes

- The `lib/api-zod/src/generated/` types are orval-generated but have been manually extended to support the 6 tournament format enum values (orval only knows about the initial 2).
- All API routes use `credentials: 'include'` on the client side for session cookies.
- Free users are blocked from creating tournaments by the `requireCreator` middleware which returns `403 UPGRADE_REQUIRED`.
