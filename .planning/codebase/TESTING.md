# Testing Patterns

**Analysis Date:** 2026-04-05

## Test Framework

**Runner:** Vitest (Next.js default)
**Assertion Library:** Built-in Vitest assertions
**Coverage:** 80% target for business logic

## Test Commands

```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --testNamePattern="pattern"  # Run single test
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
```

## Test File Organization

### Location

- Co-located with source files
- `__tests__/` subdirectory within each module

### Naming

- `[filename].test.ts` for TypeScript files
- `[filename].test.tsx` for React components

### Directory Structure

```
src/
├── components/
│   └── PropertyCard/
│       ├── PropertyCard.tsx
│       └── __tests__/
│           └── PropertyCard.test.tsx
├── utils/
│   ├── formatCurrency.ts
│   └── __tests__/
│       └── formatCurrency.test.ts
└── services/
    └── paymentService.ts
        └── __tests__/
            └── paymentService.test.ts
```

## Test Structure

### Arrange → Act → Assert Pattern

```typescript
describe('formatCurrency', () => {
  it('formats MYR currency correctly', () => {
    // Arrange
    const amount = 1500;
    const currency = 'MYR';

    // Act
    const result = formatCurrency(amount, currency);

    // Assert
    expect(result).toBe('RM 1,500.00');
  });

  it('handles zero amount', () => {
    // Arrange
    const amount = 0;
    const currency = 'MYR';

    // Act
    const result = formatCurrency(amount, currency);

    // Assert
    expect(result).toBe('RM 0.00');
  });
});
```

## Test Suite Organization

```typescript
describe('PropertyCard', () => {
  describe('rendering', () => {
    it('displays property name', () => { });
    it('displays property address', () => { });
  });

  describe('interactions', () => {
    it('calls onSelect when clicked', () => { });
    it('toggles expanded state', () => { });
  });

  describe('loading state', () => {
    it('shows skeleton while loading', () => { });
  });
});
```

## Mocking Strategies

### External Dependencies

Mock all external dependencies:
- API calls
- Database operations
- Third-party services (Excel, notifications)
- Browser APIs

### Mock Patterns

```typescript
// Mock API calls
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock hooks
jest.mock('@/hooks/useProperty', () => ({
  useProperty: () => ({
    data: mockProperty,
    isLoading: false,
  }),
}));

// Mock modules
jest.mock('@/lib/excel', () => ({
  exportToExcel: jest.fn(),
}));
```

### What to Mock

- API services (`src/services/`)
- Database layer
- Third-party SDKs (Excel, notifications)
- Browser APIs (localStorage, fetch)

### What NOT to Mock

- Pure utility functions (test directly)
- Simple helper functions
- Date/time utilities (use fake timers if needed)

## Fixtures and Factories

### Test Data Location

- Create `__fixtures__/` directories alongside tests
- Use factory functions for complex objects

```typescript
// __fixtures__/property.ts
export const createMockProperty = (overrides = {}): Property => ({
  id: 'prop-123',
  name: 'Sunny Apartment',
  address: '123 Main St, KL',
  rentAmount: 1500,
  currency: 'MYR',
  status: 'active',
  ...overrides,
});

// In tests
const property = createMockProperty({ name: 'Custom Name' });
```

## Async Testing

```typescript
it('fetches properties successfully', async () => {
  // Arrange
  const mockProperties = [createMockProperty()];
  (api.get as jest.Mock).mockResolvedValueOnce({ data: mockProperties });

  // Act
  const result = await fetchProperties();

  // Assert
  expect(result.ok).toBe(true);
  expect(result.value).toEqual(mockProperties);
});

it('handles fetch error', async () => {
  // Arrange
  (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

  // Act
  const result = await fetchProperties();

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error).toBeDefined();
});
```

## Error Testing

```typescript
it('throws ValidationError for invalid input', () => {
  // Arrange
  const invalidData = { amount: -100 };

  // Act & Assert
  expect(() => validatePayment(invalidData)).toThrow(ValidationError);
});

it('returns error result for API failure', () => {
  // Arrange
  (api.post as jest.Mock).mockRejectedValueOnce(new NotFoundError());

  // Act
  const result = await createPayment({});

  // Assert
  expect(result.ok).toBe(false);
  expect(result.error).toBeInstanceOf(NotFoundError);
});
```

## Coverage Requirements

### Targets

| Type | Target |
|------|--------|
| Business logic | 80% |
| Utilities | 90% |
| Components | 70% |
| API services | 80% |

### View Coverage

```bash
npm test -- --coverage
```

## Malaysian-Specific Testing

### Currency Formatting

```typescript
describe('formatCurrency', () => {
  it('formats MYR correctly', () => {
    expect(formatCurrency(1500, 'MYR')).toBe('RM 1,500.00');
  });

  it('formats negative amounts', () => {
    expect(formatCurrency(-500, 'MYR')).toBe('RM -500.00');
  });
});
```

### Date Formatting

```typescript
describe('formatDate', () => {
  it('formats date in DD/MM/YYYY for Malaysian display', () => {
    const date = new Date('2026-04-05');
    expect(formatDate(date, 'MY')).toBe('05/04/2026');
  });

  it('formats date in ISO 8601 for storage', () => {
    const date = new Date('2026-04-05');
    expect(formatDate(date, 'iso')).toBe('2026-04-05');
  });
});
```

---

*Testing analysis: 2026-04-05*
