# Architecture

**Analysis Date:** 2026-04-05

## Pattern Overview

**Overall:** [PLANNED] Next.js Full-Stack Application with RESTful API

**Key Characteristics:**
- Server-side rendering with Next.js App Router
- Prisma ORM for database operations
- Type-safe API layer with consistent response envelopes
- React Server Components where appropriate
- Client components for interactive features

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │  Property   │  │  Financial  │              │
│  │    Page     │  │  Manager    │  │   Reports   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                     │
│  ┌──────┴────────────────┴────────────────┴──────┐              │
│  │            React Components / Hooks            │              │
│  │    (UI components, state management, forms)   │              │
│  └──────────────────────┬────────────────────────┘              │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────┼───────────────────────────────────────┐
│                    API Layer │                                    │
│  ┌──────────────────────┴────────────────────────┐              │
│  │              Next.js API Routes                │              │
│  │         /api/v1/properties, /api/v1/tenants     │              │
│  └──────────────────────┬────────────────────────┘              │
│                         │                                       │
│  ┌──────────────────────┴────────────────────────┐              │
│  │              Service Layer                      │              │
│  │   PropertyService, TenantService, PaymentSvc   │              │
│  └──────────────────────┬────────────────────────┘              │
│                         │                                       │
│  ┌──────────────────────┴────────────────────────┐              │
│  │           Data Access Layer (Prisma)           │              │
│  └──────────────────────┬────────────────────────┘              │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                    Data Layer │                                   │
│  ┌───────────────────────┴────────────────────────┐              │
│  │              SQLite/PostgreSQL                 │              │
│  │    properties, tenants, payments, users        │              │
│  └───────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│              External Integrations │                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│  │   Excel    │  │  Microsoft │  │  Email     │                   │
│  │  Export    │  │   Graph    │  │  Service   │                   │
│  └────────────┘  └────────────┘  └────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## Layers

**UI Layer:**
- Purpose: Render user interfaces, handle user interactions
- Location: `src/components/`, `src/pages/`
- Contains: React components, CSS modules, layouts
- Depends on: Hooks, types, utilities
- Used by: Browser (client-side), Server (RSC)

**Service Layer:**
- Purpose: Business logic encapsulation, data transformation
- Location: `src/services/`
- Contains: PropertyService, TenantService, PaymentService, ReportService
- Depends on: Prisma client, types
- Used by: API routes

**API Layer:**
- Purpose: HTTP endpoint handling, request validation, response formatting
- Location: `src/app/api/` (Next.js App Router)
- Contains: Route handlers for `/api/v1/*`
- Depends on: Services
- Used by: Client components, external clients

**Data Access Layer:**
- Purpose: Database operations, query building, migrations
- Location: `src/lib/prisma.ts`, `prisma/`
- Contains: Prisma client instance, schema, migrations
- Depends on: Database (SQLite/PostgreSQL)
- Used by: Services

## Data Flow

**Read Flow (Property List):**
```
User clicks "Properties" 
  → Client component calls API: GET /api/v1/properties
    → API route validates request
      → PropertyService.getAll() queries Prisma
        → Prisma executes SQL against database
          → Results returned to service
            → API formats response: { data, meta, error }
              → Client receives JSON
                → Component re-renders with data
```

**Write Flow (Create Payment):**
```
User submits payment form
  → Client validates input locally
    → POST /api/v1/payments with payment data
      → API validates request body
        → PaymentService.create() processes
          → Prisma creates record in transaction
            → Audit log entry created
              → Excel sync triggered (optional)
                → Success response returned
                  → UI updates, success toast shown
```

## Key Abstractions

**Result Pattern:**
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```
- Purpose: Explicit error handling without exceptions
- Examples: Used in all service methods

**Service Classes:**
- Purpose: Encapsulate business logic per domain
- Examples: `PropertyService`, `TenantService`, `PaymentService`

**Hook Abstractions:**
- Purpose: Client-side state and API interaction
- Examples: `useProperty()`, `useAuth()`, `usePayments()`

## API Design

**Endpoint Pattern:** RESTful with version prefix
```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

**Standard Response Envelope:**
```json
{
  "data": {},
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

**Endpoints (Planned):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/properties` | List all properties |
| GET | `/api/v1/properties/:id` | Get single property |
| POST | `/api/v1/properties` | Create property |
| PUT | `/api/v1/properties/:id` | Update property |
| DELETE | `/api/v1/properties/:id` | Soft-delete property |
| GET | `/api/v1/tenants` | List all tenants |
| GET | `/api/v1/payments` | List payments with filters |
| POST | `/api/v1/payments` | Record payment |
| GET | `/api/v1/reports/income` | Income report |
| POST | `/api/v1/exports/excel` | Export to Excel |

## Entry Points

**Web Application:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to root URL
- Responsibilities: Landing page, auth redirect

**API Routes:**
- Location: `src/app/api/v1/[resource]/route.ts`
- Triggers: HTTP requests to `/api/v1/*`
- Responsibilities: Route handling, validation, delegation

**Prisma Client:**
- Location: `src/lib/prisma.ts`
- Triggers: Service layer needs database access
- Responsibilities: Database connection, query execution

## Error Handling

**Strategy:** Structured error responses with Result pattern

**Patterns:**
- Service methods return `Result<T>` types
- API routes unwrap results and format HTTP responses
- Client hooks handle error states with React state
- Error boundaries catch React rendering errors

## Cross-Cutting Concerns

**Logging:** [PLANNED] Structured logging with request IDs
**Validation:** [PLANNED] Zod schemas for request validation
**Authentication:** [PLANNED] Session-based auth with secure cookies
**Authorization:** [PLANNED] Role-based access control (RBAC)

---

*Architecture analysis: 2026-04-05*
