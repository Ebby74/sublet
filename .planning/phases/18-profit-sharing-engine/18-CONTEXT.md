# Phase 18: Profit Sharing Engine - Research Context

**Phase:** 18  
**Domain:** Financial calculations - Profit attribution and split for JV stakeholders  
**Confidence:** HIGH (existing infrastructure verified)

---

## Summary

Phase 18 builds on existing JV and financial infrastructure to calculate profit sharing. The profit sharing engine computes net profit per property (revenue - expenses), applies configured split percentages, and generates payout summaries for JV stakeholders.

**Primary recommendation:** Extend Property model with `jvSplit` field, then create profit calculation service that aggregates revenue/expenses by property and applies splits.

---

## Existing Infrastructure (VERIFIED)

### Financial Models
- **Payment model** - Income and expense transactions with `incomeSource` field (added Phase 8)
- **incomeSource values:** `sublet`, `autoren_sell`, `autoren_rent`
- **Payment types:** `income` (revenue), `expense`
- **Amount field:** `amountSen` - stored in sen (cents) to avoid floating point

### JV Infrastructure (Existing)
- **User.role** - Includes `jv` value for stakeholder access
- **User.jvProperties** - JSON array of assigned property IDs
- **Property.jvStakeholderId** - Links property to JV partner
- **Existing API routes:**
  - `/api/v1/jv/properties` - List assigned properties
  - `/api/v1/jv/reports/income` - Income by property  
  - `/api/v1/jv/reports/expenses` - Expenses by property

### Profit Calculation Patterns (from legacy export-reports.ts)
- Profit = Collection (revenue) - Bills (expenses)
- Split percentages stored per property (hardcoded: 80% for KERAMAT, 75% for others)
- Calculation: `jvAmount = Math.round(profit * split)`
- Remaining = `profit - jvAmount` (owner's share)

---

## What's Needed for Phase 18

### 1. Property Split Configuration
Currently no `jvSplit` field in Property model.

```
Property model needs:
  jvSplit Float?  // e.g., 0.80 for 80/20 split
```

### 2. Profit Attribution
Need to calculate per-property profit:
- Get all revenue payments for property's leases
- Get all expense payments for property's leases
- Net profit = Revenue - Expenses

### 3. Split Calculation
For each property with JV stakeholder + split:
```
jvShare = Math.round(netProfit * jvSplit)
ownerShare = netProfit - jvShare
```

### 4. Report Generation
Monthly/quarterly summaries showing:
- Total revenue by property
- Total expenses by property
- Net profit by property
- JV share calculation
- Payout schedule

---

## Architecture Pattern

### Service: `profit-sharing-service.ts`

```typescript
interface PropertyProfit {
  propertyId: string;
  propertyName: string;
  jvStakeholderId: string | null;
  jvSplit: number | null;  // e.g., 0.8
  revenueSen: number;
  expensesSen: number;
  netProfitSen: number;
  jvShareSen: number | null;  // calculated if jvSplit set
  ownerShareSen: number | null;
}

interface ProfitSharingReport {
  userId: string;
  dateRange: { startDate: string; endDate: string };
  properties: PropertyProfit[];
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalJvShare: number;
  totalOwnerShare: number;
}

// Main function
async function getProfitSharingReport(
  userId: string, 
  dateRange?: { startDate: Date; endDate: Date }
): Promise<ProfitSharingReport>
```

### API Routes
- `GET /api/v1/jv/reports/profit-sharing` - Main profit sharing report

---

## Key Decisions Needed

| Decision | Options | Recommendation |
|----------|---------|--------------|
| Store split on | Property model, separate table, config | Property.jvSplit (per-property granularity) |
| Default split | None (required for JV), 0.5, 0.75 | No default - require explicit split |
| Negative profit | Show as 0, show negative | Show negative (transparency) |
| Payment frequency | Monthly schedule, on-demand | Monthly with scheduled API |

---

## Dependencies

| Depends On | What It Provides |
|------------|-----------------|
| Phase 17 (JV Portal) | JV role, property assignment, existing JV reports |
| Phase 15 (revenue tracking) | Payment data with incomeSource |
| Phase 8 (expense allocation) | Expense attribution by income source |

---

## Open Questions

1. **Should jvSplit be required or optional?**
   - If required, all JV properties must have split configured
   - If optional, show profit without split calculation

2. **How to handle expenses that span multiple properties?**
   - Current: Expenses linked to lease → property
   - If expense not linked, how to allocate?

3. **Payment scheduling:**
   - Manual payout (admin-initiated)
   - Automated scheduled reports

---

## File Locations

| File | Purpose |
|------|---------|
| `src/services/profit-sharing-service.ts` | New - Main calculation logic |
| `src/app/api/v1/jv/reports/profit-sharing/route.ts` | New - API endpoint |
| `prisma/schema.prisma` | Add jvSplit field |

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| JV infrastructure | HIGH | Verified existing API routes and User/Property fields |
| Profit calculation pattern | HIGH | Uses existing revenue/expense aggregation |
| Split logic | HIGH | Based on verified legacy export-reports.ts pattern |
| Report structure | MEDIUM | New - needs design decisions |

---

**Research completed:** 2026-04-23
**Valid until:** 90 days (technology stable)