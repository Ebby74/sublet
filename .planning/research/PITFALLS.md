# Domain Pitfalls: Sublet Property Management Platform

**Domain:** Property management for small Malaysian landlords
**Researched:** 2026-04-05
**Confidence:** MEDIUM-HIGH

> This document catalogs critical mistakes property management platforms make, with focus on Malaysian compliance, Excel integration, financial accuracy, and currency handling. Each pitfall includes warning signs, prevention strategies, and phase mapping.

---

## Critical Pitfalls

Mistakes that cause rewrites, compliance violations, or significant user trust loss.

### Pitfall 1: Floating-Point Currency Calculations

**What goes wrong:** Using JavaScript's native `number` type or database `FLOAT/REAL` types for monetary values causes precision errors that compound over time.

```javascript
// This is dangerous:
const rent = 0.1 + 0.2; // Returns 0.30000000000000004
// Monthly: invisible. 12 months × 50 properties = audit failure
```

**Why it happens:** Binary floating-point representation cannot exactly represent most decimal values. Financial calculations require exact arithmetic.

**Consequences:**
- Ledger balances that don't add up (e.g., total income RM 150,000.03 instead of RM 150,000.00)
- Failed audits when records don't match bank statements
- e-Invoice validation failures (LHDN requires exact totals)
- User trust erosion when receipts show weird decimal places

**Detection warning signs:**
- Receipt showing `RM 1,500.00000003`
- Database records with more than 2 decimal places for MYR
- Complaints about "mysterious cents" discrepancies
- Sum of individual transactions ≠ reported total

**Prevention:**
1. Store monetary values as integers (cents/sen) or use `DECIMAL(15,2)` in database
2. Use dedicated money libraries: `decimal.js`, `currency.js`, or `dinero.js`
3. Never perform arithmetic on rounded display values
4. Always round at display/presentation layer only

```typescript
// Recommended: Store as integer cents
interface Payment {
  amountSen: number;      // 150000 = RM 1,500.00
  currency: 'MYR';
}

// Use decimal library for calculations
import Decimal from 'decimal.js';
const total = new Decimal(payment.amountSen)
  .dividedBy(100)
  .plus(additionalCharge)
  .toDecimalPlaces(2)
  .times(100)
  .toNumber();
```

**Phase to address:** Phase 1 (Foundation) — before any financial features

---

### Pitfall 2: Malaysian Tax Compliance Blindness

**What goes wrong:** Building financial features without considering LHDN e-invoice requirements, rental income tax, and SST implications.

**Why it happens:** Malaysian e-invoicing (MyInvois) is mandatory. Phase 4 businesses (RM1M-RM5M revenue) must comply from January 2026, with full penalties from January 2027. Small landlords often don't know they have compliance obligations.

**Consequences:**
- Manual workarounds that users abandon
- Inability to generate LHDN-compliant records
- Tax filing errors (wrong income reported)
- Penalties: RM200-RM20,000 per non-compliant invoice

**Detection warning signs:**
- No TIN/IC field for tenants or landlords
- Rental receipts without proper serial numbers
- No way to track tax withheld vs. tax payable
- Financial reports don't map to LHDN reporting categories

**Prevention:**
1. Design data model with tax fields from day one:
   - Landlord TIN (for e-invoice issuance)
   - MSIC code classification
   - Tax type indicator (SST/none)
   - Withholding tax tracking (if applicable)

2. Implement RM10,000 threshold logic:
   - Any transaction ≥RM10,000 requires individual e-invoice
   - Cannot be consolidated

3. Plan for e-invoice structure (even if not implementing full API yet):
   - Document numbering convention
   - Buyer/Supplier information capture
   - Line item breakdown capability

**Phase to address:** Phase 1 (Foundation) — data model design

---

### Pitfall 3: Excel Export Data Loss

**What goes wrong:** Exporting financial data to Excel that loses precision, formatting, or meaning during the transfer.

**Why it happens:** Excel has multiple data format challenges:
- Dates stored as serial numbers (45000 = Jan 2023)
- Long numbers truncated (1234567890123 → 1234567890120)
- Currency symbols stripped or misinterpreted
- Multiple sheets required for related data
- Hidden columns/rows cause misalignment

**Consequences:**
- Accountant receives corrupted data file
- Reconciliation takes longer than manual entry
- Audit trail gaps when data doesn't match original records
- Users stop trusting exports, revert to manual entry

**Real-world example:** One insurer's broker files contained hidden rows with commission adjustments, causing them to miss 15% of updates for months. (Source: Adeptia)

**Detection warning signs:**
- Users manually re-entering exported data into their accounting software
- Complaints about "dates looking wrong" in Excel
- Currency amounts showing as plain numbers without RM
- Export file size suspiciously small (data truncation)

**Prevention:**
1. Use CSV for simple tabular exports (no formatting corruption)
2. For Excel format, use a library that writes actual cells:
   - `xlsx` (SheetJS) for Node.js
   - Explicit column width and format specification
   - Never rely on Excel auto-detection

3. Validate exports before download:
   - Sum of exported values = sum of displayed values
   - Row count matches
   - Date format explicitly set (DD/MM/YYYY for Malaysian context)

```typescript
// Example: Safe Excel export with proper formatting
import * as XLSX from 'xlsx';

function exportPayments(payments: Payment[]) {
  const ws = XLSX.utils.json_to_sheet(payments);
  
  // Explicit column formats
  ws['!cols'] = [
    { wch: 20 },  // Date
    { wch: 15 },  // Amount
    { wch: 30 },  // Description
  ];
  
  // Force text for amounts to prevent truncation
  payments.forEach((p, i) => {
    const cell = `B${i + 2}`;
    ws[cell].t = 'n';  // Force number type
    ws[cell].z = '"RM"#,##0.00';  // Malaysian currency format
  });
}
```

4. Include export metadata sheet:
   - Export timestamp
   - Filter criteria used
   - Record count
   - Software version

**Phase to address:** Phase 2 (Financial Core) — export functionality

---

### Pitfall 4: Rounding Strategy Mismatch

**What goes wrong:** Inconsistent rounding across the system causes penny differences that cascade through reports.

**Why it happens:** Multiple rounding decisions in one transaction:
- Per-line item rounding
- Tax calculation rounding
- Discount application rounding
- Total calculation rounding

Each step can introduce ±1-2 sen errors that compound.

**Consequences:**
- Monthly reports don't sum to annual totals
- Bank deposits don't match recorded income
- Users can't reconcile with bank statements
- Audit queries about "unexplained differences"

**Detection warning signs:**
- "Rounding adjustment" line items appearing in reports
- Reports that say "includes rounding"
- Discrepancies of exactly RM 0.01, 0.02, etc.
- Different totals on same data (screen vs. export)

**Prevention:**
1. Define canonical rounding rules in one place:

```typescript
// Rounding configuration - single source of truth
const ROUNDING = {
  currency: 'MYR',
  precision: 2,           // 2 decimal places
  method: 'HALF_UP',     // Banker's rounding vs. standard
  applyAt: 'transaction', // When to round: line | transaction | invoice
};
```

2. Use "penny rounding" account:
   - Small discrepancies accumulate in a suspense account
   - Monthly review of rounding account
   - Clear audit trail for adjustments

3. Never round intermediate results — only final presentation

**Phase to address:** Phase 1 (Foundation) — before financial data model

---

### Pitfall 5: Manual Override Culture

**What goes wrong:** Building a system flexible enough that users bypass normal workflows for "quick fixes."

**Why it happens:** Property managers need flexibility for edge cases:
- Rent reduction for good tenant
- Waived late fees
- Custom payment arrangements
- Ad-hoc adjustments

Without governance, these become undocumented changes.

**Consequences:**
- Ledger shows income that never arrived
- Reports can't explain differences
- Audit trail is incomplete
- Financial records unreliable

**From ExactEstate research:** "Override culture — manual overrides are one of the most damaging structural risks."

**Detection warning signs:**
- High frequency of manual journal entries
- "Adjusted" fields without explanation
- Users creating parallel spreadsheets "just in case"
- Payment records with future-dated changes

**Prevention:**
1. Structured exception workflow:
   - Override requires explicit reason selection
   - Override needs approval above certain threshold
   - Override creates audit record automatically
   - Overridden values shown with original for comparison

2. Hard limits with escalation, not flexibility:
   - Waive late fee? → System records waiver reason, approval
   - Reduce rent? → New agreement document required
   - Custom payment? → Formal payment plan created

3. Dashboard showing override frequency:
   - Makes manual intervention visible
   - Identifies systemic issues
   - Encourages process improvement

**Phase to address:** Phase 2 (Financial Core) — payment workflows

---

### Pitfall 6: Missing Audit Trail for Financial Records

**What goes wrong:** Financial changes made without tracking who changed what, when, and why.

**Why it happens:** Fast iteration, missing createdAt/updatedAt, no change logging. Initial focus on features over compliance tracking.

**Consequences:**
- Cannot prove income figures during tax audit
- Cannot investigate disputed transactions
- Users lose trust when they can't find historical records
- LHDN compliance failure (no supporting documentation)

**Detection warning signs:**
- "Who changed this?" questions without answers
- Deleted transactions with no recovery option
- Backdated entries without explanation
- Tenant disputes with no evidence to resolve

**Prevention:**
1. Immutable financial records:
   - Payments are insert-only (corrections via reversal)
   - Edits create new version, old version retained
   - Deletion sets deletedAt, doesn't remove record

2. Automatic audit fields:

```typescript
interface FinancialRecord {
  id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  // For sensitive fields:
  modifiedFields?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    modifiedAt: Date;
    modifiedBy: string;
  }[];
}
```

3. Retention policy:
   - Financial records: 7 years (LHDN requirement)
   - Audit logs: 7 years minimum
   - Export/archive capability for compliance

**Phase to address:** Phase 1 (Foundation) — data model and infrastructure

---

## Moderate Pitfalls

Mistakes that cause significant effort to fix but don't require rewrites.

### Pitfall 7: Currency Display Inconsistency

**What goes wrong:** Showing "RM 1500" in one place, "RM1,500.00" in another, and "1500.00" elsewhere.

**Why it happens:** Multiple developers, no defined format standard, ad-hoc string concatenation.

**Prevention:**
1. Single formatting utility:

```typescript
// lib/format.ts
import { Intl.NumberFormat } from '@/utils/intl';

export function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // If stored as sen
}

// Usage: formatCurrency(150000) → "RM 1,500.00"
```

2. Consistent across:
   - Dashboard cards
   - Table cells
   - Receipts
   - Exports
   - Email notifications

**Phase to address:** Phase 1 (Foundation) — shared utilities

---

### Pitfall 8: Excel Import Data Loss

**What goes wrong:** Allowing data import from Excel that overwrites or duplicates existing records without validation.

**Why it happens:** Import is seen as "nice to have" convenience feature, implemented with minimal validation.

**Consequences:**
- Duplicate tenants created
- Payments linked to wrong properties
- Historical data corrupted
- Users lose confidence in system accuracy

**Prevention:**
1. Import validation before commit:
   - Row-by-row validation with error report
   - Preview changes before applying
   - Option to import "new only" vs "update existing"

2. Required fields mapping:
   - Date format detection (DD/MM/YYYY vs MM/DD/YYYY)
   - Currency amount detection (with/without RM prefix)
   - Required field presence check

3. Dry-run import:
   - Show what will be created
   - Highlight conflicts
   - Require explicit confirmation

**Phase to address:** Phase 3 (Data Management) — import/export features

---

### Pitfall 9: Date Format Confusion

**What goes wrong:** Mixing Malaysian (DD/MM/YYYY) and US (MM/DD/YYYY) date formats, especially in Excel exports.

**Why it happens:** JavaScript `Date` object uses ISO format internally. Excel interprets dates based on system locale. Confusion when displaying or importing.

**Prevention:**
1. Store dates as ISO 8601 (YYYY-MM-DD) in database
2. Always parse with explicit format:

```typescript
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Explicitly parse Malaysian date format
const paymentDate = dayjs('05/04/2026', 'DD/MM/YYYY').toISOString();
```

3. Export with explicit format string:

```typescript
// Prevent Excel locale interpretation
XLSX.utils.json_to_sheet(rows.map(r => ({
  ...r,
  date: dayjs(r.date).format('DD/MM/YYYY'), // Explicit string
})));
```

**Phase to address:** Phase 1 (Foundation) — shared utilities

---

### Pitfall 10: Property State Transitions Without Validation

**What goes wrong:** Allowing properties to move between states (vacant → occupied → maintenance) without validating the transition is legal.

**Why it happens:** Simple boolean flags or enum without business rule enforcement.

**Prevention:**
1. Explicit state machine:

```typescript
const PROPERTY_STATES = {
  VACANT: ['OCCUPIED', 'MAINTENANCE'],
  OCCUPIED: ['VACANT', 'MAINTENANCE'],
  MAINTENANCE: ['VACANT'],
  INACTIVE: ['VACANT'],
} as const;

function canTransition(from: PropertyState, to: PropertyState): boolean {
  return PROPERTY_STATES[from].includes(to);
}
```

2. Transition triggers:
   - OCCUPIED → VACANT: requires end lease date
   - VACANT → OCCUPIED: requires active tenant
   - Any → MAINTENANCE: requires reason

**Phase to address:** Phase 2 (Financial Core) — property management

---

## Minor Pitfalls

Common mistakes with localized impact.

### Pitfall 11: Soft Delete Without Considering Financial Records

**What goes wrong:** Soft-deleting (setting deletedAt) a property or tenant orphans associated financial records.

**Prevention:**
- Never allow deletion of properties/tenants with associated payments
- Archive with full context instead
- Financial history must remain traceable

**Phase to address:** Phase 1 (Foundation) — data integrity rules

---

### Pitfall 12: Mobile Input for Financial Amounts

**What goes wrong:** Keyboard type not optimized for numbers, leading to entry errors.

**Prevention:**
- Use `inputmode="decimal"` for amount fields
- Show formatted preview as user types
- Validate on blur, not on every keystroke

**Phase to address:** Phase 2 (Financial Core) — UI components

---

### Pitfall 13: Notification Fatigue

**What goes wrong:** Sending too many notifications for minor events, causing users to ignore or disable all alerts.

**Prevention:**
1. Batch notifications:
   - "3 payments received today" instead of 3 separate alerts
   - Daily summary vs. instant alerts

2. User-configurable thresholds:
   - "Alert me when rent is 3+ days late"
   - "Alert me when balance drops below RM X"

**Phase to address:** Phase 3 (Data Management) — notification system

---

## Phase-Specific Warnings

| Phase | Critical Pitfalls to Avoid | Priority |
|-------|---------------------------|----------|
| **Phase 1 (Foundation)** | Pitfalls 1, 2, 4, 6, 7, 9, 11 | Critical |
| **Phase 2 (Financial Core)** | Pitfalls 3, 5, 10, 12 | High |
| **Phase 3 (Data Management)** | Pitfalls 8, 13 | Medium |

### Phase 1 Warnings

**Architecture decision point:** This is where currency handling and data model are set. Wrong decisions here require complete rebuild.

**Must have before Phase 2:**
- [ ] Integer-based monetary storage (sen, not ringgit)
- [ ] Decimal library integrated
- [ ] Audit fields on all financial tables
- [ ] Date formatting utility with Malaysian locale
- [ ] LHDN e-invoice data fields in model (even if not used yet)

### Phase 2 Warnings

**Feature decision point:** Financial features are added. Override culture and rounding issues emerge here.

**Must have before Phase 3:**
- [ ] Export validation tests
- [ ] Rounding policy documented and implemented
- [ ] Override workflow with approval
- [ ] Property state machine implemented

### Phase 3 Warnings

**Integration decision point:** Data moves between systems. Import/export quality determines long-term success.

**Must have before v2:**
- [ ] Import preview and validation
- [ ] Export integrity verification
- [ ] Notification preferences system

---

## Summary: Non-Negotiable Anti-Patterns

These patterns **must never appear** in this codebase:

| Anti-Pattern | Correct Pattern |
|--------------|-----------------|
| `const amount = 1500.50` | `const amountSen = 150050` |
| `parseFloat(userInput)` | `parseCurrency(userInput)` |
| `new Date(dateString)` | `dayjs(dateString, 'DD/MM/YYYY')` |
| `DELETE FROM payments` | `UPDATE payments SET deletedAt = now()` |
| `amount.toFixed(2)` | `formatCurrency(amount)` |
| No `createdBy` on records | Automatic audit fields |

---

## Sources

- **Malaysian Compliance:** JomeInvoice LHDN e-Invoice Guide (March 2026), e-Invoice Specific Guideline v4.6 (January 2026)
- **Property Management Software:** ExactEstate "Why Property Management Software Fails" (March 2026)
- **Excel Integration:** Adeptia "Why Excel Is Still a Data Integration Challenge" (August 2025)
- **Currency Handling:** JavaScript Money Libraries Comparison (Medium, December 2024), Atomic Spin "Floating Point Numbers & Currency Rounding Errors" (2014)
- **General Software:** TransAlta $24M Excel error (referenced in insightsoftware blog)
