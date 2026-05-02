# Sublet - AMR Home Solutions Co-Living Rental Platform

**Hosted by:** AMR Home Solutions  
**Type:** Co-living room rentals  
**AI Bot:** AIrene (handles all engagements)

An AI-powered co-living room rental platform for AMR Home Solutions, Malaysia. Features 100% automation from listing creation to offer acceptance. Inspired by AMR Home Solutions design (orange + grey).

**Sublet** = sub-let = letting whole property, then sub-letting by individual rooms.

## Features

- **AI Bot "AIrene"** - Handles ALL engagements from start to finish
- **AI Room Listings** - Auto-generate descriptions and captions from photos/videos
- **Multi-Channel Marketing** - Auto-post to Instagram, Facebook, WhatsApp, and website
- **Prospect Management** - Inquiry capture, viewing bookings, offer submission
- **Property & Tenant Management** - Full CRUD with lease lifecycle tracking
- **Financial Reports** - Income, expenses, profit by source, consolidated financials
- **Malaysian Compliance** - LHDN tax brackets, Zakat perniagaan calculations, SSM export templates
- **Notifications** - In-app alerts for payment due dates and lease expirations
- **Excel Export** - Business summaries, tax reports, fullset accounts per Malaysia accounting standard
- **JV Stakeholder Portal** - Limited dashboard for investors within vicinity. AMR Homes may also own properties and become a JV Stakeholder itself, subletting their own properties.
- **Damage Reporting** - Document damages during tenancy
- **Exit Process** - Exit checklist, final payment, deposit return

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma 7 ORM
- **Charts**: Recharts
- **Excel**: xlsx library
- **Auth**: Email/password with bcrypt hashing

## Target Users

- **AMR Homes Admins:** Full access to everything (manage properties, tenants, finances, AI funnel)
- **JV Stakeholders:** Let their property for AMR to sublet and manage. Their contribution is their properties. In return they get profit sharing portion.
- **Prospect Tenants:** Selective, all online fully automated
- **Property Owners (Future):** External owners may contact to list properties for AMR to sublet (next project)

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Using Docker (Recommended)

```bash
git clone <repository-url>
cd sublet
cp .env.example .env
docker-compose up -d
# Open http://localhost:3000
```

### Local Development

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed  # Optional
npm run dev
# Open http://localhost:3000
```

## Scripts

```bash
npm run dev          # Development server
npm run build       # Production build
npm run lint        # Lint code
npm run typecheck   # TypeScript check
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema
npm run db:seed     # Seed data
```

## Business Model

**AMR Home Solutions** runs a co-living room rental business:
- Sublet properties → fully furnish → rent individual rooms to tenants
- Target: Young adults fresh in workforce who can't afford whole property
- Dual purpose:
  1. Profit from room rentals
  2. "Amal jariah" — help less fortunate build careers

## Malaysian Compliance

- **Currency**: Malaysian Ringgit (MYR) stored as sen integers
- **Entity**: Sole Proprietorship (different from company per Malaysia law)
- **Tax**: LHDN Form B for sole proprietor
- **Zakat**: Zakat perniagaan at 2.5% with RM 20,000 nisab
- **Accounting**: Fullset accounts per Malaysia accounting standard
- **SSM**: Form 9 and Form 44 export templates

## License

Private project for AMR Home Solutions.