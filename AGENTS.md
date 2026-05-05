# Agent Instructions for Sublet Room Rental Management Platform

## Project Overview

**Hosted by:** AMR Home Solutions  
**Type:** Co-living room rentals  
**AI Bot:** AIrene (handles all engagements)  
**Inspiration:** AMR Home Solutions (clean, minimalist, orange + grey — refer AMR Home Solutions logo in sublet folder)

**Features:** Tenant/Property Management, Financial Tracking (fullset accounts per Malaysia accounting standard), Excel Exports, Notifications, AI Bot for all engagements, Damage Reporting, Exit Process

---

## Build/Lint/Test Commands

### When the project is initialized, use these conventions:

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --testNamePattern="pattern"  # Run single test
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Linting & Formatting
npm run lint             # Lint all files
npm run lint:fix         # Lint and auto-fix
npm run format           # Format with Prettier
npm run typecheck        # TypeScript type checking

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open database studio

# Utility
npm run commit           # Interactive commit (Conventional Commits)
```

---

## Code Style Guidelines

### General Principles
- **Minimalist and clean** — match AMR Home Solutions inspired design (orange + grey)
- **Type-safe** — use TypeScript strictly, no `any` types
- **Functional patterns** — prefer pure functions, immutability
- **Small components** — single responsibility, max 150 lines per file

### TypeScript Conventions

```typescript
// Types vs Interfaces — use interface for public APIs, type for unions/intersections
interface UserProps {
  id: string;
  name: string;
}

type Status = 'pending' | 'active' | 'inactive';

// Use explicit return types for functions
function getUser(id: string): Promise<UserProps> { }

// Non-null assertion only when absolutely certain
const element = document.getElementById('app')!;
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `property-list.tsx`, `use-auth.ts` |
| Components | PascalCase | `PropertyCard.tsx`, `DashboardLayout.tsx` |
| Hooks | camelCase with `use` prefix | `useProperty.ts`, `useAuth.ts` |
| Utilities | camelCase | `formatCurrency.ts`, `validateEmail.ts` |
| Constants | UPPER_SNAKE | `MAX_PROPERTIES`, `API_BASE_URL` |
| Database tables | snake_case plural | `properties`, `tenants`, `payments` |
| API endpoints | kebab-case plural | `/api/properties`, `/api/tenants` |

### React/Component Conventions

```tsx
// Component file structure
import { useState, useCallback } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui';
import { useProperty } from '@/hooks';
import type { Property } from '@/types';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
  onSelect?: (id: string) => void;
}

export const PropertyCard: FC<PropertyCardProps> = ({ property, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isLoading } = useProperty(property.id);

  const handleSelect = useCallback(() => {
    onSelect?.(property.id);
  }, [onSelect, property.id]);

  if (isLoading) return <PropertyCardSkeleton />;

  return (
    <article className={styles.card} onClick={handleSelect}>
      {/* ... */}
    </article>
  );
};
```

### Import Order
1. React / Framework imports
2. Third-party libraries
3. Internal types/interfaces
4. Internal hooks
5. Internal components
6. Internal utilities
7. Assets/images
8. Styles (CSS modules last)

```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import type { Property, Tenant } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { PropertyCard } from '@/components/PropertyCard';
import { formatCurrency, formatDate } from '@/utils/format';
import styles from './Dashboard.module.css';
```

### Error Handling

```typescript
// Use Result pattern or structured error handling
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// API calls with proper error handling
async function fetchProperty(id: string): Promise<Result<Property>> {
  try {
    const response = await api.get(`/properties/${id}`);
    return { ok: true, value: response.data };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { ok: false, error };
    }
    return { ok: false, error: new Error('Failed to fetch property') };
  }
}

// Component error boundaries for graceful degradation
class PropertyErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
}
```

### Database Conventions (Prisma/SQL)
- Use snake_case for column names
- Include `createdAt` and `updatedAt` on all tables
- Soft deletes preferred (`deletedAt` nullable)
- UUID for primary keys
- Index frequently queried columns

### API Design
- RESTful endpoints: `/api/v1/resources`
- JSON responses with consistent structure:
```json
{
  "data": {},
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error

### Excel Integration Conventions
- CSV export format with headers matching Excel template columns
- Payment data mapping: Tenant Name → Date → Amount → Status
- Audit trail logging for all financial exports
- Fullset accounts per Malaysia accounting standard

### Commit Message Format (Conventional Commits)
```
feat: add property search filter
fix: resolve tenant list pagination issue
docs: update API documentation
style: adjust dashboard card spacing
refactor: extract payment validation logic
test: add unit tests for currency formatting
chore: update dependencies
```

### File Organization
```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base components (Button, Input, Card)
│   └── [feature]/    # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Third-party library configs
├── pages/            # Page components (Next.js) or routes
├── services/         # API and business logic
├── types/            # TypeScript interfaces and types
├── utils/            # Utility functions
├── styles/           # Global styles and variables
└── __tests__/        # Test files alongside source
```

### Testing Conventions
- Test files: `[filename].test.ts` or `[filename].test.tsx`
- Test structure: Arrange → Act → Assert
- Use `describe` blocks for grouping related tests
- Mock external dependencies (API calls, database)
- Aim for 80% code coverage on business logic

```typescript
describe('formatCurrency', () => {
  it('formats MYR currency correctly', () => {
    const result = formatCurrency(1500, 'MYR');
    expect(result).toBe('RM 1,500.00');
  });

  it('handles zero amount', () => {
    const result = formatCurrency(0, 'MYR');
    expect(result).toBe('RM 0.00');
  });
});
```

### Malaysian Compliance Notes (Sole Proprietor - AMR Home Solutions)
- Currency: Malaysian Ringgit (MYR) — use `Intl.NumberFormat`
- Date format: DD/MM/YYYY for local, ISO 8601 for storage
- Fiscal year alignment for reports
- Tax calculations per Malaysian tax standards (Form B for sole proprietor)
- Zakat perniagaan calculation (different from company)
- Zakat offset against tax
- Accounting per Malaysia accounting standards (different from Sdn Bhd)

---

## Security Guidelines
- Never expose secrets in code — use environment variables
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication/authorization checks
- Log sensitive operations for audit trail

---

## AI Bot: AIrene

AIrene is the AI bot that handles ALL engagements from start to finish:
- Responds to all inquiries
- Qualifies prospects (MUST verify: Malaysian, Muslim, eligible marital status, no children)
- Schedules viewings
- Handles offers
- Manages exit process

### AIrene Tenant Qualification Rules
AIrene MUST verify these before proceeding with any inquiry:
1. **Nationality:** Must be Malaysian — reject all others
2. **Religion:** Must be Muslim — reject non-Muslims
3. **Gender matching:** Muslimin prospects → male rooms only; Muslimah prospects → female rooms only
4. **Marital status:** Single OK, married-separated OK, divorced-no-kids OK; married-together NOT OK, divorced-with-kids NOT OK
5. **Children:** No children living with tenant — reject if yes

All tenant/prospect engagements are automated. Admins only involved for:
- Providing materials (photos/videos)
- Viewing sessions
- Closing deals
- Exit inspections

---

## Room Concept & Tenant Eligibility

### Co-Living Model
- AMR Homes provides **co-living spaces** — tenants share living hall, kitchen, and bathroom/toilet
- **Two room types:**
  - **Single Room:** 1 bed, 1 tenant
  - **Shared Room:** 2 single beds, max 2 tenants
- **Contract:** 1-year lease, minimum 6 full months from 1st of the month
- **Early exit:** Tenants who move out before completing 6 months forfeit their deposit
- **Gender-segregated housing:** Separate living arrangements for Muslimin (men) and Muslimah (women)

### Tenant Eligibility (ENFORCED)
- **Nationality:** Malaysian only
- **Religion:** Muslim only (Muslimin for male rooms, Muslimah for female rooms)
- **Marital status:**
  - Single (never married) — eligible
  - Married but staying single away from spouse — eligible
  - Divorced with no children living with tenant — eligible
  - Married (living with spouse) — NOT eligible
  - Divorced with children living with tenant — NOT eligible
- **Children:** No children living with tenant

### Room Status Workflow
- `draft` → Room being set up (photos, description incomplete)
- `available` → Room published and open for inquiries (click "Publish" to activate)
- `listed` → Room being marketed on social media
- `rented` → Tenant has moved in
- `maintenance` → Room undergoing cleanup/repairs after tenant move-out
- **Admin workflow:** Create as draft → Complete setup → Click "Publish" → Room becomes available
- After tenant move-out: Room auto-goes to "maintenance" → Admin completes cleanup → Click "Publish" → Room available again

### Sharing Behavior
- Single "Share" button (not individual platform buttons)
- Mobile: Uses native Web Share API (opens phone share sheet with WhatsApp, Instagram DM, etc.)
- Desktop: Dropdown with WhatsApp, Facebook, Telegram, Copy Link
- Pre-filled WhatsApp message: "Eh, nice room for rent! Check it out: [url]"

---

## Target Users

- **AMR Homes Admins:** Full access to everything (manage properties, tenants, finances, AI funnel)
- **JV Stakeholders:** Let their property for AMR to sublet and manage. Their contribution is their properties. In return they get profit sharing portion. AMR Homes may also own properties and become a JV Stakeholder itself, subletting their own properties.
- **Prospect Tenants:** Malaysian Muslim only. Selective, all online fully automated via AIrene. Gender-segregated co-living (Muslimin/Muslimah sections).
- **Property Owners (Future):** In next project, external property owners may contact to list properties for AMR Homes to sublet

---

*Last updated: 2026-05-05*