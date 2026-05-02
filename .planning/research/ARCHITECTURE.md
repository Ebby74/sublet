# Architecture Patterns

**Domain:** Property Management SaaS Platform
**Researched:** April 2026
**Confidence:** MEDIUM-HIGH

## Executive Summary

Property management systems follow predictable architectural patterns centered on multi-tenant data isolation, financial transaction tracking, and notification pipelines. The architecture must support small property owners managing 1-50 properties while scaling to larger portfolios. Key decisions: shared database with tenant scoping (not separate schemas), Next.js App Router with route groups for tenant/marketing separation, and Server Components for data-heavy pages.

---

## Recommended Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │   Web Browser    │  │   Mobile Web    │  │   Dashboard      │       │
│  │   (Next.js)      │  │   (Responsive)  │  │   Widgets        │       │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘       │
└───────────┼──────────────────────┼──────────────────────┼────────────────┘
            │                      │                      │
            ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EDGE / PROXY LAYER                               │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                    middleware.ts / proxy.ts                      │     │
│  │  • Tenant resolution (subdomain/custom domain)                  │     │
│  │  • Set x-tenant header                                          │     │
│  │  • Route rewriting to tenant route group                         │     │
│  └─────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                                 │
│                                                                          │
│  ┌──────────────────────┐    ┌──────────────────────┐                  │
│  │   (marketing)         │    │   (tenant)            │                  │
│  │   Route Group         │    │   Route Group         │                  │
│  │                       │    │                       │                  │
│  │   /, /pricing,        │    │   /dashboard,         │                  │
│  │   /about, /contact    │    │   /properties,       │                  │
│  │                       │    │   /tenants,          │                  │
│  │   Public pages        │    │   /payments,         │                  │
│  │                       │    │   /reports           │                  │
│  └──────────────────────┘    └──────────────────────┘                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Server Components                              │    │
│  │  • Data fetching (direct DB access)                              │    │
│  │  • SEO metadata generation                                       │    │
│  │  • SSR/ISR for dashboard pages                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Client Components                              │    │
│  │  • Interactive forms (useFormState, useFormStatus)               │    │
│  │  • Real-time updates (payments, notifications)                    │    │
│  │  • File uploads (Excel import)                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    lib/db/queries.ts                             │    │
│  │  • All queries scoped by tenantId                               │    │
│  │  • No raw queries outside this layer                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ tenants    │  │ properties │  │ tenants    │  │ payments   │        │
│  │            │  │            │  │ (people)   │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ leases     │  │ invoices   │  │ export_log │  │ notifs     │        │
│  │            │  │            │  │            │  │            │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Email      │  │ SMS        │  │ Excel API  │  │ Stripe     │        │
│  │ (Resend)   │  │ (Twilio)   │  │ (Export)   │  │ (Billing)  │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### Core Components and Responsibilities

| Component | Responsibility | Talks To | Boundaries |
|-----------|----------------|----------|------------|
| **middleware.ts** | Tenant resolution, header injection | Next.js routing | Sets `x-tenant`, rewrites URLs |
| **lib/tenant.ts** | Tenant context access | Server Components | Reads headers, caches per-request |
| **lib/db/queries.ts** | All data access | Database | Enforces tenant scoping |
| **app/(tenant)/layout.tsx** | Tenant branding, auth | Server Components | Provides TenantProvider context |
| **components/forms/** | User input handling | Server Actions | useFormState for mutations |
| **lib/exports.ts** | Excel generation | Excel libraries | Returns file buffers |

### Data Access Layer Rules

```
CRITICAL: All database queries MUST be tenant-scoped.

❌ NEVER do this:
   const properties = await db.select().from(propertiesTable);

✅ ALWAYS do this:
   const tenant = await getTenant();
   const properties = await db.select()
     .from(propertiesTable)
     .where(eq(propertiesTable.tenantId, tenant.id));
```

### Component Communication Flow

```
User Action
    │
    ▼
Client Component (React)
    │
    ├──[Interactive UI]──► Server Action (lib/actions/)
    │                              │
    │                              ▼
    │                      lib/db/queries.ts
    │                              │
    │                              ▼
    │                      PostgreSQL
    │                              │
    │                              ▼
    │                      Return result
    │
    └──[Data Display]──► Server Component (app/)
                               │
                               ▼
                         Direct DB query
                               │
                               ▼
                         Render HTML
```

---

## Database Schema Design

### Core Tables

```prisma
// schema.prisma

model Tenant {
  id            String   @id @default(uuid())
  slug          String   @unique
  name          String
  email         String   @unique
  logoUrl       String?
  primaryColor  String   @default("#0066FF")
  customDomain  String?  @unique
  plan          String   @default("starter")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  properties    Property[]
  people        Person[]
  leases        Lease[]
  invoices      Invoice[]
  payments      Payment[]
  exports       ExportLog[]
  notifications Notification[]
  
  @@index([slug])
  @@map("tenants")
}

model Property {
  id            String   @id @default(uuid())
  tenantId      String
  
  // Property details
  name          String
  address       String
  city          String
  state         String
  postalCode    String
  country       String   @default("MY")
  
  // Property type
  type          String   // "residential", "commercial"
  
  // Financial
  monthlyRent   Decimal  @db.Decimal(10, 2)
  currency      String   @default("MYR")
  
  // Metadata
  bedrooms      Int?
  bathrooms     Int?
  sqft          Int?
  yearBuilt     Int?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime? // Soft delete
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  units         Unit[]
  leases        Lease[]
  
  @@index([tenantId])
  @@map("properties")
}

model Unit {
  id            String   @id @default(uuid())
  propertyId    String
  
  unitNumber    String
  floor         Int?
  
  // Financial
  monthlyRent   Decimal  @db.Decimal(10, 2)
  
  // Status
  status        String   @default("vacant") // "vacant", "occupied", "maintenance"
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  property      Property @relation(fields: [propertyId], references: [id])
  leases        Lease[]
  
  @@unique([propertyId, unitNumber])
  @@index([propertyId])
  @@map("units")
}

model Person {
  id            String   @id @default(uuid())
  tenantId      String
  
  // Identity
  type          String   // "tenant", "owner", "guarantor"
  firstName     String
  lastName      String
  email         String?
  phone         String?
  
  // For tenants
  emergencyContact String?
  emergencyPhone  String?
  
  // Address (for lease agreements)
  address       String?
  city           String?
  state          String?
  postalCode     String?
  country        String   @default("MY")
  
  // KYC
  icNumber      String?  // Malaysian IC
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  leases        Lease[]
  
  @@index([tenantId])
  @@map("people")
}

model Lease {
  id            String   @id @default(uuid())
  tenantId      String
  propertyId    String?
  unitId        String?
  tenantPersonId String
  
  // Lease terms
  startDate     DateTime
  endDate       DateTime
  monthlyRent   Decimal  @db.Decimal(10, 2)
  securityDeposit Decimal @db.Decimal(10, 2)
  
  // Status
  status        String   @default("active") // "draft", "active", "expired", "terminated"
  
  // PDF storage
  documentUrl   String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  property      Property? @relation(fields: [propertyId], references: [id])
  unit          Unit?     @relation(fields: [unitId], references: [id])
  tenantPerson  Person   @relation(fields: [tenantPersonId], references: [id])
  invoices      Invoice[]
  
  @@index([tenantId])
  @@index([propertyId])
  @@map("leases")
}

model Invoice {
  id            String   @id @default(uuid())
  tenantId      String
  leaseId       String
  personId      String?
  
  // Invoice details
  invoiceNumber String
  issueDate     DateTime
  dueDate       DateTime
  
  // Amounts (in cents to avoid floating point)
  subtotalCents Int
  taxCents      Int      @default(0)
  totalCents    Int
  
  // Status
  status        String   @default("pending") // "draft", "pending", "paid", "overdue", "cancelled"
  
  // Line items as JSON
  items         Json     // [{description, quantity, unitPriceCents, totalCents}]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  lease         Lease    @relation(fields: [leaseId], references: [id])
  payments      Payment[]
  
  @@unique([tenantId, invoiceNumber])
  @@index([tenantId])
  @@index([leaseId])
  @@map("invoices")
}

model Payment {
  id            String   @id @default(uuid())
  tenantId      String
  invoiceId     String?
  personId      String?
  
  // Payment details
  amountCents   Int
  currency      String   @default("MYR")
  paymentDate   DateTime
  
  // Method
  method        String   // "bank_transfer", "cash", "check", "online"
  reference     String?  // Bank reference, check number, etc.
  
  // Status
  status        String   @default("completed") // "pending", "completed", "failed", "refunded"
  
  // For reconciliation
  matchedInvoiceId String?
  matchedAt     DateTime?
  
  notes         String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  invoice       Invoice?  @relation(fields: [invoiceId], references: [id])
  
  @@index([tenantId])
  @@index([invoiceId])
  @@map("payments")
}

model ExportLog {
  id            String   @id @default(uuid())
  tenantId      String
  
  // Export details
  type          String   // "payments", "invoices", "tenants"
  format        String   // "xlsx", "csv"
  
  // File
  fileName      String
  fileSize      Int
  fileUrl       String?
  
  // Filters used
  filters       Json     // {dateFrom, dateTo, propertyIds, ...}
  
  // Status
  status        String   @default("pending") // "pending", "processing", "completed", "failed"
  
  // Audit
  createdBy     String
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@map("export_logs")
}

model Notification {
  id            String   @id @default(uuid())
  tenantId      String
  
  // Notification
  type          String   // "payment_due", "payment_received", "lease_expiring", "payment_overdue"
  title         String
  message       String
  
  // Delivery
  channel       String   // "email", "sms", "in_app"
  status        String   @default("pending") // "pending", "sent", "failed"
  
  // Targeting
  targetPersonId String?
  targetEmail    String?
  targetPhone    String?
  
  // Scheduling
  scheduledFor  DateTime?
  sentAt        DateTime?
  
  createdAt     DateTime @default(now())
  
  // Relations
  tenant        Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId])
  @@index([status, scheduledFor])
  @@map("notifications")
}
```

### Indexes for Common Queries

```sql
-- Dashboard: recent payments by tenant
CREATE INDEX idx_payments_tenant_date ON payments(tenant_id, payment_date DESC);

-- Reports: payments by property and date range
CREATE INDEX idx_payments_property_dates ON payments(tenant_id, property_id, payment_date)
  WHERE tenant_id IS NOT NULL;

-- Lease lookup by property
CREATE INDEX idx_leases_property ON leases(property_id, status);

-- Invoice status by tenant
CREATE INDEX idx_invoices_status ON invoices(tenant_id, status, due_date);

-- Notification scheduling
CREATE INDEX idx_notifications_scheduled ON notifications(status, scheduled_for)
  WHERE status = 'pending';
```

---

## API Design for Financial Exports

### RESTful Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exports` | List export history |
| POST | `/api/exports` | Create new export |
| GET | `/api/exports/[id]` | Get export status |
| GET | `/api/exports/[id]/download` | Download export file |

### Export API Design

```typescript
// app/api/exports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenant } from '@/lib/tenant';
import { createExport, getTenantExports } from '@/lib/db/queries';
import { generatePaymentReport } from '@/lib/exports';

// GET /api/exports - List export history
export async function GET(request: NextRequest) {
  const tenant = await getTenant();
  const { searchParams } = new URL(request.url);
  
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const exports = await getTenantExports(tenant.id, { limit, offset });
  
  return NextResponse.json({
    data: exports,
    meta: { limit, offset }
  });
}

// POST /api/exports - Create new export
export async function POST(request: NextRequest) {
  const tenant = await getTenant();
  const body = await request.json();
  
  const { type, format, filters } = body;
  
  // Validate
  if (!['payments', 'invoices', 'tenants'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid export type' },
      { status: 400 }
    );
  }
  
  // Create export record
  const exportJob = await createExport(tenant.id, {
    type,
    format: format || 'xlsx',
    filters,
    createdBy: tenant.id,
  });
  
  // Start async generation (in production, use a job queue)
  generatePaymentReport(exportJob.id, tenant.id, filters)
    .catch(console.error);
  
  return NextResponse.json({
    data: exportJob,
    status: 'pending'
  }, { status: 201 });
}
```

### Excel Export Schema

```typescript
// lib/exports/payment-report.ts

import ExcelJS from 'exceljs';

interface PaymentReportFilters {
  dateFrom?: string;
  dateTo?: string;
  propertyIds?: string[];
  status?: string;
}

export async function generatePaymentReport(
  exportId: string,
  tenantId: string,
  filters: PaymentReportFilters
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Payments');
  
  // Headers
  sheet.columns = [
    { header: 'Payment Date', key: 'paymentDate', width: 15 },
    { header: 'Reference', key: 'reference', width: 20 },
    { header: 'Property', key: 'property', width: 25 },
    { header: 'Tenant', key: 'tenant', width: 25 },
    { header: 'Amount (MYR)', key: 'amount', width: 15 },
    { header: 'Method', key: 'method', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  
  // Style headers
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0066FF' }
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  
  // Fetch and write data
  const payments = await getPaymentsForExport(tenantId, filters);
  
  for (const payment of payments) {
    sheet.addRow({
      paymentDate: payment.paymentDate.toLocaleDateString('en-GB'),
      reference: payment.reference || '-',
      property: payment.propertyName,
      tenant: payment.tenantName,
      amount: payment.amountCents / 100,
      method: payment.method,
      status: payment.status,
    });
  }
  
  // Add totals row
  const totalRow = sheet.addRow([
    'TOTAL',
    '',
    '',
    '',
    payments.reduce((sum, p) => sum + p.amountCents, 0) / 100,
    '',
    '',
  ]);
  totalRow.font = { bold: true };
  
  // Auto-fit columns
  sheet.columns.forEach(column => {
    const maxLength = Math.max(
      (column.header?.length || 10),
      ...((column as any).values?.map((v: string) => v?.length || 10) || [])
    );
    column.width = Math.min(maxLength + 2, 50);
  });
  
  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Update export record
  await updateExportStatus(exportId, {
    status: 'completed',
    fileSize: buffer.length,
    fileUrl: await saveExportFile(exportId, buffer),
  });
  
  return { success: true };
}
```

---

## Mobile-Responsive Patterns

### Breakpoint Strategy

```css
/* Mobile-first responsive design */

:root {
  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --space-6: 3rem;
  
  /* Container widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
}

/* Mobile (< 640px) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .sidebar-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
  }
}
```

### Responsive Component Patterns

```tsx
// components/layout/DashboardShell.tsx

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>
      
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r">
        <SidebarContent />
      </aside>
      
      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <SidebarContent />
      </MobileDrawer>
      
      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// components/data/ResponsiveTable.tsx

export function ResponsiveTable({ data, columns }: ResponsiveTableProps) {
  return (
    <div className="space-y-4">
      {/* Desktop: Full table */}
      <div className="hidden md:block overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                    {col.render?.(row) || row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile: Card list */}
      <div className="md:hidden space-y-3">
        {data.map(row => (
          <div key={row.id} className="bg-white rounded-lg border p-4 shadow-sm">
            {columns.map((col, i) => (
              <div key={col.key} className="flex justify-between py-1">
                <span className="text-sm text-gray-500">{col.label}</span>
                <span className="text-sm font-medium">
                  {col.render?.(row) || row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Data Flow

### Authentication Flow

```
User visits tenant subdomain
        │
        ▼
middleware.ts
  • Extract tenant from subdomain
  • Set x-tenant header
  • Rewrite to /tenant/*
        │
        ▼
Tenant Layout
  • Check auth session (auth.js)
  • Load tenant config
  • Apply branding
        │
        ▼
Protected Routes
  • Server Components fetch data (tenant-scoped)
  • Or redirect to /login
```

### Payment Recording Flow

```
1. User submits payment form (Client Component)
          │
          ▼
2. Server Action: createPayment(formData)
          │
          ▼
3. Validate input (Zod schema)
          │
          ▼
4. Create payment record (tenant-scoped)
          │
          ├──► Create notification (payment received)
          │
          ▼
5. If invoice_id provided:
   • Update invoice status
   • Check if fully paid
   • Mark lease as active if needed
          │
          ▼
6. Return success/error
          │
          ▼
7. Client shows toast notification
          │
          ▼
8. Server revalidates dashboard
```

### Export Flow

```
1. User configures export (filters, format)
          │
          ▼
2. POST /api/exports
          │
          ▼
3. Create ExportLog record (status: pending)
          │
          ▼
4. Queue job (or run async)
          │
          ▼
5. Fetch data (tenant-scoped queries)
          │
          ▼
6. Generate Excel/CSV file
          │
          ▼
7. Upload to storage (S3/R2)
          │
          ▼
8. Update ExportLog (status: completed)
          │
          ▼
9. Send notification (optional)
          │
          ▼
10. User downloads from /api/exports/[id]/download
```

---

## Suggested Build Order (Dependencies)

### Phase 1: Foundation (Core Infrastructure)

**Build first** — everything else depends on these:

```
1. Database schema (Prisma migrations)
   └─► Creates: tenants, properties, people tables
   
2. Middleware + tenant resolution
   └─► Depends on: database (for tenant lookup)
   
3. Auth (Auth.js)
   └─► Depends on: middleware, database
   
4. Data access layer (lib/db/queries.ts)
   └─► Depends on: auth, tenant context
```

**Why:** These create the foundation that all features build upon. No feature works without tenant isolation and auth.

### Phase 2: Property & Tenant Management

**Dependencies:** Phase 1 complete

```
5. Property CRUD pages
   └─► Uses: property queries, forms
   
6. Person/Tenant CRUD pages
   └─► Uses: person queries, forms
   
7. Property-Tenant association
   └─► Uses: properties, people
```

**Why:** Properties and tenants are the core entities. Financial features need these to exist first.

### Phase 3: Financial Core

**Dependencies:** Phase 2 complete

```
8. Lease management
   └─► Links property + person + terms
   
9. Invoice generation
   └─► Depends on: leases
   
10. Payment recording
    └─► Depends on: invoices
    
11. Payment-Invoice matching
    └─► Depends on: payments, invoices
```

**Why:** Financial features require properties and tenants to be defined so you know what/who to bill.

### Phase 4: Reports & Exports

**Dependencies:** Phase 3 complete

```
12. Dashboard with metrics
    └─► Aggregates: payments, invoices, occupancy
    
13. Payment reports
    └─► Depends on: payments
    
14. Excel export functionality
    └─► Depends on: payment reports
```

**Why:** Reports need data to exist. Build features that generate data before building features that display it.

### Phase 5: Notifications

**Dependencies:** Phase 3 complete (need payment/lease data)

```
15. Notification service
    └─► Uses: payment/invoice data
    
16. Email integration
    └─► Uses: notification service
    
17. Scheduled notifications (cron)
    └─► Uses: payment due dates, lease expiring
```

**Why:** Notifications are reactive — they respond to data events. Build the data events first.

### Phase 6: Polish & Scale

**Dependencies:** Phase 5 complete

```
18. Mobile responsive refinement
    └─► Based on: all pages
    
19. Performance optimization (ISR)
    └─► Based on: data access patterns
    
20. Excel import
    └─► Depends on: all entities
```

---

## Anti-Patterns to Avoid

### 1. Missing Tenant Scoping

```typescript
// ❌ WRONG: No tenant check
export async function getProperties() {
  return db.select().from(properties);
}

// ✅ CORRECT: Always scoped
export async function getProperties() {
  const tenant = await getTenant();
  return db.select()
    .from(properties)
    .where(eq(properties.tenantId, tenant.id));
}
```

**Why:** Data leaks between tenants are a catastrophic security failure. Enforce scoping at the data access layer, not in each route.

### 2. Client-Side Tenant Resolution

```typescript
// ❌ WRONG: Resolving tenant in client
function PropertyPage() {
  const tenant = useTenantFromURL(); // Exposes tenant info to client
  
  // Client can now manipulate tenant context
  const { data } = useSWR(`/api/properties?tenant=${tenant}`);
}

// ✅ CORRECT: Server resolves tenant
async function PropertyPage() {
  const tenant = await getTenant(); // Server-side only
  const properties = await getProperties(tenant.id);
  
  return <PropertyList properties={properties} />;
}
```

**Why:** Tenant context should be server-determined, not client-influenced. Never trust the client for security-critical decisions.

### 3. Storing Currency as Floats

```typescript
// ❌ WRONG: Floating point
const rent = 1500.99;
const tax = rent * 0.06; // 90.05940000000001

// ✅ CORRECT: Store as integers (cents)
const rentCents = 150099;
const taxCents = Math.round(rentCents * 0.06); // 9006
```

**Why:** Floating point arithmetic introduces rounding errors. Financial data must use integer cents.

### 4. Hardcoding Currency Formatting

```typescript
// ❌ WRONG: Hardcoded
const formatted = `RM ${amount.toFixed(2)}`;

// ✅ CORRECT: Locale-aware
const formatted = new Intl.NumberFormat('en-MY', {
  style: 'currency',
  currency: 'MYR',
}).format(amount);
```

**Why:** Currency formatting varies by locale and currency. Use `Intl.NumberFormat` for correct Malaysian formatting.

### 5. Not Soft-Deleting

```typescript
// ❌ WRONG: Hard delete
await db.delete(properties).where(eq(properties.id, id));

// ✅ CORRECT: Soft delete
await db.update(properties)
  .set({ deletedAt: new Date() })
  .where(eq(properties.id, id));
```

**Why:** Financial records must be auditable. Soft deletes preserve history for compliance and debugging.

---

## Scalability Considerations

### At 10 Properties (MVP)

| Concern | Approach |
|---------|----------|
| Database | Single PostgreSQL instance |
| Hosting | Vercel hobby or pro |
| File storage | Local filesystem or R2 |
| Background jobs | Built-in after() or cron |

### At 50 Properties

| Concern | Approach |
|---------|----------|
| Database | Add read replica |
| Queries | Add indexes on common filters |
| Exports | Stream large exports, paginate |
| Caching | ISR for dashboard, revalidate: 60 |

### At 200+ Properties

| Concern | Approach |
|---------|----------|
| Database | Connection pooling (PgBouncer) |
| Notifications | Dedicated queue (QStash, Trigger.dev) |
| Exports | Background job processing |
| Search | Full-text search on properties |

---

## Sources

- [Next.js Multi-Tenant SaaS Guide](https://nextjslaunchpad.com/article/nextjs-multi-tenant-saas-subdomain-routing-custom-domains-app-router) — HIGH confidence
- [Next.js Data Fetching in 2026](https://thelinuxcode.com/nextjs-data-fetching-in-2026-a-practical-guide-to-server-components-caching-and-real-world-tradeoffs/) — MEDIUM confidence
- [SaaS Pricing Models and Database Schema](https://dev.to/waqarhabib/saas-pricing-models-and-how-they-affect-your-database-schema-1ed8) — MEDIUM confidence
- [Azure API Design Best Practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design) — HIGH confidence
- [Drizzle ORM Multi-Tenant Patterns](https://medium.com/techkoala-insights/7-advanced-prisma-schema-patterns-for-complex-database-architecture-and-multi-tenant-applications-ac81ce771ed1) — MEDIUM confidence
