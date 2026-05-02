# Codebase Concerns

**Analysis Date:** 2026-04-05

## Project Status

This is a new project with no source code yet. The following concerns are identified from project specifications in `AGENTS.md` and `idea.md` and should guide implementation decisions.

---

## Security Concerns

### Tenant/Property Data Protection

**Risk Level:** HIGH

- **Issue:** Property and tenant data contains sensitive personal information (names, contact details, rental agreements)
- **Files:** TBD - `src/types/` (future)
- **Mitigation:** Implement encryption at rest, row-level security in database, role-based access control (RBAC)
- **Required:** Audit logging for all data access

### Authentication & Authorization

**Risk Level:** HIGH

- **Issue:** Multi-user access requires robust authentication
- **AGENTS.md Requirement:** "Implement proper authentication/authorization checks"
- **Mitigation:**
  - Use established auth solution (NextAuth.js or similar)
  - Define clear roles: owner, property manager, viewer
  - Implement session management with secure token refresh
  - Never expose user credentials in logs or error messages

### Environment Variable Security

**Risk Level:** HIGH

- **Issue:** External service credentials (Microsoft Graph, payment APIs, database)
- **AGENTS.md Requirement:** "Never expose secrets in code — use environment variables"
- **Files:** `.env` (will exist)
- **Mitigation:**
  - All secrets in `.env` only (never committed)
  - Use `.env.example` as template with placeholder values
  - Validate env vars at startup, fail fast if missing

### SQL Injection Prevention

**Risk Level:** HIGH

- **Issue:** User inputs in property/tenant management could be vulnerable
- **AGENTS.md Requirement:** "Use parameterized queries to prevent SQL injection"
- **Mitigation:** Prisma ORM provides parameterized queries by default; avoid raw SQL

### Input Validation

**Risk Level:** MEDIUM

- **Issue:** All user inputs need validation and sanitization
- **AGENTS.md Requirement:** "Validate and sanitize all user inputs"
- **Mitigation:**
  - Zod or Yup for runtime validation
  - Sanitize rich text fields (contracts, notes)
  - Validate file uploads (CSV/XLSX) before processing

---

## Compliance Concerns

### Malaysian Financial Compliance

**Risk Level:** HIGH

- **Issue:** Financial records must meet Malaysian accounting standards
- **Requirements from `AGENTS.md`:**
  - Malaysian Ringgit (MYR) — use `Intl.NumberFormat`
  - Date format: DD/MM/YYYY local, ISO 8601 for storage
  - Fiscal year alignment for reports
  - Tax calculations per Malaysian tax standards
- **Files:** TBD - `src/utils/format.ts`, `src/services/tax.ts`
- **Mitigation:**
  - Create centralized currency formatter
  - Date utilities for Malaysian locale
  - Tax calculation module reviewed by Malaysian accountant

### Audit Trail Requirements

**Risk Level:** HIGH

- **Issue:** Property management requires audit trail for financial operations
- **Requirements from `idea.md`:**
  - "Audit trail & downloadable receipts"
  - "Compliance with Malaysian accounting standards"
- **Mitigation:**
  - Log all financial transactions with timestamp, user, action, before/after state
  - Immutable audit log table in database
  - Receipt generation with unique IDs and timestamps

### Data Retention

**Risk Level:** MEDIUM

- **Issue:** Malaysian regulations may require retention of financial records
- **Mitigation:** Soft deletes (`deletedAt` nullable per AGENTS.md convention) allow data recovery without permanent deletion

---

## Technical Concerns

### Microsoft Graph API Dependency

**Risk Level:** HIGH

- **Issue:** Excel Online sync via Microsoft Graph API is an external dependency
- **Source:** `idea.md` - "Microsoft Graph API / Office 365 Integration for automatic sync"
- **Risks:**
  - API rate limits (10,000 requests/minute/tenant)
  - OAuth token expiration and refresh
  - Microsoft service availability
  - User must have Microsoft 365 subscription
- **Mitigation:**
  - Implement robust token refresh logic
  - Add retry with exponential backoff
  - Provide graceful fallback to manual CSV export
  - Cache API responses where appropriate

### Excel Integration Complexity

**Risk Level:** HIGH

- **Issue:** Multiple integration paths create maintenance burden
- **Source:** `idea.md` - Power Automate, Zapier, Microsoft Graph API, CSV export
- **Risks:**
  - Multiple failure points
  - Inconsistent data mapping across integration paths
  - User confusion about which method to use
- **Mitigation:**
  - Standardize on one primary integration (Microsoft Graph API)
  - Keep CSV export as fallback
  - Document column mapping clearly
  - Test all integration paths in CI/CD

### Power Automate / Zapier Dependencies

**Risk Level:** MEDIUM

- **Issue:** Third-party workflow automation services
- **Risks:**
  - Service availability dependency
  - Cost scaling with usage
  - Complex debugging when workflows fail
- **Mitigation:**
  - Use these as optional enhancements, not core functionality
  - Implement direct API sync as primary path

### External Payment Integration

**Risk Level:** HIGH

- **Issue:** Payment processing adds PCI DSS compliance requirements
- **Source:** `idea.md` - "payment integration"
- **Mitigation:**
  - Use established payment gateway (Stripe, etc.)
  - Never store card data locally
  - Implement proper webhook handling

---

## Architecture Concerns

### Component Size Limit

**Risk Level:** LOW

- **Issue:** AGENTS.md specifies max 150 lines per file
- **Risk:** May be too restrictive for complex components
- **Mitigation:** Extract sub-components and hooks early; refactor if approaching limit

### Error Handling Pattern

**Risk Level:** MEDIUM

- **Issue:** Result pattern specified in `AGENTS.md` but not implemented
- **Files:** TBD - `src/services/`
- **Risk:** Inconsistent error handling across codebase
- **Mitigation:**
  - Implement Result type early
  - Add lint rule to enforce error handling
  - Create error boundary components

### TypeScript Strictness

**Risk Level:** LOW

- **Issue:** AGENTS.md forbids `any` types
- **Risk:** May slow initial development
- **Mitigation:** Use `unknown` with type guards instead of `any`

---

## Dependencies at Risk

### Next.js (if used)

**Risk Level:** LOW

- **Note:** Framework not explicitly specified; `src/pages/` suggests Next.js
- **Risk:** Version upgrades may break pages router if mixed with app router
- **Mitigation:** Choose one routing paradigm and stick with it

### Prisma ORM

**Risk Level:** LOW

- **Note:** Database ORM specified in `AGENTS.md`
- **Risk:** Prisma client API changes between major versions
- **Mitigation:** Pin Prisma version, test migrations thoroughly

### Third-Party UI Libraries

**Risk Level:** MEDIUM

- **Issue:** Using multiple UI libraries can cause inconsistent styling
- **Mitigation:** 
  - Standardize on shadcn/ui or Radix + Tailwind
  - Create wrapper components for any external components

---

## Scalability Considerations

### Multi-User Concurrency

**Risk Level:** MEDIUM

- **Issue:** Multiple users accessing same property data
- **Mitigation:**
  - Optimistic locking for updates
  - Real-time updates via WebSocket or polling
  - Conflict resolution UI

### Database Growth

**Risk Level:** LOW (initially)

- **Issue:** Financial records grow over time
- **Mitigation:**
  - Add indexes on frequently queried columns
  - Consider database partitioning for older records
  - Archive old data periodically

### Mobile Responsiveness

**Risk Level:** LOW

- **Issue:** Mobile-friendly design required per `idea.md`
- **Mitigation:**
  - Mobile-first CSS approach
  - Test on real mobile devices
  - Consider PWA for offline capability

---

## Missing Critical Features (Pre-Launch)

### Financial Report Accuracy

**Priority:** HIGH

- **Issue:** Income, expenses, profit calculations must be accurate
- **Required:**
  - Decimal precision for currency (no floating point)
  - Test all calculation scenarios
  - Include edge cases (partial payments, refunds)

### Receipt Generation

**Priority:** HIGH

- **Issue:** Downloadable receipts per `idea.md`
- **Required:**
  - Unique receipt IDs
  - Timestamp with timezone
  - PDF generation
  - Digital signature capability

### Backup & Recovery

**Priority:** HIGH

- **Issue:** Financial data loss is unacceptable
- **Required:**
  - Daily automated backups
  - Point-in-time recovery capability
  - Backup integrity verification

---

## Technical Debt (Identified Early)

### Test Coverage

**Risk Level:** MEDIUM

- **Issue:** 80% coverage target from AGENTS.md requires discipline
- **Mitigation:** Add coverage checks to CI/CD pipeline

### Error Boundary Implementation

**Risk Level:** MEDIUM

- **Issue:** Component error boundaries mentioned but not implemented
- **Mitigation:** Implement global error boundary early

### Logging Strategy

**Risk Level:** LOW

- **Issue:** "Log sensitive operations for audit trail" but logging strategy not defined
- **Mitigation:** Define log levels, formats, and destinations before implementation

---

## Summary Priority Matrix

| Category | Concern | Risk Level | Priority |
|----------|---------|------------|----------|
| Security | Tenant/Property Data Protection | HIGH | 1 |
| Security | Authentication & Authorization | HIGH | 1 |
| Compliance | Malaysian Financial Compliance | HIGH | 1 |
| Compliance | Audit Trail Requirements | HIGH | 1 |
| Technical | Microsoft Graph API Dependency | HIGH | 2 |
| Technical | Excel Integration Complexity | HIGH | 2 |
| Technical | External Payment Integration | HIGH | 2 |
| Security | Environment Variable Security | HIGH | 1 |
| Security | SQL Injection Prevention | HIGH | 1 |
| Missing | Financial Report Accuracy | HIGH | 1 |
| Missing | Receipt Generation | HIGH | 2 |
| Missing | Backup & Recovery | HIGH | 2 |

---

*Concerns audit: 2026-04-05*
