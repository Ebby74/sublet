# Codebase Structure

**Analysis Date:** 2026-04-05

## Current State

**Status:** Greenfield project - no source code exists yet

```
/home/ebby/sublet/
├── AGENTS.md              # Agent instructions and conventions
├── idea.md                # Project concept and mockups
└── .planning/
    └── codebase/          # This directory
```

## Planned Directory Layout

Based on AGENTS.md conventions, the project will follow this structure:

```
sublet/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   ├── dashboard/         # Dashboard routes
│   │   │   └── page.tsx
│   │   ├── properties/        # Property management
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── tenants/           # Tenant management
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reports/           # Financial reports
│   │   │   └── page.tsx
│   │   ├── settings/          # User settings
│   │   │   └── page.tsx
│   │   └── api/               # API routes
│   │       └── v1/
│   │           ├── properties/
│   │           │   └── route.ts
│   │           ├── tenants/
│   │           │   └── route.ts
│   │           ├── payments/
│   │           │   └── route.ts
│   │           └── exports/
│   │               └── excel/route.ts
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/          # Dashboard-specific
│   │   │   ├── StatCard.tsx
│   │   │   ├── IncomeChart.tsx
│   │   │   └── OccupancyWidget.tsx
│   │   ├── properties/         # Property features
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyForm.tsx
│   │   │   └── PropertyList.tsx
│   │   ├── tenants/           # Tenant features
│   │   │   ├── TenantCard.tsx
│   │   │   ├── TenantForm.tsx
│   │   │   └── TenantList.tsx
│   │   ├── payments/          # Payment features
│   │   │   ├── PaymentForm.tsx
│   │   │   ├── PaymentTable.tsx
│   │   │   └── PaymentStatus.tsx
│   │   └── layout/            # Layout components
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useProperty.ts
│   │   ├── useTenant.ts
│   │   ├── usePayment.ts
│   │   ├── useAuth.ts
│   │   └── useToast.ts
│   ├── services/              # Business logic layer
│   │   ├── property.service.ts
│   │   ├── tenant.service.ts
│   │   ├── payment.service.ts
│   │   ├── report.service.ts
│   │   └── excel.service.ts
│   ├── lib/                   # Third-party configs
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth configuration
│   │   └── excel-client.ts    # Microsoft Graph client
│   ├── types/                 # TypeScript definitions
│   │   ├── property.ts
│   │   ├── tenant.ts
│   │   ├── payment.ts
│   │   ├── user.ts
│   │   └── api.ts             # API response types
│   ├── utils/                 # Utility functions
│   │   ├── format.ts          # Currency, date formatting
│   │   ├── validation.ts      # Input validation
│   │   └── helpers.ts
│   └── __tests__/             # Test files (alongside source)
│       ├── components/
│       ├── services/
│       └── utils/
├── public/                    # Static assets
│   ├── images/
│   └── fonts/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts        # [PLANNED] Styling approach
├── prisma/schema.prisma
└── .env                      # Environment variables (gitignored)
```

## Directory Purposes

**`prisma/`:**
- Purpose: Database schema and migrations
- Contains: `schema.prisma`, migrations, seed data
- Key files: `schema.prisma`, `seed.ts`

**`src/app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components, layouts, route handlers
- Key files: `layout.tsx`, `page.tsx`, `api/**/route.ts`

**`src/components/`:**
- Purpose: Reusable UI components
- Contains: React components organized by feature
- Key files: `ui/` (base components), feature subdirectories

**`src/hooks/`:**
- Purpose: Custom React hooks for state and API interaction
- Contains: Data fetching hooks, UI state hooks
- Naming: `use{Noun}.ts` pattern

**`src/services/`:**
- Purpose: Business logic and data transformation
- Contains: Service classes/functions per domain
- Pattern: Returns `Result<T>` types

**`src/lib/`:**
- Purpose: Third-party library configurations
- Contains: Prisma client, auth config, API clients
- Key files: `prisma.ts`, `auth.ts`

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Domain types, API response types
- Naming: `interface` for public APIs, `type` for unions

**`src/utils/`:**
- Purpose: Pure utility functions
- Contains: Formatters, validators, helpers
- Pattern: Pure functions, no side effects

**`src/__tests__/`:**
- Purpose: Test files
- Contains: Unit and integration tests
- Naming: `[filename].test.ts` or `[filename].test.tsx`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Landing/root page
- `src/app/layout.tsx`: Root layout wrapper
- `src/app/dashboard/page.tsx`: Dashboard (post-login)

**Configuration:**
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `prisma/schema.prisma`: Database schema
- `.env`: Environment variables (not committed)

**Core Logic:**
- `src/services/*.ts`: Business logic
- `src/app/api/v1/*/route.ts`: API handlers
- `src/lib/prisma.ts`: Database access

**Testing:**
- `src/__tests__/*.test.ts`: Test files

## Naming Conventions

**Files:**
| Type | Convention | Example |
|------|------------|---------|
| Pages | kebab-case | `property-list.tsx` |
| Components | PascalCase | `PropertyCard.tsx` |
| Hooks | camelCase with `use` | `use-property.ts` |
| Services | camelCase | `property.service.ts` |
| Utils | camelCase | `format-currency.ts` |
| Types | kebab-case | `property.ts` |

**Directories:**
- Feature directories: kebab-case (`properties/`, `tenants/`)
- Base directories: lowercase (`components/`, `hooks/`)

## Where to Add New Code

**New Feature Module:**
1. Add API routes: `src/app/api/v1/{feature}/route.ts`
2. Add service: `src/services/{feature}.service.ts`
3. Add types: `src/types/{feature}.ts`
4. Add hook: `src/hooks/use{Feature}.ts`
5. Add components: `src/components/{feature}/*.tsx`
6. Add page: `src/app/{feature}/page.tsx`
7. Add tests: `src/__tests__/{feature}/`

**New UI Component:**
1. Base component: `src/components/ui/{Component}.tsx`
2. Export from: `src/components/ui/index.ts`
3. Tests: `src/__tests__/components/{Component}.test.tsx`

**New Utility:**
1. Add to: `src/utils/{utility}.ts`
2. Export from: `src/utils/index.ts`
3. Tests: `src/__tests__/utils/{utility}.test.ts`

**New API Endpoint:**
1. Create route: `src/app/api/v1/{resource}/route.ts`
2. Implement handler with validation
3. Add service method if needed
4. Add integration tests

## Special Directories

**`.env`:**
- Purpose: Environment variables and secrets
- Generated: Yes (manually or from template)
- Committed: No (gitignored)

**`public/`:**
- Purpose: Static assets served directly
- Generated: No
- Committed: Yes (images, fonts)

**`prisma/migrations/`:**
- Purpose: Database schema migrations
- Generated: Yes (via `prisma migrate`)
- Committed: Yes (version control for schema)

---

*Structure analysis: 2026-04-05*
