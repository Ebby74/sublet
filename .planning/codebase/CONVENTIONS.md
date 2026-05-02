# Coding Conventions

**Analysis Date:** 2026-04-05

## General Principles

- **Minimalist and clean** — Hostfully-inspired design aesthetic
- **Type-safe** — TypeScript strictly, no `any` types
- **Functional patterns** — prefer pure functions, immutability
- **Small components** — single responsibility, max 150 lines per file

## TypeScript Conventions

### Types vs Interfaces

```typescript
// Use interface for public APIs
interface UserProps {
  id: string;
  name: string;
}

// Use type for unions/intersections
type Status = 'pending' | 'active' | 'inactive';
```

### Function Signatures

```typescript
// Use explicit return types for functions
function getUser(id: string): Promise<UserProps> { }

// Non-null assertion only when absolutely certain
const element = document.getElementById('app')!;
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `property-list.tsx`, `use-auth.ts` |
| Components | PascalCase | `PropertyCard.tsx`, `DashboardLayout.tsx` |
| Hooks | camelCase with `use` prefix | `useProperty.ts`, `useAuth.ts` |
| Utilities | camelCase | `formatCurrency.ts`, `validateEmail.ts` |
| Constants | UPPER_SNAKE | `MAX_PROPERTIES`, `API_BASE_URL` |
| Database tables | snake_case plural | `properties`, `tenants`, `payments` |
| API endpoints | kebab-case plural | `/api/properties`, `/api/tenants` |

## Import Order

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

## React/Component Conventions

### Component File Structure

```tsx
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

## Error Handling

### Result Pattern

```typescript
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
```

### Error Boundaries

```typescript
class PropertyErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
}
```

## Database Conventions (Prisma/SQL)

- Use snake_case for column names
- Include `createdAt` and `updatedAt` on all tables
- Soft deletes preferred (`deletedAt` nullable)
- UUID for primary keys
- Index frequently queried columns

## API Design

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

## Malaysian Market Specifics

### Currency

- Malaysian Ringgit (MYR)
- Use `Intl.NumberFormat` for formatting
- Format: `RM 1,500.00`

### Date Formats

- Local display: DD/MM/YYYY
- Storage: ISO 8601 (YYYY-MM-DD)

### Compliance

- Fiscal year alignment for reports
- Tax calculations per Malaysian tax standards

## Excel Integration

- Microsoft Graph API for Excel Online sync
- CSV export with headers matching Excel template columns
- Payment data mapping: Tenant Name → Date → Amount → Status
- Audit trail logging for all financial exports

## File Organization

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

## Commit Message Format (Conventional Commits)

```
feat: add property search filter
fix: resolve tenant list pagination issue
docs: update API documentation
style: adjust dashboard card spacing
refactor: extract payment validation logic
test: add unit tests for currency formatting
chore: update dependencies
```

---

*Convention analysis: 2026-04-05*
