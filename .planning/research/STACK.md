# Technology Stack

**Project:** Sublet Property Management Platform  
**Researched:** April 2026  
**Confidence:** HIGH (verified via npm, official docs, current market trends)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 16.x | Full-stack React framework | App Router is production-mature with React Server Components, Server Actions, and streaming. Turbopack for fast dev builds. |
| **React** | 19.x | UI library | Ships with Next.js 16. Supports concurrent features, Actions, and use() hook for async data in components. |
| **TypeScript** | 6.x | Type safety | Strict mode catches bugs at compile time. Latest version has improved inference and faster type checking. |

### Database & ORM

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Prisma** | 7.x | ORM | Type-safe queries, migrations, and excellent DX. Version 7 has improved connection pooling and better SQLite support. |
| **SQLite** | 3.x | Database | Zero-config, file-based, portable. Perfect for small property owners. Can migrate to PostgreSQL later if needed. |

### Styling & UI

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 4.x | Utility-first CSS | CSS-first configuration (no tailwind.config.js). Native @theme directive. Integrates with shadcn/ui seamlessly. |
| **shadcn/ui** | latest | Component library | Copy-paste components (not a package). Full code ownership. Built on Radix primitives. Matches minimalist aesthetic. |
| **Lucide React** | 1.x | Icons | Tree-shakeable, consistent stroke width, MIT licensed. Replaces deprecated icon libraries. |

### Form Handling & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | 7.x | Form state | Minimal re-renders, uncontrolled inputs. Native Form component in React 19. |
| **Zod** | 4.x | Schema validation | TypeScript-first. Works seamlessly with React Hook Form resolvers. |

### Excel Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **xlsx** | 0.18.x | Excel generation | Most downloaded Excel library. Reads/writes XLSX, XLS, ODS, CSV. Works in both Node.js and browser. Supports styling, formulas, and multiple sheets. |

### Utilities

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **clsx** | 2.x | Conditional classes | Tiny (263 bytes), fast string concatenation for conditional Tailwind classes. |
| **tailwind-merge** | 3.x | Class merging | Merges Tailwind classes without conflicts. Used by shadcn/ui. |
| **date-fns** | 4.x | Date formatting | Tree-shakeable, consistent API. Lightweight alternative to moment/dayjs. |

---

## Installation

```bash
# Core dependencies
npm install next@latest react@latest react-dom@latest typescript@latest

# Database
npm install prisma@latest @prisma/client@latest

# Styling
npm install tailwindcss@latest @tailwindcss/postcss@latest

# UI Components (shadcn/ui)
npx shadcn@latest init
npx shadcn@latest add button card input table dialog form select label

# Form handling
npm install react-hook-form@latest zod@latest @hookform/resolvers@latest

# Excel export
npm install xlsx@latest

# Utilities
npm install clsx tailwind-merge lucide-react date-fns
```

---

## Alternative Choices Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| **Database** | SQLite | PostgreSQL | Overkill for small-scale. SQLite is portable and zero-config. |
| **ORM** | Prisma | Drizzle | Prisma has better migration tooling and type-safety DX for this use case. |
| **UI Library** | shadcn/ui | Mantine | shadcn/ui provides code ownership and matches minimalist design. Mantine is heavier and includes its own styling system. |
| **Excel** | xlsx | ExcelJS | xlsx has better browser support and wider format coverage. ExcelJS is better for complex streaming scenarios. |
| **Styling** | Tailwind CSS | CSS Modules | Tailwind's utility approach scales better for complex UIs. CSS Modules are fine for simpler projects. |

---

## Malaysian Ringgit (MYR) Implementation

### Currency Formatting

Use the native `Intl.NumberFormat` API — no external library needed:

```typescript
// formatCurrency.ts
const MYR_FORMATTER = new Intl.NumberFormat('ms-MY', {
  style: 'currency',
  currency: 'MYR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return MYR_FORMATTER.format(amount);
}

// Output: "RM 1,500.00"
```

### Currency in Forms

```typescript
// Parse MYR input (remove "RM", spaces, commas)
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[RM,\s]/g, '');
  return parseFloat(cleaned) || 0;
}
```

### Date Formatting (Malaysian Locale)

```typescript
const MY_DATE_FORMATTER = new Intl.DateTimeFormat('ms-MY', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

// Output: "05/04/2026"
```

---

## Responsive Design Strategy

### Mobile-First Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Landscape phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Key Responsive Patterns

| Pattern | Implementation | When to Use |
|---------|---------------|-------------|
| **Fluid typography** | `text-base sm:text-lg lg:text-xl` | Headings, body text |
| **Stack → Grid** | `flex-col md:grid md:grid-cols-2 lg:grid-cols-3` | Card layouts |
| **Hide on mobile** | `hidden md:block` | Secondary navigation |
| **Simplify on mobile** | Conditionally render complex components | Data tables, charts |

### Dashboard Layout

```tsx
// Mobile: Single column, collapsible sidebar
// Tablet: Sidebar + main content
// Desktop: Expanded sidebar + wide content area

<div className="flex min-h-screen flex-col md:flex-row">
  <Sidebar className="w-full md:w-64" />
  <main className="flex-1 p-4 md:p-6">
    {/* Content adapts automatically */}
  </main>
</div>
```

---

## Project Structure

```
sublet/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes
│   │   ├── (dashboard)/      # Protected routes
│   │   ├── api/              # API routes
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── [feature]/        # Feature components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities, Prisma client
│   ├── services/              # Business logic
│   └── types/                 # TypeScript types
├── .env                       # Environment variables
└── package.json
```

---

## Prisma Schema Template

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Property {
  id          String   @id @default(uuid())
  name        String
  address     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  tenants     Tenant[]
  
  @@index([deletedAt])
}

model Tenant {
  id          String   @id @default(uuid())
  name        String
  email       String?
  phone       String?
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  payments    Payment[]
  
  @@index([propertyId])
}

model Payment {
  id          String   @id @default(uuid())
  amount      Float
  currency    String   @default("MYR")
  dueDate     DateTime
  paidAt      DateTime?
  status      String   @default("pending")
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tenantId])
  @@index([dueDate])
}
```

---

## Environment Variables

```bash
# .env
DATABASE_URL="file:./dev.db"
```

---

## Sources

| Resource | Confidence | Notes |
|----------|------------|-------|
| npm registry (version checks) | HIGH | Direct package version verification |
| nextjs.org/blog | HIGH | Official Next.js release notes |
| prisma.io/docs | HIGH | Official Prisma documentation |
| tailwindcss.com | HIGH | Official Tailwind CSS v4 docs |
| shadcn/ui | HIGH | Official component documentation |
| pkgpulse.com comparison articles | MEDIUM | Current 2026 market analysis |
| medium/@dilit guide | MEDIUM | Setup guide for Next.js 15 + Tailwind v4 |

---

## Confidence Assessment

| Component | Confidence | Rationale |
|-----------|------------|-----------|
| Next.js 16 | HIGH | Latest stable, npm verified |
| React 19 | HIGH | Latest stable, npm verified |
| TypeScript 6 | HIGH | Latest stable, npm verified |
| Prisma 7 | HIGH | Latest stable, npm verified, widely adopted |
| Tailwind CSS 4 | HIGH | CSS-first config is current direction |
| shadcn/ui | HIGH | 75K+ GitHub stars, dominant in ecosystem |
| xlsx library | HIGH | Most downloaded (40M+/week), npm verified |

